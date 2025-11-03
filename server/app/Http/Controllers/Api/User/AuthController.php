<?php

namespace App\Http\Controllers\Api\User;
use App\Http\Controllers\Controller;
use App\Models\User;
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
        'password' => 'required|min:8|confirmed'
    ]);

    if ($v->fails()) {
        Log::error('REGISTER VALIDATION FAILED', $v->errors()->toArray());
        return response()->json($v->errors(), 422);
    }

        $user = User::create([
            'name'=>$req->name,
            'email'=>$req->email,
            'password'=>Hash::make($req->password),
        ]);
        event(new Registered($user));

        $user->sendEmailVerificationNotification();

        $token = JWTAuth::fromUser($user);
        return response()->json([
            'user' => $user,
            'token' => $token,
            'email_verification_sent' => true,
        ]); 
    }

    public function login(Request $req)
    {
        Log::info('🔹 [LOGIN] Endpoint hit', ['email' => $req->input('email')]);

        $credentials = $req->only('email', 'password');

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                Log::warning('⚠️ [LOGIN] Invalid credentials', ['email' => $req->input('email')]);
                return response()->json(['error' => 'Invalid credentials'], 401);
            }
        } catch (JWTException $e) {
            Log::error('❌ [LOGIN] JWTException while creating token', [
                'email' => $req->input('email'),
                'message' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Could not create token'], 500);
        }

        $user = auth()->user();

        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'error' => 'Your email has not been verified, Please verify your email before logging in or sign in with Google.',
                'email_verified' => false,
            ], 403);
        }

        if (!$user) {
            Log::error('❌ [LOGIN] Token generated but no authenticated user', [
                'email' => $req->input('email'),
            ]);
            return response()->json(['error' => 'Authentication failed'], 500);
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
        
        return response()->json(['message'=>'logged out']);
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
        $r->validate(['email'=>'required|email']);
        $status = Password::sendResetLink($r->only('email'));
        return $status === Password::RESET_LINK_SENT
            ? response()->json(['status'=>'reset_link_sent'])
            : response()->json(['status'=>'error'], 422);
    }

    public function redirectToGoogle()
    {
        Log::info('🔗 [GOOGLE] Redirecting to Google OAuth');
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
                'trace' => $e->getTraceAsString(),
            ]);
            
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            $redirectUrl = $frontendUrl . '/user/auth/login?error=oauth_failed';
            
            Log::info('🔴 [GOOGLE AUTH] Redirecting to error page', ['url' => $redirectUrl]);
            return redirect($redirectUrl);
        }

        // Find or create user
        $user = User::firstOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name' => $googleUser->getName() ?? $googleUser->getNickname() ?? 'User',
                'google_id' => $googleUser->getId(),
                'password' => null,
                'email_verified_at' => now(),
            ]
        );

        // Update google_id if not set
        if (!$user->google_id) {
            $user->update(['google_id' => $googleUser->getId()]);
            Log::info('🔄 [GOOGLE AUTH] Updated existing user with google_id', ['user_id' => $user->id]);
        }

        // Generate JWT token
        try {
            $token = JWTAuth::fromUser($user);
            
            Log::info('✅ [GOOGLE AUTH] Token generated successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'token_length' => strlen($token),
                'token_preview' => substr($token, 0, 20) . '...',
            ]);
        } catch (\Exception $e) {
            Log::error('❌ [GOOGLE AUTH] Failed to generate token', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);
            
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect($frontendUrl . '/user/auth/login?error=token_generation_failed');
        }

        // Build redirect URL
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        $callbackUrl = $frontendUrl . '/user/auth/callback?token=' . $token;
        
        Log::info('🟢 [GOOGLE AUTH] Redirecting to frontend callback', [
            'frontend_url' => $frontendUrl,
            'full_callback_url' => $callbackUrl,
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

        return response()->json(['error' => 'Invalid reset token'], 400);
    }
}