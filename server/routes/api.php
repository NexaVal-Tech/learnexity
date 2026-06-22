<?php

use App\Models\Consultation;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\User\AuthController;
use App\Http\Controllers\Api\User\CourseController;
use App\Http\Controllers\Api\User\CourseEnrollmentController;
use App\Http\Controllers\Api\User\TrackUpgradeController;
use App\Http\Controllers\Api\User\UserProfileController;
use App\Http\Controllers\Api\User\UserSettingsController;
use App\Http\Controllers\Api\PaystackWebhookController;
use App\Http\Controllers\Api\StripeController;
use App\Http\Controllers\Api\KidsStripeController;
use App\Http\Controllers\Api\KidsPaystackController;
use App\Http\Controllers\Api\CourseResourcesController;
use App\Http\Controllers\Api\AdminCourseResourcesController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminStudentController;
use App\Http\Controllers\Api\AdminCourseController;
use App\Http\Controllers\Api\AdminCourseDetailsController;
use App\Http\Controllers\Api\ReferralController;
use App\Services\LocationService;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\User\ScholarshipController;
use App\Http\Controllers\Api\AdminKidsController;
use App\Http\Controllers\Api\AdminReferralController;
use App\Http\Controllers\Api\AdminScholarshipController;

// ── NEW: Instructor + Student Project imports ──────────────────────────────
use App\Http\Controllers\Api\Instructor\InstructorAuthController;
use App\Http\Controllers\Api\Instructor\InstructorCourseController;
use App\Http\Controllers\Api\AdminInstructorController;
use App\Http\Controllers\Api\User\StudentProjectController;

// Consultation

use App\Http\Controllers\Api\ConsultationController;
use App\Http\Controllers\Api\AdminConsultationController;
use App\Http\Controllers\Api\ConsultationPaymentController;

// =================== CURRENCY DETECTION =================== //

Route::get('/detect-currency', function () {
    $locationInfo = LocationService::getLocationInfo();
    return response()->json([
        'currency'     => $locationInfo['currency'],
        'symbol'       => $locationInfo['symbol'],
        'country'      => $locationInfo['country'],
        'country_code' => $locationInfo['country_code'],
        'ip'           => $locationInfo['ip'],
        'city'         => $locationInfo['city']   ?? null,
        'region'       => $locationInfo['region'] ?? null,
    ]);
});

// =================== EMAIL VERIFICATION =================== //

Route::get('/email/verify/{id}/{hash}', function ($id, $hash, Request $request) {
    $user = User::find($id);
    $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');

    if (!$user) {
        return redirect($frontendUrl . '/user/auth/login?error=user_not_found');
    }
    if (!hash_equals($hash, sha1($user->getEmailForVerification()))) {
        return redirect($frontendUrl . '/user/auth/login?error=invalid_verification_link');
    }
    if ($user->hasVerifiedEmail()) {
        return redirect($frontendUrl . '/user/auth/login?verified=already&email=' . urlencode($user->email));
    }

    $user->markEmailAsVerified();
    return redirect($frontendUrl . '/user/auth/login?verified=success&email=' . urlencode($user->email));
})->name('verification.verify');

Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();
    return response()->json(['message' => 'Verification link resent.']);
})->middleware('jwt.auth')->name('verification.send');

// =================== AUTH ROUTES (throttle:auth — 10/min per IP) =================== //

Route::middleware('throttle:auth')->group(function () {
    Route::post('/register',                  [AuthController::class, 'register']);
    Route::post('/login',                     [AuthController::class, 'login']);
    Route::post('/password/email',            [AuthController::class, 'sendResetLink']);
    Route::post('/password/reset',            [AuthController::class, 'resetPassword']);
    Route::post('/email/resend-verification', [AuthController::class, 'resendVerification']);

    // Instructor auth
    Route::prefix('instructor')->group(function () {
        Route::post('/login',   [InstructorAuthController::class, 'login']);
        Route::post('/refresh', [InstructorAuthController::class, 'refresh']);
    });

    // Admin auth
    Route::prefix('admin')->group(function () {
        Route::post('/login',           [App\Http\Controllers\Api\AdminAuthController::class, 'login']);
        Route::post('/forgot-password', [App\Http\Controllers\Api\AdminAuthController::class, 'forgotPassword']);
        Route::post('/reset-password',  [App\Http\Controllers\Api\AdminAuthController::class, 'resetPassword']);
    });
});

