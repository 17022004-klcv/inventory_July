<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HistorialControlller extends Controller
{
    public function index()
    {
        try {
            // Buscamos las tablas y columnas en minúsculas estrictas como las maneja tu Postgres
            $historial = DB::table('movimiento') 
                ->join('usuarios', 'movimiento.id_usuario', '=', 'usuarios.id_usuario')
                ->join('productos', 'movimiento.id_productos', '=', 'productos.id_producto')
                ->select(
                    'movimiento.id_movimiento as id_movimiento',
                    'movimiento.fecha_movimiento as fecha_movimiento', 
                    'movimiento.tipo_movimiento as tipo_movimiento',
                    'movimiento.cantidad as cantidad',
                    'movimiento.id_venta as id_venta',
                    'usuarios.nombre_usuario',
                    'usuarios.apellido_usuario',
                    'productos.nombre_producto'
                )
                ->orderBy('movimiento.fecha_movimiento', 'desc')
                ->get();

            return response()->json($historial);
        } catch (\Exception $e) {
            // Esto nos pintará el error exacto en los logs si algo faltara
            \Log::error("Error en Historial: " . $e->getMessage());
            return response()->json([
                'error' => 'Error interno en el servidor',
                'detalle' => $e->getMessage()
            ], 500);
        }
    }
}