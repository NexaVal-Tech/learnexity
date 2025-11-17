<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\User\AuthController;
use App\Http\Controllers\Api\User\CourseController;
use App\Http\Controllers\Api\User\CourseEnrollmentController;
use App\Http\Controllers\Api\PaystackWebhookController;
use App\Http\Controllers\Api\CourseResourcesController;
use App\Http\Controllers\Api\AdminCourseResourcesController;
use App\Http\Controllers\Api\ReferralController;

// =================== PUBLIC ROUTES =================== //
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/password/email', [AuthController::class, 'sendResetLink']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);

// Validate a referral code (can be public)
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
