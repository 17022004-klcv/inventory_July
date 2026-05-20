<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Venta;
use App\Models\DetalleVenta;
use App\Models\Productos;

class PosController extends Controller
{
    public function procesarVenta(Request $request)
    {
        // Validar los datos que llegan de React
        $request->validate([
            'id_usuario'  => 'required|integer',
            'id_cliente'  => 'nullable|integer',
            'items'       => 'required|array|min:1',
            'items.*.id_producto'     => 'required|integer',
            'items.*.cantidad'        => 'required|integer|min:1',
            'items.*.precio_unitario' => 'required|numeric|min:0',
        ]);

        // Usar transacción para que si algo falla, no quede nada a medias
        DB::beginTransaction();

        try {
            // 1. Calcular total
            $total = collect($request->items)->sum(function ($item) {
                return $item['cantidad'] * $item['precio_unitario'];
            });

            // 2. Crear la venta
            $venta = Venta::create([
                'fecha_venta' => now(),
                'id_usuario'  => $request->id_usuario,
                'id_cliente'  => $request->id_cliente,
                'total_venta' => $total,
                'estado'      => 'Completada'
            ]);

            // 3. Crear el detalle y descontar stock
            foreach ($request->items as $item) {
                DetalleVenta::create([
                    'id_venta'        => $venta->id_venta,
                    'id_producto'     => $item['id_producto'],
                    'cantidad'        => $item['cantidad'],
                    'precio_unitario' => $item['precio_unitario']
                ]);

                // Descontar stock del producto
                Productos::where('id_producto', $item['id_producto'])
                         ->decrement('stock', $item['cantidad']);
            }

            DB::commit();

            return response()->json([
                'mensaje'  => 'Venta procesada correctamente',
                'id_venta' => $venta->id_venta,
                'total'    => $total
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Error al procesar la venta: ' . $e->getMessage()
            ], 500);
        }
    }
}