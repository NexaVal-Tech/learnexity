<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PublicReferrer;
use App\Models\ReferralCode;
use App\Models\ReferralHistory;
use App\Models\RegistrationOtp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Socialite;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log;
use App\Models\EmailSequenceLog;
use App\Models\CourseEnrollment;
use App\Models\SprintProgress;
use App\Models\CourseMaterial;
use App\Mail\LoginWelcomeBackMail;
use App\Mail\AdminNewStudentMail;
use App\Mail\RegistrationOtpMail;
use App\Services\UserPerformanceTracker;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    private const OTP_TTL_MINUTES   = 10;
    private const TOKEN_TTL_MINUTES = 15;
    private const MAX_OTP_ATTEMPTS  = 5;
    private const RESEND_COOLDOWN_S = 45;
    private const MAX_RESENDS       = 6;

    /**
     * STEP 1 — person submits only their email (+ optional referral code).
     * We validate it's not already registered, then email a 6-digit OTP.
     */
    public function sendRegistrationOtp(Request $req)
    {
        Log::info('📝 [REGISTER-OTP] Send OTP attempt', [
            'email'        => $req->email,
            'has_referral' => !empty($req->referral_code),
        ]);

        $v = Validator::make($req->all(), [
            'email'         => 'required|email|max:255|unique:users,email',
            'referral_code' => [
                'nullable',
                'string',
                function ($attribute, $value, $fail) {
                    if ($value) {
                        $inStudentCodes    = ReferralCode::where('referral_code', $value)->exists();
                        $inPublicReferrers = PublicReferrer::where('referral_code', $value)->exists();
                        if (!$inStudentCodes && !$inPublicReferrers) {
                            $fail('Invalid referral code. Please check and try again.');
                        }
                    }
                },
            ],
        ]);

        if ($v->fails()) {
            Log::error('❌ [REGISTER-OTP] Validation failed', $v->errors()->toArray());

            if ($v->errors()->has('email')) {
                return response()->json([
                    'message' => 'This email is already registered. Please login instead.',
                    'errors'  => $v->errors(),
                ], 422);
            }
            return response()->json([
                'message' => $v->errors()->first(),
                'errors'  => $v->errors(),
            ], 422);
        }

        return $this->issueOtp($req->email, $req->referral_code);
    }

    /**
     * Resend OTP for an email that already has a pending registration.
     */
    public function resendRegistrationOtp(Request $req)
    {
        $req->validate(['email' => 'required|email']);

        $record = RegistrationOtp::where('email', $req->email)->first();
        if (!$record) {
            return response()->json([
                'message' => 'No pending registration found for this email. Please start again.',
            ], 404);
        }

        return $this->issueOtp($record->email, $record->referral_code, $record);
    }

    private function issueOtp(string $email, ?string $referralCode, ?RegistrationOtp $record = null)
    {
        $record = $record ?: RegistrationOtp::where('email', $email)->first();

        if ($record && $record->last_sent_at && $record->last_sent_at->addSeconds(self::RESEND_COOLDOWN_S)->isFuture()) {
            $wait = now()->diffInSeconds($record->last_sent_at->addSeconds(self::RESEND_COOLDOWN_S));
            return response()->json([
                'message'     => "Please wait {$wait}s before requesting another code.",
                'retry_after' => $wait,
            ], 429);
        }

        if ($record && $record->resend_count >= self::MAX_RESENDS) {
            return response()->json([
                'message' => 'Too many code requests. Please try again later.',
            ], 429);
        }

        $otp = (string) random_int(100000, 999999);

        RegistrationOtp::updateOrCreate(
            ['email' => $email],
            [
                'referral_code'    => $referralCode,
                'otp_hash'         => Hash::make($otp),
                'attempts'         => 0,
                'expires_at'       => now()->addMinutes(self::OTP_TTL_MINUTES),
                'verified_at'      => null,
                'token_hash'       => null,
                'token_expires_at' => null,
                'resend_count'     => $record ? $record->resend_count + 1 : 0,
                'last_sent_at'     => now(),
            ]
        );

        try {
            Mail::to($email)->queue(new RegistrationOtpMail($otp));
        } catch (\Exception $e) {
            Log::error('❌ [REGISTER-OTP] Failed to send OTP email', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Could not send verification email. Please try again.'], 500);
        }

        Log::info('✅ [REGISTER-OTP] OTP sent', ['email' => $email]);

        return response()->json(['message' => 'Verification code sent to your email.']);
    }

    /**
     * STEP 2 — verify the 6-digit code. On success, issue a short-lived
     * registration_token used to authorize the password step.
     */
    public function verifyRegistrationOtp(Request $req)
    {
        $req->validate([
            'email' => 'required|email',
            'otp'   => 'required|digits:6',
        ]);

        $record = RegistrationOtp::where('email', $req->email)->first();

        if (!$record || $record->expires_at->isPast()) {
            Log::warning('⚠️ [REGISTER-OTP] Code expired or not found', ['email' => $req->email]);
            return response()->json(['message' => 'Code expired or not found. Please request a new code.'], 422);
        }

        if ($record->attempts >= self::MAX_OTP_ATTEMPTS) {
            return response()->json(['message' => 'Too many incorrect attempts. Please request a new code.'], 422);
        }

        if (!Hash::check($req->otp, $record->otp_hash)) {
            $record->increment('attempts');
            $remaining = self::MAX_OTP_ATTEMPTS - $record->attempts;
            Log::warning('⚠️ [REGISTER-OTP] Incorrect code', ['email' => $req->email, 'remaining' => $remaining]);
            return response()->json([
                'message' => "Incorrect code. {$remaining} attempt(s) remaining.",
            ], 422);
        }

        $token = Str::random(64);

        $record->update([
            'verified_at'      => now(),
            'token_hash'       => Hash::make($token),
            'token_expires_at' => now()->addMinutes(self::TOKEN_TTL_MINUTES),
            'attempts'         => 0,
        ]);

        Log::info('✅ [REGISTER-OTP] Email verified', ['email' => $req->email]);

        return response()->json([
            'message'            => 'Email verified.',
            'registration_token' => $token,
        ]);
    }

    /**
     * STEP 3 — set password + accept terms. Creates the account.
     * Name/phone stay unset here — your profile setup flow fills those in
     * later and is where the welcome email should fire from.
     */
    public function completeRegistration(Request $req)
    {
        $req->validate([
            'email'              => 'required|email',
            'registration_token' => 'required|string',
            'password'           => ['required', 'confirmed', 'min:8', 'regex:/[A-Za-z]/', 'regex:/[0-9]/'],
            'terms_accepted'     => 'required|accepted',
        ]);

        $record = RegistrationOtp::where('email', $req->email)->first();

        if (
            !$record ||
            !$record->verified_at ||
            !$record->token_hash ||
            !$record->token_expires_at ||
            $record->token_expires_at->isPast() ||
            !Hash::check($req->registration_token, $record->token_hash)
        ) {
            Log::warning('⚠️ [REGISTER-COMPLETE] Invalid or expired registration session', ['email' => $req->email]);
            return response()->json([
                'message' => 'Your verification session has expired. Please verify your email again.',
            ], 422);
        }

        if (User::where('email', $record->email)->exists()) {
            $record->delete();
            return response()->json(['message' => 'This email is already registered. Please login instead.'], 422);
        }

        // Placeholder name from email local-part — overwritten by your
        // existing profile-setup flow.
        $placeholderName = explode('@', $record->email)[0];

        $user = User::create([
            'name'              => $placeholderName,
            'email'             => $record->email,
            'password'          => Hash::make($req->password),
            'referred_by_code'  => $record->referral_code,
            'email_verified_at' => now(), // OTP already proved ownership
            'terms_accepted_at' => now(),
        ]);

        Log::info('✅ [REGISTER-COMPLETE] User created via OTP flow', [
            'user_id'          => $user->id,
            'email'            => $user->email,
            'referred_by_code' => $user->referred_by_code,
        ]);

        $referralCode = $record->referral_code;
        $record->delete();

        // ── Notify admin of new registration (unchanged behavior) ──────────
        dispatch(function () use ($user, $referralCode) {
            try {
                $adminEmail = env('ADMIN_NOTIFICATION_EMAIL');
                if (!$adminEmail) {
                    Log::warning('⚠️ [REGISTER-COMPLETE] ADMIN_NOTIFICATION_EMAIL not set');
                    return;
                }

                Mail::to($adminEmail)->queue(
                    new AdminNewStudentMail($user, null, $referralCode)
                );

                Log::info('✅ [REGISTER-COMPLETE] Admin notification queued', ['user_id' => $user->id]);
            } catch (\Exception $e) {
                Log::error('❌ [REGISTER-COMPLETE] Admin notification failed', ['error' => $e->getMessage()]);
            }
        })->afterResponse();
        // ── END admin notify ─────────────────────────────────────────────────

        // Referral processing — identical logic to your existing method
        if ($referralCode) {
            $this->processReferral($user, $referralCode);
        }

        $token = JWTAuth::fromUser($user);

        Log::info('✅ [REGISTER-COMPLETE] Registration completed successfully', [
            'user_id' => $user->id,
            'email'   => $user->email,
        ]);

        \App\Services\ActivityLogger::log(
            'user.registered',
            "{$user->name} created an account",
            actorType: 'user',
            actorId: $user->id,
            actorName: $user->name,
            request: $req
        );

        return response()->json([
            'message' => 'Registration successful!',
            'user'    => $user,
            'token'   => $token,
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
            'email'   => $user->email,
        ]);

        try {
            app(UserPerformanceTracker::class)->onLogin($user->id);
        } catch (\Exception $e) {
            Log::error('❌ Performance tracker onLogin failed', ['error' => $e->getMessage()]);
        }

        \App\Services\ActivityLogger::log(
            'user.login',
            "{$user->name} logged in",
            actorType: 'user',
            actorId: $user->id,
            actorName: $user->name,
            request: $req
        );

        dispatch(function () use ($user) {
            try {
                if (EmailSequenceLog::sentTodayFor($user->id, 'login_welcome_back')) {
                    return;
                }

                $enrollments = CourseEnrollment::where('user_id', $user->id)
                    ->where('payment_status', 'completed')
                    ->get();

                if ($enrollments->isEmpty()) return;

                $courseProgress = $enrollments->map(function ($e) use ($user) {
                    $totalSprints     = CourseMaterial::where('course_id', $e->course_id)->count();
                    $completedSprints = SprintProgress::where('user_id', $user->id)
                        ->where('course_id', $e->course_id)
                        ->where('progress_percentage', 100)
                        ->count();

                    return [
                        'name'     => $e->course_name ?? "Course #{$e->course_id}",
                        'progress' => $totalSprints > 0 ? round(($completedSprints / $totalSprints) * 100) : 0,
                    ];
                })->toArray();

                $streak = \App\Models\UserPerformanceScore::where('user_id', $user->id)
                    ->max('login_streak_days') ?? 0;

                Mail::to($user->email)->queue(
                    new LoginWelcomeBackMail($user, $streak, $courseProgress)
                );

                EmailSequenceLog::record($user->id, 'login_welcome_back', null, [
                    'streak' => $streak,
                ]);

                Log::info('✅ Login welcome-back email queued', ['user_id' => $user->id]);
            } catch (\Exception $e) {
                Log::error('❌ Login welcome-back email failed', ['error' => $e->getMessage()]);
            }
        })->afterResponse();

        return response()->json([
            'message' => 'Login successful',
            'user'    => $user,
            'token'   => $token,
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
        Log::info('🔐 [PASSWORD RESET] Reset link request', ['email' => $r->email]);

        $r->validate(['email' => 'required|email']);

        $user = User::where('email', $r->email)->first();
        if (!$user) {
            Log::warning('⚠️ [PASSWORD RESET] Email not found', ['email' => $r->email]);
            return response()->json([
                'message' => 'If an account exists with this email, you will receive a password reset link.'
            ], 200);
        }

        Log::info('✅ [PASSWORD RESET] User found, sending reset link', [
            'user_id' => $user->id,
            'email' => $user->email
        ]);

        try {
            $status = Password::sendResetLink($r->only('email'));

            Log::info('📧 [PASSWORD RESET] Password facade response', [
                'status' => $status,
                'is_sent' => $status === Password::RESET_LINK_SENT
            ]);

            if ($status === Password::RESET_LINK_SENT) {
                return response()->json([
                    'message' => 'Password reset link sent to your email.'
                ], 200);
            }

            Log::error('❌ [PASSWORD RESET] Failed to send', [
                'status' => $status,
                'email' => $r->email
            ]);

            return response()->json([
                'message' => 'Unable to send reset link. Please try again later.'
            ], 422);

        } catch (\Exception $e) {
            Log::error('❌ [PASSWORD RESET] Exception occurred', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'An error occurred. Please try again later.'
            ], 500);
        }
    }

    public function redirectToGoogle(Request $request)
    {
        Log::info('🔗 [GOOGLE] Redirecting to Google OAuth', [
            'has_ref'  => $request->has('ref'),
            'ref_code' => $request->ref,
        ]);

        if ($request->has('ref')) {
            session(['pending_referral_code' => $request->ref]);
            Log::info('📌 [GOOGLE] Referral code stored in session', ['code' => $request->ref]);
        }
        if ($request->has('scholarship_redirect')) {
            session(['scholarship_redirect' => $request->scholarship_redirect]);
        }
        if ($request->has('scholarship_browse_courses')) {
            session(['scholarship_browse_courses' => $request->scholarship_browse_courses]);
        }
        if ($request->has('intended_course')) {
            session(['intended_course' => $request->intended_course]);
        }

        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback()
    {
        Log::info('🔵 [GOOGLE CALLBACK] Callback received');

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        $isProduction = app()->environment('production');

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            Log::info('✅ [GOOGLE] User fetched from Google', [
                'email' => $googleUser->getEmail(),
                'name' => $googleUser->getName(),
                'google_id' => $googleUser->getId(),
            ]);
        } catch (\Exception $e) {
            Log::error('❌ [GOOGLE] Failed to fetch user', ['error' => $e->getMessage()]);
            return redirect($frontendUrl . '/user/auth/login?error=oauth_failed');
        }

        $referralCode = session('pending_referral_code');
        Log::info('🔍 [GOOGLE] Checking for referral code', [
            'has_referral_in_session' => !empty($referralCode),
            'referral_code' => $referralCode
        ]);

        $user = User::where('email', $googleUser->getEmail())->first();
        if ($user) {
            if (!$user->google_id) {
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'email_verified_at' => now()
                ]);
                Log::info('🔄 [GOOGLE] Updated existing user with google_id', ['user_id' => $user->id]);
            }
            Log::info('✅ [GOOGLE] Existing user logged in', ['user_id' => $user->id]);
        } else {
            $user = User::create([
                'name'              => $googleUser->getName() ?? $googleUser->getNickname() ?? 'User',
                'email'             => $googleUser->getEmail(),
                'google_id'         => $googleUser->getId(),
                'password'          => null,
                'email_verified_at' => now(),
                'referred_by_code'  => $referralCode,
            ]);

            Log::info('✅ [GOOGLE] New user created', ['user_id' => $user->id]);

            if ($referralCode) {
                $this->processReferral($user, $referralCode);
                session()->forget('pending_referral_code');
                Log::info('🎉 [GOOGLE] Referral processed and session cleared');
            }

            $capturedReferralCode = $referralCode;
            dispatch(function () use ($user, $capturedReferralCode) {
                try {
                    $adminEmail = env('ADMIN_NOTIFICATION_EMAIL');
                    if (!$adminEmail) {
                        Log::warning('⚠️ [GOOGLE] ADMIN_NOTIFICATION_EMAIL not set');
                        return;
                    }

                    Mail::to($adminEmail)->queue(
                        new AdminNewStudentMail($user, null, $capturedReferralCode)
                    );

                    Log::info('✅ [GOOGLE] Admin notification queued', ['user_id' => $user->id]);
                } catch (\Exception $e) {
                    Log::error('❌ [GOOGLE] Admin notification failed', ['error' => $e->getMessage()]);
                }
            })->afterResponse();
        }

        $token = JWTAuth::fromUser($user);
        $isProduction = app()->environment('production');

        $cookie = cookie(
            'oauth_token',
            $token,
            10,
            '/',
            $isProduction ? '.learnexity.org' : null,
            $isProduction,
            true,
            false,
            $isProduction ? 'None' : 'Lax'
        );

        Log::info('🟢 [GOOGLE] Redirecting to frontend with cookie', ['user_id' => $user->id]);

        return redirect($frontendUrl . '/user/auth/callback')->withCookie($cookie);
    }

    public function exchangeOAuthToken(Request $request)
    {
        Log::info('🍪 [OAUTH EXCHANGE] Cookies received', [
            'cookie_names' => array_keys($request->cookies->all()),
            'has_oauth_token' => $request->cookies->has('oauth_token'),
        ]);

        $oauthToken = $request->cookie('oauth_token');

        if (!$oauthToken) {
            Log::warning('⚠️ [OAUTH EXCHANGE] No oauth_token cookie found', [
                'all_cookies' => array_keys($request->cookies->all()),
            ]);
            return response()->json([
                'message' => 'No authentication token found. Please try signing in again.'
            ], 401);
        }

        try {
            JWTAuth::setToken($oauthToken);
            $user = JWTAuth::authenticate();

            if (!$user) {
                Log::warning('⚠️ [OAUTH EXCHANGE] Token valid but user not found');
                return response()->json(['message' => 'User not found.'], 401);
            }

            JWTAuth::invalidate($oauthToken);
            $newToken = JWTAuth::fromUser($user);

            Log::info('✅ [OAUTH EXCHANGE] Token exchanged successfully', [
                'user_id' => $user->id,
            ]);

            return response()
                ->json([
                    'token' => $newToken,
                    'user'  => $user,
                ])
                ->withCookie(cookie()->forget('oauth_token'));

        } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
            Log::warning('⚠️ [OAUTH EXCHANGE] Cookie token expired');
            return response()->json([
                'message' => 'Authentication session expired. Please sign in again.'
            ], 401);

        } catch (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
            Log::warning('⚠️ [OAUTH EXCHANGE] Cookie token invalid', [
                'token_preview' => substr($oauthToken, 0, 10) . '...',
                'error' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Invalid authentication token.'], 401);

        } catch (\Exception $e) {
            Log::error('❌ [OAUTH EXCHANGE] Exception', [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Authentication failed. Please try again.'], 500);
        }
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
        $studentCode = ReferralCode::where('referral_code', $referralCode)->first();
        if ($studentCode) {
            $existingReferral = ReferralHistory::where('referred_user_id', $user->id)->first();
            if ($existingReferral) return;

            ReferralHistory::create([
                'referrer_id'      => $studentCode->user_id,
                'referred_user_id' => $user->id,
                'status'           => 'pending',
                'reward_amount'    => 30.00,
                'referred_at'      => now(),
            ]);

            $studentCode->increment('total_referrals');
            $studentCode->increment('pending_referrals');
            $studentCode->update(['last_referral_at' => now()]);
            return;
        }

        $publicReferrer = PublicReferrer::where('referral_code', $referralCode)->first();
        if ($publicReferrer) {
            \App\Http\Controllers\Api\PublicReferralController::handleNewSignup($user, $referralCode);
            return;
        }

        Log::warning('⚠️ [REFERRAL] Code not found in either table', [
            'code'    => $referralCode,
            'user_id' => $user->id,
        ]);
    }
}