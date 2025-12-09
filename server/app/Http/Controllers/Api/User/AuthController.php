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
        $v = Validator::make($req->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'referral_code' => 'nullable|string|exists:referral_codes,referral_code'
        ]);

        if ($v->fails()) {
            Log::error('REGISTER VALIDATION FAILED', $v->errors()->toArray());
            
            if ($v->errors()->has('email')) {
                return response()->json([
                    'message' => 'This email is already registered. Please login instead.',
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
            'referred_by_code' => $req->referral_code, // Store referral code
        ]);
        
        // Send email verification
        event(new Registered($user));
        $user->sendEmailVerificationNotification();

        // Process referral if code was provided
        if ($req->referral_code) {
            $this->processReferral($user, $req->referral_code);
        }

        Log::info('✅ [REGISTER] User registered successfully', [
            'user_id' => $user->id,
            'email' => $user->email,
            'has_referral' => !empty($req->referral_code)
        ]);

        return response()->json([
            'message' => 'Registration successful! Please check your email to verify your account.',
            'email' => $user->email,
            'email_verification_sent' => true,
        ], 201); 
    }

public function login(Request $req)
{
    Log::info('🔹 [LOGIN] Endpoint hit', ['email' => $req->input('email')]);

    $credentials = $req->only('email', 'password');

    try {
        if (!$token = JWTAuth::attempt($credentials)) {
            Log::warning('⚠️ [LOGIN] Invalid credentials', ['email' => $req->input('email')]);
            return response()->json([
                'message' => 'Invalid email or password. Please try again.'
            ], 401);
        }
    } catch (JWTException $e) {
        Log::error('❌ [LOGIN] JWTException while creating token', [
            'email' => $req->input('email'),
            'message' => $e->getMessage()
        ]);
        return response()->json([
            'message' => 'Could not create token. Please try again later.'
        ], 500);
    }

    $user = auth()->user();

    if (!$user) {
        Log::error('❌ [LOGIN] Token generated but no authenticated user', [
            'email' => $req->input('email'),
        ]);
        return response()->json([
            'message' => 'Authentication failed. Please try again.'
        ], 500);
    }

    // Check if email is verified
    if (!$user->hasVerifiedEmail()) {
        // ✅ Only invalidate if token exists
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
            'message' => 'Please verify your email address before logging in. Check your inbox for the verification link.',
            'email_verified' => false,
            'email' => $user->email
        ], 403);
    }

    Log::info('✅ [LOGIN] Successful login', [
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
            : response()->json(['message' => 'Unable to send reset link. Please try again.'], 422);
    }

    public function redirectToGoogle(Request $request)
    {
        Log::info('🔗 [GOOGLE] Redirecting to Google OAuth');
        
        // Store referral code in session if provided
        if ($request->has('ref')) {
            session(['pending_referral_code' => $request->ref]);
            Log::info('📌 [GOOGLE] Referral code stored in session', ['code' => $request->ref]);
        }
        
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback()
    {
        Log::info('🔵 [GOOGLE CALLBACK] Callback received from Google');
        
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            Log::info('✅ [GOOGLE AUTH] User fetched successfully', [
                'email' => $googleUser->getEmail(),
                'name' => $googleUser->getName(),
                'google_id' => $googleUser->getId(),
            ]);
        } catch (\Exception $e) {
            Log::error('❌ [GOOGLE AUTH] Failed to fetch user from Google', [
                'error' => $e->getMessage(),
            ]);
            
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect($frontendUrl . '/user/auth/login?error=oauth_failed');
        }

        // Get referral code from session if exists
        $referralCode = session('pending_referral_code');

        // Find or create user
        $user = User::where('email', $googleUser->getEmail())->first();
        
        if ($user) {
            // Existing user - update google_id if not set
            if (!$user->google_id) {
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'email_verified_at' => now()
                ]);
                Log::info('🔄 [GOOGLE AUTH] Updated existing user with google_id', ['user_id' => $user->id]);
            }
        } else {
            // New user - create with referral code if provided
            $user = User::create([
                'name' => $googleUser->getName() ?? $googleUser->getNickname() ?? 'User',
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'password' => null,
                'email_verified_at' => now(),
                'referred_by_code' => $referralCode, // Store referral code
            ]);

            // Process referral if code was provided
            if ($referralCode) {
                $this->processReferral($user, $referralCode);
                session()->forget('pending_referral_code'); // Clear session
            }

            Log::info('✅ [GOOGLE AUTH] New user created', [
                'user_id' => $user->id,
                'has_referral' => !empty($referralCode)
            ]);
        }

        // Generate JWT token
        try {
            $token = JWTAuth::fromUser($user);
            
            Log::info('✅ [GOOGLE AUTH] Token generated successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('❌ [GOOGLE AUTH] Failed to generate token', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);
            
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect($frontendUrl . '/user/auth/login?error=token_generation_failed');
        }

        // Redirect to frontend callback
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        $callbackUrl = $frontendUrl . '/user/auth/callback?token=' . $token;
        
        Log::info('🟢 [GOOGLE AUTH] Redirecting to frontend callback', [
            'user_id' => $user->id,
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

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Password reset successfully'], 200);
        }

        return response()->json(['message' => 'Invalid reset token or email'], 400);
    }
    
    public function resendVerification(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        
        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            return response()->json([
                'message' => 'No account found with this email address.'
            ], 404);
        }
        
        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'This email is already verified. You can login now.'
            ], 200);
        }
        
        $user->sendEmailVerificationNotification();
        
        return response()->json([
            'message' => 'Verification email has been resent. Please check your inbox.'
        ], 200);
    }

    /**
     * Process referral when user registers
     */
    private function processReferral(User $user, string $referralCode)
    {
        $referralCodeRecord = ReferralCode::where('referral_code', $referralCode)->first();

        if (!$referralCodeRecord) {
            Log::warning('⚠️ [REFERRAL] Invalid referral code', ['code' => $referralCode]);
            return;
        }

        // Create referral history record
        ReferralHistory::create([
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

        Log::info('✅ [REFERRAL] Referral processed', [
            'referrer_id' => $referralCodeRecord->user_id,
            'referred_user_id' => $user->id,
            'code' => $referralCode
        ]);
    }
}