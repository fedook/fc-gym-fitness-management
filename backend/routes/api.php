<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\PortalController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\TrainerController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::put('/profile', [SettingController::class, 'updateProfile']);

    Route::middleware('role:admin,staff,trainer')->group(function () {
        Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
        Route::get('/dashboard/revenue', [DashboardController::class, 'revenue']);
        Route::get('/dashboard/recent-members', [DashboardController::class, 'recentMembers']);
        Route::get('/dashboard/upcoming-appointments', [DashboardController::class, 'upcomingAppointments']);
        Route::get('/dashboard/expiring-memberships', [DashboardController::class, 'expiringMemberships']);
    });

    Route::middleware('role:admin,staff')->group(function () {
        Route::apiResource('members', MemberController::class);
        Route::patch('members/{member}/status', [MemberController::class, 'updateStatus']);
        Route::get('members/{member}/memberships', [MemberController::class, 'memberships']);
        Route::get('members/{member}/payments', [MemberController::class, 'payments']);
        Route::get('members/{member}/attendance', [MemberController::class, 'attendance']);

        Route::apiResource('plans', PlanController::class);
        Route::apiResource('payments', PaymentController::class)->only(['index', 'store', 'show', 'update']);
        Route::apiResource('trainers', TrainerController::class);
        Route::apiResource('appointments', AppointmentController::class);

        Route::get('/reports/members', [ReportController::class, 'members']);
        Route::get('/reports/payments', [ReportController::class, 'payments']);
        Route::get('/reports/attendance', [ReportController::class, 'attendance']);
    });

    Route::middleware('role:admin,staff,trainer,member')->group(function () {
        Route::get('/attendance', [AttendanceController::class, 'index']);
        Route::get('/attendance/member/{member}', [AttendanceController::class, 'memberAttendance']);
    });

    Route::middleware('role:admin,staff,trainer')->group(function () {
        Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);
        Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']);
    });

    Route::middleware('role:member')->group(function () {
        Route::get('/portal/profile', [PortalController::class, 'profile']);
        Route::put('/portal/profile', [PortalController::class, 'updateProfile']);
        Route::get('/portal/memberships', [PortalController::class, 'memberships']);
        Route::get('/portal/payments', [PortalController::class, 'payments']);
        Route::get('/portal/attendance', [PortalController::class, 'attendance']);
    });

    Route::middleware('role:admin')->group(function () {
        Route::get('/settings', [SettingController::class, 'show']);
        Route::put('/settings', [SettingController::class, 'update']);
        Route::get('/settings/users', [SettingController::class, 'users']);
        Route::post('/settings/users', [SettingController::class, 'storeUser']);
        Route::put('/settings/users/{user}', [SettingController::class, 'updateUser']);
    });
});