// =================== WEBHOOK ROUTES (throttle:webhooks — no user IP throttle) =================== //

Route::middleware('throttle:webhooks')->group(function () {
    Route::post('/paystack/webhook', [PaystackWebhookController::class, 'handleWebhook']);
    Route::post('/stripe/webhook',   [StripeController::class, 'handleWebhook']);

    // Kids payment webhooks
    Route::post('/kids/stripe/webhook',   [KidsStripeController::class, 'webhook']);
    Route::post('/kids/paystack/webhook', [KidsPaystackController::class, 'webhook']);
});

// =================== GOOGLE OAUTH (no throttle — redirects, not brute-forceable) =================== //

Route::get('/auth/google/redirect', [App\Http\Controllers\Api\User\AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [App\Http\Controllers\Api\User\AuthController::class, 'handleGoogleCallback']);
Route::post('/auth/exchange-token', [App\Http\Controllers\Api\User\AuthController::class, 'exchangeOAuthToken'])
    ->middleware('oauth.csrf.disable');

// =================== REFERRAL VALIDATE (public, light throttle via api) =================== //

Route::middleware('throttle:api')->group(function () {
    Route::post('/referrals/validate', [ReferralController::class, 'validateReferralCode']);
});

// =================== PAYMENT ROUTES (jwt + throttle:payments — 10/min) =================== //

Route::middleware(['jwt.auth', 'throttle:payments'])->group(function () {
    Route::post('/create-stripe-checkout',                      [StripeController::class, 'createCheckoutSession']);
    Route::post('/stripe/verify-session',                       [StripeController::class, 'verifySession']);
    Route::post('/courses/{courseId}/enroll',                   [CourseEnrollmentController::class, 'enroll']);
    Route::patch('/courses/enrollments/{enrollmentId}/payment', [CourseEnrollmentController::class, 'updatePaymentStatus']);
    Route::post('/courses/enrollments/{enrollmentId}/verify-payment', [CourseEnrollmentController::class, 'verifyPaymentStatus']);
});

// =================== PROTECTED USER ROUTES (jwt + throttle:api — 120/min auth, 30/min guest) =================== //

Route::middleware(['jwt.auth', 'throttle:api'])->group(function () {

    Route::get('/me',      [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::prefix('referrals')->group(function () {
        Route::get('/status', [ReferralController::class, 'checkStatus']);
        Route::post('/apply', [ReferralController::class, 'createReferralCode']);
        Route::get('/',       [ReferralController::class, 'getReferralData']);
    });

    Route::prefix('courses')->group(function () {
        Route::get('/enrollments',              [CourseEnrollmentController::class, 'getUserEnrollments']);
        Route::get('/{courseId}/enrollment-status', [CourseEnrollmentController::class, 'checkEnrollmentStatus']);
        Route::get('/{courseId}/check-access',  [CourseEnrollmentController::class, 'checkAccess']);

        Route::prefix('{courseId}/resources')->group(function () {
            Route::get('/',            [CourseResourcesController::class, 'getCourseResources']);
            Route::post('/time-spent', [CourseResourcesController::class, 'updateTimeSpent']);
        });
    });

    Route::prefix('courses/{courseId}/upgrade')->group(function () {
        Route::get('/options',   [TrackUpgradeController::class, 'getUpgradeOptions']);
        Route::post('/initiate', [TrackUpgradeController::class, 'initiateUpgrade']);
    });

    Route::post(
        '/enrollments/{enrollmentId}/finalise-upgrade',
        [TrackUpgradeController::class, 'finaliseUpgrade']
    );

    Route::prefix('materials')->group(function () {
        Route::post('/{itemId}/complete',   [CourseResourcesController::class, 'markItemCompleted']);
        Route::post('/{itemId}/incomplete', [CourseResourcesController::class, 'markItemIncomplete']);
        Route::get('/{itemId}/download',    [CourseResourcesController::class, 'downloadMaterial']);
        Route::get('/{itemId}/preview-url', [CourseResourcesController::class, 'getPreviewUrl']);
        Route::get('/{itemId}/preview',     [CourseResourcesController::class, 'previewMaterial']);
    });

    Route::prefix('scholarships')->group(function () {
        Route::get('/eligibility/{courseId}', [ScholarshipController::class, 'checkEligibility']);
        Route::post('/apply/{courseId}',      [ScholarshipController::class, 'apply']);
        Route::get('/course/{courseId}',      [ScholarshipController::class, 'getForCourse']);
        Route::get('/my-applications',        [ScholarshipController::class, 'myApplications']);
    });

    // ── Student Projects ───────────────────────────────────────────────────
    Route::prefix('student/projects')->group(function () {
        Route::get('/',                       [StudentProjectController::class, 'index']);
        Route::get('/course/{courseId}',      [StudentProjectController::class, 'forCourse']);
        Route::get('/{projectId}/detail',     [StudentProjectController::class, 'show']);
        Route::post('/{projectId}/submit',    [StudentProjectController::class, 'submit']);
        Route::post('/{projectId}/checkin',   [StudentProjectController::class, 'checkin']);
        Route::get('/{projectId}/submissions',[StudentProjectController::class, 'mySubmissions']);
    });

    // student Profile
    Route::prefix('profile')->group(function () {
        Route::get('/',          [UserProfileController::class, 'show']);
        Route::put('/',          [UserProfileController::class, 'update']);
        Route::post('/avatar',   [UserProfileController::class, 'uploadAvatar']);
        Route::delete('/avatar', [UserProfileController::class, 'deleteAvatar']);
        Route::get('/activity',  [UserProfileController::class, 'activityLog']);
    });

    // student Settings
    Route::prefix('settings')->group(function () {
        Route::get('/',                  [UserSettingsController::class, 'show']);
        Route::put('/notifications',     [UserSettingsController::class, 'updateNotifications']);
        Route::put('/privacy',           [UserSettingsController::class, 'updatePrivacy']);
        Route::put('/password',          [UserSettingsController::class, 'changePassword']);
        Route::delete('/account',        [UserSettingsController::class, 'deleteAccount']);
    });
});

Route::middleware('throttle:api')->prefix('consultations')->group(function () {
    Route::get('/pricing',      [ConsultationController::class, 'getPricing']);
    Route::get('/booked-slots', [ConsultationController::class, 'bookedSlots']);
    Route::get('/verify',       [ConsultationPaymentController::class, 'verify']);
});

Route::middleware('throttle:payments')->prefix('consultations')->group(function () {
    Route::post('/initiate', [ConsultationPaymentController::class, 'initiate']);
});

// =================== PROTECTED INSTRUCTOR ROUTES (throttle:api) =================== //

Route::middleware(['auth:instructor', 'throttle:api'])->prefix('instructor')->group(function () {

    Route::get('/me',      [InstructorAuthController::class, 'me']);
    Route::post('/logout', [InstructorAuthController::class, 'logout']);

    Route::get('/courses',            [InstructorCourseController::class, 'myCourses']);
    Route::get('/courses/{courseId}', [InstructorCourseController::class, 'getCourse']);

    // Sprint CRUD
    Route::post  ('/courses/{courseId}/sprints',            [InstructorCourseController::class, 'createSprint']);
    Route::put   ('/courses/{courseId}/sprints/{sprintId}', [InstructorCourseController::class, 'updateSprint']);
    Route::delete('/courses/{courseId}/sprints/{sprintId}', [InstructorCourseController::class, 'deleteSprint']);

    // Topic CRUD
    Route::post  ('/courses/{courseId}/sprints/{sprintId}/topics', [InstructorCourseController::class, 'createTopic']);
    Route::put   ('/courses/{courseId}/topics/{itemId}',           [InstructorCourseController::class, 'updateTopic']);
    Route::delete('/courses/{courseId}/topics/{itemId}',           [InstructorCourseController::class, 'deleteTopic']);
    Route::post  ('/courses/{courseId}/topics/{itemId}/upload',    [InstructorCourseController::class, 'uploadTopicFile']);

    // Projects
    Route::get  ('/courses/{courseId}/projects',  [InstructorCourseController::class, 'getProjects']);
    Route::post ('/courses/{courseId}/projects',  [InstructorCourseController::class, 'createProject']);
    Route::patch('/projects/{projectId}/phase',   [InstructorCourseController::class, 'advancePhase']);

    // Submissions
    Route::get ('/projects/{projectId}/submissions',  [InstructorCourseController::class, 'getSubmissions']);
    Route::post('/submissions/{submissionId}/review', [InstructorCourseController::class, 'reviewSubmission']);
});

// =================== PUBLIC COURSE ROUTES (throttle:api) =================== //

Route::middleware('throttle:api')->prefix('courses')->group(function () {
    Route::get('/',           [CourseController::class, 'index']);
    Route::get('/featured',   [CourseController::class, 'featured']);
    Route::get('/freemium',   [CourseController::class, 'freemium']);
    Route::get('/search',     [CourseController::class, 'search']);
    Route::get('/by-track',   [CourseController::class, 'byTrack']);
    Route::get('/{courseId}', [CourseController::class, 'show']);
});

// =================== ADMIN ROUTES (protected — throttle:api) =================== //

Route::middleware(['admin.auth'])->get('/debug/auth', function () {
    return response()->json([
        'authenticated' => true,
        'user'          => auth()->user(),
        'token'         => request()->bearerToken() ? 'Token present' : 'No token',
    ]);
});

Route::middleware(['admin.auth', 'throttle:api'])->prefix('admin')->group(function () {

    Route::post('/logout',  [App\Http\Controllers\Api\AdminAuthController::class, 'logout']);
    Route::post('/refresh', [App\Http\Controllers\Api\AdminAuthController::class, 'refresh']);
    Route::get('/me',       [App\Http\Controllers\Api\AdminAuthController::class, 'me']);

    Route::get('/dashboard', [AdminDashboardController::class, 'index']);

    // Students
    Route::prefix('students')->group(function () {
        Route::get('/',              [AdminStudentController::class, 'index']);
        Route::get('/statistics',    [AdminStudentController::class, 'getStatistics']);
        Route::get('/{id}',          [AdminStudentController::class, 'show']);
        Route::post('/send-message', [AdminStudentController::class, 'sendMessage']);
    });

    // Kids
    Route::prefix('kids')->group(function () {
        Route::get('/courses',             [AdminKidsController::class, 'courses']);
        Route::put('/courses/{id}/prices', [AdminKidsController::class, 'updatePrices']);
        Route::get('/enrollments',         [AdminKidsController::class, 'enrollments']);
    });

    // Referrals
    Route::prefix('referrals')->group(function () {
        Route::get('/stats',            [AdminReferralController::class, 'stats']);
        Route::get('/history',          [AdminReferralController::class, 'history']);
        Route::get('/public-referrers', [AdminReferralController::class, 'publicReferrers']);
    });

    // Scholarships
    Route::prefix('scholarships')->group(function () {
        Route::get('/',              [AdminScholarshipController::class, 'index']);
        Route::get('/stats',         [AdminScholarshipController::class, 'stats']);
        Route::patch('/{id}/review', [AdminScholarshipController::class, 'review']);
    });

    // Instructors
    Route::prefix('instructors')->group(function () {
        Route::get('/',                     [AdminInstructorController::class, 'index']);
        Route::post('/',                    [AdminInstructorController::class, 'store']);
        Route::get('/{id}',                 [AdminInstructorController::class, 'show']);
        Route::put('/{id}',                 [AdminInstructorController::class, 'update']);
        Route::delete('/{id}',              [AdminInstructorController::class, 'destroy']);
        Route::post('/{id}/reset-password', [AdminInstructorController::class, 'resetPassword']);
    });

    // consultation

    Route::prefix('consultations')->group(function () {
        Route::get('/settings',  [AdminConsultationController::class, 'getSettings']);
        Route::put('/settings',  [AdminConsultationController::class, 'updateSettings']);
        Route::get('/stats',     [AdminConsultationController::class, 'stats']);
        Route::get('/',          [AdminConsultationController::class, 'index']);
        Route::get('/{id}',      [AdminConsultationController::class, 'show']);
        Route::patch('/{id}',    [AdminConsultationController::class, 'update']);
        Route::delete('/{id}',  [AdminConsultationController::class, 'destroy']);
    });

    // Courses
    Route::prefix('courses')->group(function () {
        Route::get('/',              [AdminCourseController::class, 'index']);
        Route::get('/statistics',    [AdminCourseController::class, 'getStatistics']);
        Route::post('/',             [AdminCourseController::class, 'store']);
        Route::get('/{courseId}',    [AdminCourseController::class, 'show']);
        Route::put('/{courseId}',    [AdminCourseController::class, 'update']);
        Route::post('/{courseId}/update',   [AdminCourseController::class, 'update']);
        Route::delete('/{courseId}', [AdminCourseController::class, 'destroy']);
        Route::put('/{courseId}/pricing',   [AdminCourseController::class, 'updatePricingAndSettings']);
        Route::patch('/{courseId}/toggle-status', [AdminCourseController::class, 'toggleStatus']);

        Route::get ('/{courseId}/details',                   [AdminCourseController::class, 'getDetails']);
        Route::post('/{courseId}/details/tools/sync',        [AdminCourseController::class, 'syncTools']);
        Route::post('/{courseId}/details/learnings/sync',    [AdminCourseController::class, 'syncLearnings']);
        Route::post('/{courseId}/details/benefits/sync',     [AdminCourseController::class, 'syncBenefits']);
        Route::post('/{courseId}/details/career-paths/sync', [AdminCourseController::class, 'syncCareerPaths']);
        Route::post('/{courseId}/details/industries/sync',   [AdminCourseController::class, 'syncIndustries']);
        Route::post('/{courseId}/details/salary',            [AdminCourseController::class, 'upsertSalary']);

        Route::prefix('{courseId}/details')->group(function () {
            Route::post('/tools',         [AdminCourseDetailsController::class, 'addTool']);
            Route::post('/learnings',     [AdminCourseDetailsController::class, 'addLearning']);
            Route::post('/benefits',      [AdminCourseDetailsController::class, 'addBenefit']);
            Route::post('/career-paths',  [AdminCourseDetailsController::class, 'addCareerPath']);
            Route::post('/industries',    [AdminCourseDetailsController::class, 'addIndustry']);
            Route::post('/salary',        [AdminCourseDetailsController::class, 'addSalary']);
            Route::get('/',               [AdminCourseDetailsController::class, 'getCourseDetails']);
            Route::delete('/tools/{toolId}',              [AdminCourseDetailsController::class, 'deleteTool']);
            Route::delete('/learnings/{learningId}',      [AdminCourseDetailsController::class, 'deleteLearning']);
            Route::delete('/benefits/{benefitId}',        [AdminCourseDetailsController::class, 'deleteBenefit']);
            Route::delete('/career-paths/{careerPathId}', [AdminCourseDetailsController::class, 'deleteCareerPath']);
            Route::delete('/industries/{industryId}',     [AdminCourseDetailsController::class, 'deleteIndustry']);
        });

        Route::prefix('{courseId}/resources')->group(function () {
            Route::post('/materials',                        [AdminCourseResourcesController::class, 'createMaterial']);
            Route::put('/materials/{materialId}',            [AdminCourseResourcesController::class, 'updateMaterial']);
            Route::delete('/materials/{materialId}',         [AdminCourseResourcesController::class, 'deleteMaterial']);
            Route::post('/materials/{materialId}/items',     [AdminCourseResourcesController::class, 'addMaterialItem']);
            Route::put('/items/{itemId}',                    [AdminCourseResourcesController::class, 'updateMaterialItem']);
            Route::delete('/items/{itemId}',                 [AdminCourseResourcesController::class, 'deleteMaterialItem']);
            Route::post('/items/{itemId}/upload',            [AdminCourseResourcesController::class, 'uploadMaterialFile']);
            Route::post('/external-resources',               [AdminCourseResourcesController::class, 'createExternalResource']);
            Route::put('/external-resources/{resourceId}',  [AdminCourseResourcesController::class, 'updateExternalResource']);
            Route::delete('/external-resources/{resourceId}',[AdminCourseResourcesController::class, 'deleteExternalResource']);
            Route::post('/badges',                           [AdminCourseResourcesController::class, 'createBadge']);
            Route::put('/badges/{badgeId}',                  [AdminCourseResourcesController::class, 'updateBadge']);
            Route::delete('/badges/{badgeId}',               [AdminCourseResourcesController::class, 'deleteBadge']);
            Route::post('/cohort',                           [AdminCourseResourcesController::class, 'createCohort']);
            Route::put('/cohort/{cohortId}',                 [AdminCourseResourcesController::class, 'updateCohort']);
            Route::post('/cohort/{cohortId}/participants',       [AdminCourseResourcesController::class, 'addParticipant']);
            Route::put('/cohort/participants/{participantId}',   [AdminCourseResourcesController::class, 'updateParticipant']);
            Route::delete('/cohort/participants/{participantId}',[AdminCourseResourcesController::class, 'removeParticipant']);
        });
    });
});

// =================== KIDS ROUTES (throttle:api for enrollment, throttle:payments for payment init) =================== //

use App\Http\Controllers\Api\KidsController;


Route::middleware('throttle:api')->prefix('kids')->group(function () {
    Route::get('/courses',                 [KidsController::class, 'courses']);
    Route::get('/enrollment/lookup',       [KidsController::class, 'lookupByEmail']);
    Route::get('/enrollment/{id}',         [KidsController::class, 'getEnrollment']);
    Route::get('/resume/{token}',          [KidsController::class, 'resumeByToken']);
    Route::post('/enrollment/{id}/verify', [KidsController::class, 'verifyPayment']);
    Route::get('/stripe/verify',           [KidsStripeController::class, 'verify']);
    Route::get('/paystack/verify',         [KidsPaystackController::class, 'verify']);
});

Route::middleware('throttle:payments')->prefix('kids')->group(function () {
    Route::post('/enroll',              [KidsController::class, 'enroll']);
    Route::post('/stripe/checkout',     [KidsStripeController::class, 'createCheckout']);
    Route::post('/paystack/initialize', [KidsPaystackController::class, 'initialize']);
});

// =================== PUBLIC REFERRAL ROUTES (throttle:auth — same as login) =================== //

use App\Http\Controllers\Api\PublicReferralController;

Route::middleware('throttle:auth')->prefix('referrals/public')->group(function () {
    Route::post('/register', [PublicReferralController::class, 'register']);
    Route::post('/login',    [PublicReferralController::class, 'login']);
});

Route::middleware(['jwt.auth.re', 'throttle:api'])->group(function () {
    Route::get('/referrals/public/stats', [PublicReferralController::class, 'stats']);
});