<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\User\AuthController;
use App\Http\Controllers\Api\User\CourseController;
use App\Http\Controllers\Api\User\CourseEnrollmentController;
use App\Http\Controllers\Api\PaystackWebhookController;
use App\Http\Controllers\Api\CourseResourcesController;
use App\Http\Controllers\Api\AdminCourseResourcesController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminStudentController;
use App\Http\Controllers\Api\AdminCourseController;
use App\Http\Controllers\Api\ReferralController;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Http\Request;

// =================== EMAIL VERIFICATION ROUTES =================== //
Route::get('/email/verify/{id}/{hash}', function ($id, $hash, Request $request) {
    $user = User::find($id);

    if (!$user) {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        return redirect($frontendUrl . '/user/auth/login?error=user_not_found');
    }

    // Validate hash from email link
    if (!hash_equals($hash, sha1($user->getEmailForVerification()))) {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        return redirect($frontendUrl . '/user/auth/login?error=invalid_verification_link');
    }

    // If already verified
    if ($user->hasVerifiedEmail()) {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        return redirect($frontendUrl . '/user/auth/login?verified=already&email=' . urlencode($user->email));
    }

    // Mark email as verified
    $user->markEmailAsVerified();

    // Redirect to login page with success message
    $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
    return redirect($frontendUrl . '/user/auth/login?verified=success&email=' . urlencode($user->email));
})->name('verification.verify');

Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();
    return response()->json(['message' => 'Verification link resent.']);
})->middleware('jwt.auth')->name('verification.send');

// Resend verification email (public route)
Route::post('/email/resend-verification', [AuthController::class, 'resendVerification']);

// =================== PUBLIC ROUTES =================== //
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/password/email', [AuthController::class, 'sendResetLink']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);

// Google OAuth routes
Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// Validate a referral code (public)
Route::post('/referrals/validate', [ReferralController::class, 'validateReferralCode']);

// Paystack webhook (MUST be public)
Route::post('/paystack/webhook', [PaystackWebhookController::class, 'handleWebhook']);

// =================== PROTECTED ROUTES =================== //
Route::middleware(['jwt.auth'])->group(function () {

    // Authenticated user routes
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Referral routes (protected)
    Route::prefix('referrals')->group(function () {
        Route::get('/status', [ReferralController::class, 'checkStatus']);
        Route::post('/apply', [ReferralController::class, 'createReferralCode']);
        Route::get('/', [ReferralController::class, 'getReferralData']);
    });

    // Courses & enrollments
    Route::prefix('courses')->group(function () {
        Route::get('/enrollments', [CourseEnrollmentController::class, 'getUserEnrollments']);
        Route::get('/{courseId}/enrollment-status', [CourseEnrollmentController::class, 'checkEnrollmentStatus']);
        Route::post('/{courseId}/enroll', [CourseEnrollmentController::class, 'enroll']);
        Route::patch('/enrollments/{enrollmentId}/payment', [CourseEnrollmentController::class, 'updatePaymentStatus']);
        Route::post('/enrollments/{enrollmentId}/verify-payment', [CourseEnrollmentController::class, 'verifyPaymentStatus']);

        Route::prefix('{courseId}/resources')->group(function () {
            Route::get('/', [CourseResourcesController::class, 'getCourseResources']);
            Route::post('/time-spent', [CourseResourcesController::class, 'updateTimeSpent']);
        });
    });

    // Material item routes
    Route::prefix('materials')->group(function () {
        Route::post('/{itemId}/complete', [CourseResourcesController::class, 'markItemCompleted']);
        Route::post('/{itemId}/incomplete', [CourseResourcesController::class, 'markItemIncomplete']);
        Route::get('/{itemId}/download', [CourseResourcesController::class, 'downloadMaterial']);
    });
});

// =================== PUBLIC COURSE ROUTES =================== //
Route::prefix('courses')->group(function () {
    Route::get('/', [CourseController::class, 'index']);
    Route::get('/featured', [CourseController::class, 'featured']);
    Route::get('/freemium', [CourseController::class, 'freemium']);
    Route::get('/search', [CourseController::class, 'search']);
    Route::get('/{courseId}', [CourseController::class, 'show']);
});

// =================== ADMIN ROUTES =================== //

// =================== ADMIN ROUTES =================== //

