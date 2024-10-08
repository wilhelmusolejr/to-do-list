<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/tasks', [TaskController::class, 'store']);
Route::post('/userTaskTitles', [TaskController::class, 'getUserTaskTitles']);
Route::post('/userTaskTitle', [TaskController::class, 'getUserTaskTitle']);
Route::post('/userTasks', [TaskController::class, 'getUserTasks']);
Route::post('/deleteEntiretask', [TaskController::class, 'deleteEntireTask']);
Route::post('/updateTask', [TaskController::class, 'updateTask']);
Route::post('/updateTaskStatus', [TaskController::class, 'updateTaskStatus']);


Route::post('/register', [RegisteredUserController::class, 'store']);
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);
Route::post('/login', [AuthenticatedSessionController::class, 'login']);
