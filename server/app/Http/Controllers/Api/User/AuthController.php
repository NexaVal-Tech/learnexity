<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ReferralCode;
use App\Models\ReferralHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Socialite;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(Request $req)
    {
        Log::info('📝 [REGISTER] Registration attempt', [
            'email' => $req->email,
            'has_referral' => !empty($req->referral_code),
            'referral_code' => $req->referral_code
        ]);

        $v = Validator::make($req->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'phone' => 'nullable|string',
            'referral_code' => 'nullable|string|exists:referral_codes,referral_code'
        ]);

        if ($v->fails()) {
            Log::error('❌ [REGISTER] Validation failed', $v->errors()->toArray());
            
            if ($v->errors()->has('email')) {
                return response()->json([
                    'message' => 'This email is already registered. Please login instead.',
                    'errors' => $v->errors()
                ], 422);
            }

            if ($v->errors()->has('referral_code')) {
                return response()->json([
                    'message' => 'Invalid referral code. Please check and try again.',
                    'errors' => $v->errors()
                ], 422);
            }
            
            return response()->json([
                'message' => 'Validation failed. Please check your input.',
                'errors' => $v->errors()
            ], 422);
        }

        // Create user with referral code if provided
        $user = User::create([
            'name' => $req->name,
            'email' => $req->email,
            'password' => Hash::make($req->password),
            'phone' => $req->phone,
            'referred_by_code' => $req->referral_code,
        ]);
        
        Log::info('✅ [REGISTER] User created', [
            'user_id' => $user->id,
            'email' => $user->email,
            'referred_by_code' => $user->referred_by_code
        ]);

        // Send email verification
        event(new Registered($user));
        $user->sendEmailVerificationNotification();

        // Process referral if code was provided
        if ($req->referral_code) {
            $this->processReferral($user, $req->referral_code);
        }

        Log::info('✅ [REGISTER] Registration completed successfully', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        return response()->json([
            'message' => 'Registration successful! Please check your email to verify your account.',
            'email' => $user->email,
            'email_verification_sent' => true,
        ], 201); 
    }

    public function login(Request $req)
    {
        Log::info('🔹 [LOGIN] Login attempt', ['email' => $req->input('email')]);

        $credentials = $req->only('email', 'password');

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                Log::warning('⚠️ [LOGIN] Invalid credentials', ['email' => $req->input('email')]);
                return response()->json([
                    'message' => 'Invalid email or password. Please try again.'
                ], 401);
            }
        } catch (JWTException $e) {
            Log::error('❌ [LOGIN] JWTException', [
                'email' => $req->input('email'),
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Could not create token. Please try again later.'
            ], 500);
        }

        $user = auth()->user();

        if (!$user) {
            Log::error('❌ [LOGIN] No authenticated user', ['email' => $req->input('email')]);
            return response()->json([
                'message' => 'Authentication failed. Please try again.'
            ], 500);
        }

        // Check if email is verified
        if (!$user->hasVerifiedEmail()) {
            if ($token) {
                try {
                    JWTAuth::invalidate($token);
                } catch (\Exception $e) {
                    Log::warning('⚠️ [LOGIN] Failed to invalidate token', [
                        'user_id' => $user->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            Log::warning('⚠️ [LOGIN] Email not verified', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);

            return response()->json([
                'message' => 'Please verify your email address before logging in.',
                'email_verified' => false,
                'email' => $user->email
            ], 403);
        }

        Log::info('✅ [LOGIN] Login successful', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token
        ]);
    }

    public function logout()
    {
        $token = JWTAuth::getToken();
        if ($token) JWTAuth::invalidate($token);
        
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me()
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            return response()->json($user);
        } catch(\Exception $e) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
    }

    public function sendResetLink(Request $r)
    {
        $r->validate(['email' => 'required|email']);
        $status = Password::sendResetLink($r->only('email'));
        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => 'Password reset link sent to your email.'])
            : response()->json(['message' => 'Unable to send reset link.'], 422);
    }

    public function redirectToGoogle(Request $request)
    {
        Log::info('🔗 [GOOGLE] Redirecting to Google OAuth', [
            'has_ref' => $request->has('ref'),
            'ref_code' => $request->ref
        ]);
        
        // Store referral code in session if provided
        if ($request->has('ref')) {
            session(['pending_referral_code' => $request->ref]);
            Log::info('📌 [GOOGLE] Referral code stored in session', ['code' => $request->ref]);
        }
        
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback()
    {
        Log::info('🔵 [GOOGLE CALLBACK] Callback received');
        
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            Log::info('✅ [GOOGLE] User fetched from Google', [
                'email' => $googleUser->getEmail(),
                'name' => $googleUser->getName(),
                'google_id' => $googleUser->getId(),
            ]);
        } catch (\Exception $e) {
            Log::error('❌ [GOOGLE] Failed to fetch user', [
                'error' => $e->getMessage(),
            ]);
            
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect($frontendUrl . '/user/auth/login?error=oauth_failed');
        }

        // Get referral code from session
        $referralCode = session('pending_referral_code');
        
        Log::info('🔍 [GOOGLE] Checking for referral code', [
            'has_referral_in_session' => !empty($referralCode),
            'referral_code' => $referralCode
        ]);

        // Find or create user
        $user = User::where('email', $googleUser->getEmail())->first();
        
        if ($user) {
            // Existing user
            if (!$user->google_id) {
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'email_verified_at' => now()
                ]);
                Log::info('🔄 [GOOGLE] Updated existing user with google_id', ['user_id' => $user->id]);
            }
            
            Log::info('✅ [GOOGLE] Existing user logged in', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);
        } else {
            // New user - create with referral code
            $user = User::create([
                'name' => $googleUser->getName() ?? $googleUser->getNickname() ?? 'User',
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'password' => null,
                'email_verified_at' => now(),
                'referred_by_code' => $referralCode,
            ]);

            Log::info('✅ [GOOGLE] New user created', [
                'user_id' => $user->id,
                'email' => $user->email,
                'referred_by_code' => $user->referred_by_code
            ]);

            // Process referral if code was provided
            if ($referralCode) {
                $this->processReferral($user, $referralCode);
                session()->forget('pending_referral_code');
                Log::info('🎉 [GOOGLE] Referral processed and session cleared');
            }
        }

        // Generate JWT token
        try {
            $token = JWTAuth::fromUser($user);
            
            Log::info('✅ [GOOGLE] Token generated', [
                'user_id' => $user->id,
            ]);
        } catch (\Exception $e) {
            Log::error('❌ [GOOGLE] Failed to generate token', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);
            
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect($frontendUrl . '/user/auth/login?error=token_failed');
        }

        // Redirect to frontend callback
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        $callbackUrl = $frontendUrl . '/user/auth/callback?token=' . $token;
        
        Log::info('🟢 [GOOGLE] Redirecting to frontend', [
            'user_id' => $user->id,
            'callback_url' => $callbackUrl
        ]);

        return redirect($callbackUrl);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->save();
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => 'Password reset successfully'], 200)
            : response()->json(['message' => 'Invalid reset token or email'], 400);
    }
    
    public function resendVerification(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        
        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            return response()->json([
                'message' => 'No account found with this email.'
            ], 404);
        }
        
        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'This email is already verified.'
            ], 200);
        }
        
        $user->sendEmailVerificationNotification();
        
        return response()->json([
            'message' => 'Verification email sent.'
        ], 200);
    }

    /**
     * Process referral when user registers
     */
    private function processReferral(User $user, string $referralCode)
    {
        Log::info('🎯 [REFERRAL] Processing referral', [
            'referred_user_id' => $user->id,
            'referral_code' => $referralCode
        ]);

        $referralCodeRecord = ReferralCode::where('referral_code', $referralCode)->first();

        if (!$referralCodeRecord) {
            Log::warning('⚠️ [REFERRAL] Invalid referral code', [
                'code' => $referralCode,
                'user_id' => $user->id
            ]);
            return;
        }

        // Check if referral already exists
        $existingReferral = ReferralHistory::where('referred_user_id', $user->id)->first();
        
        if ($existingReferral) {
            Log::warning('⚠️ [REFERRAL] Referral already exists', [
                'user_id' => $user->id,
                'existing_referral_id' => $existingReferral->id
            ]);
            return;
        }

        // Create referral history record
        $referralHistory = ReferralHistory::create([
            'referrer_id' => $referralCodeRecord->user_id,
            'referred_user_id' => $user->id,
            'status' => 'pending',
            'reward_amount' => 30.00,
            'referred_at' => now(),
        ]);

        // Update referral code stats
        $referralCodeRecord->increment('total_referrals');
        $referralCodeRecord->increment('pending_referrals');
        $referralCodeRecord->update(['last_referral_at' => now()]);

        Log::info('✅ [REFERRAL] Referral processed successfully', [
            'referrer_id' => $referralCodeRecord->user_id,
            'referred_user_id' => $user->id,
            'referral_history_id' => $referralHistory->id,
            'code' => $referralCode
        ]);
    }
}