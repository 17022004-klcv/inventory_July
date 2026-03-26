<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Ruta para login
use App\Http\Controllers\AuthController;
Route::post('/login', [AuthController::class, 'login']);

// Rutas para Proveedores
use App\Http\Controllers\ProveedorController;
Route::apiResource('proveedores', ProveedorController::class);

//Ruta para monitoreo
use App\Http\Controllers\MonitoreoController;
Route::get('monitoreo', [MonitoreoController::class, 'index']);

//Ruta para usuarios
use App\Http\Controllers\UsuarioController;
Route::apiResource('usuarios', UsuarioController::class);

//Ruta para clientes
use App\Http\Controllers\ClienteController;
Route::apiResource('clientes', ClienteController::class);

//ruta para categorias
use App\Http\Controllers\CategoriaController;
Route::apiResource('categorias', CategoriaController::class);

