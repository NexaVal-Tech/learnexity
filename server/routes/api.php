<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\User\AuthController;
use App\Http\Controllers\Api\User\CourseController;
use App\Http\Controllers\Api\User\CourseEnrollmentController;
use Tymon\JWTAuth\Http\Middleware\Authenticate as JWTAuthMiddleware;
use Illuminate\Foundation\Auth\EmailVerificationRequest;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/password/email', [AuthController::class, 'sendResetLink']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']); // Add this
Route::get('/me', [AuthController::class, 'me']);
Route::post('/logout', [AuthController::class, 'logout']);
// routes/api.php
Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();
    return response()->json(['message' => 'Verification link sent!']);
})->middleware(['auth:api', 'throttle:6,1']);

Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();
    return redirect(env('FRONTEND_URL') . '/user/auth/login?verified=true');
})->middleware(['auth:api', 'signed'])->name('verification.verify');

Route::middleware(['jwt.auth'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::prefix('courses')->group(function () {
        Route::get('/enrollments', [CourseEnrollmentController::class, 'getUserEnrollments']);
        Route::patch('/enrollments/{enrollmentId}/payment', [CourseEnrollmentController::class, 'updatePaymentStatus']);
        Route::get('/{courseId}/enrollment-status', [CourseEnrollmentController::class, 'checkEnrollmentStatus']);
        Route::post('/{courseId}/enroll', [CourseEnrollmentController::class, 'enroll']);
    });
});

// Public (unauthenticated)
Route::prefix('courses')->group(function () {
    Route::get('/', [CourseController::class, 'index']);
    Route::get('/featured', [CourseController::class, 'featured']);
    Route::get('/freemium', [CourseController::class, 'freemium']);
    Route::get('/search', [CourseController::class, 'search']);
    Route::get('/{courseId}', [CourseController::class, 'show']);
});
