<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;

class HistorialControlller extends Controller
{
    public function index(){
        $movimiento = DB::table('movimiento')
        ->join('usuarios', 'movimiento.id_usuario', '=', 'usuarios.id_usuario')
        ->join('productos', 'movimiento.id_productos', '=', 'productos.id_producto')
        ->leftJoin('ventas', 'movimiento.id_venta', '=', 'ventas.id_venta')
        ->leftJoin('facturas', 'ventas.id_venta', '=', 'facturas.id_venta')
        ->select(
            'movimiento.*',
            'usuarios.nombre_usuario',
            'usuarios.apellido_usuario',
            'productos.nombre_producto',
            'facturas.numero_factura'
        )
        ->orderBy('movimiento.fecha_movimiento', 'desc')
        ->get();

        return response()->json($movimiento);
    }
}