// Public admin routes (no authentication required)
Route::prefix('admin')->group(function () {
    Route::post('/login', [App\Http\Controllers\Api\AdminAuthController::class, 'login']);
    Route::post('/forgot-password', [App\Http\Controllers\Api\AdminAuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [App\Http\Controllers\Api\AdminAuthController::class, 'resetPassword']);
});



// Add this temporary route to your api.php for debugging
// Place it BEFORE the middleware group

Route::get('/debug/students', function() {
    try {
        $totalUsers = User::count();
        $usersWithEnrollments = User::has('enrollments')->count();
        $totalEnrollments = \App\Models\CourseEnrollment::count();
        
        $sampleUser = User::with('enrollments')->first();
        
        $tables = \Illuminate\Support\Facades\Schema::getTableListing();
        
        return response()->json([
            'status' => 'success',
            'database_info' => [
                'total_users' => $totalUsers,
                'users_with_enrollments' => $usersWithEnrollments,
                'total_enrollments' => $totalEnrollments,
            ],
            'sample_user' => $sampleUser ? [
                'id' => $sampleUser->id,
                'name' => $sampleUser->name,
                'email' => $sampleUser->email,
                'has_enrollments' => $sampleUser->enrollments->count() > 0,
                'enrollments_count' => $sampleUser->enrollments->count(),
            ] : null,
            'tables_in_database' => $tables,
            'user_columns' => \Illuminate\Support\Facades\Schema::getColumnListing('users'),
            'enrollment_columns' => \Illuminate\Support\Facades\Schema::getColumnListing('course_enrollments'),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Also add a debug route to check authentication
Route::middleware(['admin.auth'])->get('/debug/auth', function() {
    return response()->json([
        'authenticated' => true,
        'user' => auth()->user(),
        'token' => request()->bearerToken() ? 'Token present' : 'No token',
    ]);
});

// Protected admin routes (authentication required)
Route::middleware(['admin.auth'])->prefix('admin')->group(function () {
    
    // Auth routes
    Route::post('/logout', [App\Http\Controllers\Api\AdminAuthController::class, 'logout']);
    Route::post('/refresh', [App\Http\Controllers\Api\AdminAuthController::class, 'refresh']);
    Route::get('/me', [App\Http\Controllers\Api\AdminAuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);
    
    // Students Management
    Route::prefix('students')->group(function () {
        Route::get('/', [AdminStudentController::class, 'index']);
        Route::get('/statistics', [AdminStudentController::class, 'getStatistics']);
        Route::get('/{id}', [AdminStudentController::class, 'show']);
        Route::post('/send-message', [AdminStudentController::class, 'sendMessage']);
    });
    
    // Courses Management
    Route::prefix('courses')->group(function () {
        Route::get('/', [AdminCourseController::class, 'index']);
        Route::get('/statistics', [AdminCourseController::class, 'getStatistics']);
        Route::post('/', [AdminCourseController::class, 'store']);
        Route::get('/{courseId}', [AdminCourseController::class, 'show']);
        Route::put('/{courseId}', [AdminCourseController::class, 'update']);
        Route::delete('/{courseId}', [AdminCourseController::class, 'destroy']);
        
        // Course Resources Management
        Route::prefix('{courseId}/resources')->group(function () {
            // Materials (Sprints)
            Route::post('/materials', [AdminCourseResourcesController::class, 'createMaterial']);
            Route::put('/materials/{materialId}', [AdminCourseResourcesController::class, 'updateMaterial']);
            Route::delete('/materials/{materialId}', [AdminCourseResourcesController::class, 'deleteMaterial']);
            
            // Material Items (Topics)
            Route::post('/materials/{materialId}/items', [AdminCourseResourcesController::class, 'addMaterialItem']);
            Route::put('/items/{itemId}', [AdminCourseResourcesController::class, 'updateMaterialItem']);
            Route::delete('/items/{itemId}', [AdminCourseResourcesController::class, 'deleteMaterialItem']);
            Route::post('/items/{itemId}/upload', [AdminCourseResourcesController::class, 'uploadMaterialFile']);
            
            // External Resources
            Route::post('/external-resources', [AdminCourseResourcesController::class, 'createExternalResource']);
            Route::put('/external-resources/{resourceId}', [AdminCourseResourcesController::class, 'updateExternalResource']);
            Route::delete('/external-resources/{resourceId}', [AdminCourseResourcesController::class, 'deleteExternalResource']);
            
            // Badges
            Route::post('/badges', [AdminCourseResourcesController::class, 'createBadge']);
            Route::put('/badges/{badgeId}', [AdminCourseResourcesController::class, 'updateBadge']);
            Route::delete('/badges/{badgeId}', [AdminCourseResourcesController::class, 'deleteBadge']);
            
            // Cohort & Leaderboard
            Route::post('/cohort', [AdminCourseResourcesController::class, 'createCohort']);
            Route::put('/cohort/{cohortId}', [AdminCourseResourcesController::class, 'updateCohort']);
            Route::post('/cohort/{cohortId}/participants', [AdminCourseResourcesController::class, 'addParticipant']);
            Route::put('/cohort/participants/{participantId}', [AdminCourseResourcesController::class, 'updateParticipant']);
            Route::delete('/cohort/participants/{participantId}', [AdminCourseResourcesController::class, 'removeParticipant']);
        });
    });
});