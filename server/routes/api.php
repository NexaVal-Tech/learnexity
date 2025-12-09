<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\User\AuthController;
use App\Http\Controllers\Api\User\CourseController;
use App\Http\Controllers\Api\User\CourseEnrollmentController;
use App\Http\Controllers\Api\PaystackWebhookController;
use App\Http\Controllers\Api\CourseResourcesController;
use App\Http\Controllers\Api\AdminCourseResourcesController;
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
Route::middleware('role:admin')->prefix('admin/courses/{courseId}/resources')->group(function () {
    Route::post('/materials', [AdminCourseResourcesController::class, 'createMaterial']);
    Route::put('/materials/{materialId}', [AdminCourseResourcesController::class, 'updateMaterial']);
    Route::delete('/materials/{materialId}', [AdminCourseResourcesController::class, 'deleteMaterial']);
    Route::post('/materials/{materialId}/items', [AdminCourseResourcesController::class, 'addMaterialItem']);
    Route::put('/items/{itemId}', [AdminCourseResourcesController::class, 'updateMaterialItem']);
    Route::delete('/items/{itemId}', [AdminCourseResourcesController::class, 'deleteMaterialItem']);
    Route::post('/items/{itemId}/upload', [AdminCourseResourcesController::class, 'uploadMaterialFile']);
    Route::post('/external-resources', [AdminCourseResourcesController::class, 'createExternalResource']);
    Route::put('/external-resources/{resourceId}', [AdminCourseResourcesController::class, 'updateExternalResource']);
    Route::delete('/external-resources/{resourceId}', [AdminCourseResourcesController::class, 'deleteExternalResource']);
    Route::post('/badges', [AdminCourseResourcesController::class, 'createBadge']);
    Route::put('/badges/{badgeId}', [AdminCourseResourcesController::class, 'updateBadge']);
    Route::delete('/badges/{badgeId}', [AdminCourseResourcesController::class, 'deleteBadge']);
    Route::post('/cohort', [AdminCourseResourcesController::class, 'createCohort']);
    Route::put('/cohort/{cohortId}', [AdminCourseResourcesController::class, 'updateCohort']);
    Route::post('/cohort/{cohortId}/participants', [AdminCourseResourcesController::class, 'addParticipant']);
    Route::put('/cohort/participants/{participantId}', [AdminCourseResourcesController::class, 'updateParticipant']);
    Route::delete('/cohort/participants/{participantId}', [AdminCourseResourcesController::class, 'removeParticipant']);
});