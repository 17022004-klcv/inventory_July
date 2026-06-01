<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Productos;
use App\Models\Vencimiento;

class DashboardController extends Controller
{
    // GET api/dashboard/stats
    public function stats()
    {
        $totalClientes  = DB::table('clientes')->where('activo', true)->count();
        $totalUsuarios  = DB::table('usuarios')->where('activo', true)->count();
        $totalProductos = DB::table('productos')->where('activo', true)->count();
        $totalVentasHoy = DB::table('ventas')
                            ->whereDate('fecha_venta', today())
                            ->sum('total_venta');

        return response()->json([
            'total_clientes'   => $totalClientes,
            'total_usuarios'   => $totalUsuarios,
            'total_productos'  => $totalProductos,
            'ventas_hoy'       => round($totalVentasHoy, 2),
        ]);
    }

    // GET api/dashboard/ventas?periodo=semana|mes|anio
    public function ventas(Request $request)
    {
        $periodo = $request->get('periodo', 'semana');

        switch ($periodo) {
            case 'semana':
                $datos = DB::select("
                    SELECT TO_CHAR(fecha_venta, 'Dy') as periodo,
                           EXTRACT(DOW FROM fecha_venta) as orden,
                           SUM(total_venta) as total,
                           COUNT(*) as cantidad
                    FROM ventas
                    WHERE fecha_venta >= NOW() - INTERVAL '7 days'
                    GROUP BY TO_CHAR(fecha_venta, 'Dy'), EXTRACT(DOW FROM fecha_venta)
                    ORDER BY orden
                ");
                break;

            case 'mes':
                $datos = DB::select("
                    SELECT TO_CHAR(fecha_venta, 'DD Mon') as periodo,
                           EXTRACT(DAY FROM fecha_venta) as orden,
                           SUM(total_venta) as total,
                           COUNT(*) as cantidad
                    FROM ventas
                    WHERE fecha_venta >= NOW() - INTERVAL '30 days'
                    GROUP BY TO_CHAR(fecha_venta, 'DD Mon'), EXTRACT(DAY FROM fecha_venta)
                    ORDER BY orden
                ");
                break;

            case 'anio':
                $datos = DB::select("
                    SELECT TO_CHAR(fecha_venta, 'Mon') as periodo,
                           EXTRACT(MONTH FROM fecha_venta) as orden,
                           SUM(total_venta) as total,
                           COUNT(*) as cantidad
                    FROM ventas
                    WHERE fecha_venta >= NOW() - INTERVAL '12 months'
                    GROUP BY TO_CHAR(fecha_venta, 'Mon'), EXTRACT(MONTH FROM fecha_venta)
                    ORDER BY orden
                ");
                break;

            default:
                $datos = [];
        }

        return response()->json($datos);
    }

    // GET api/dashboard/clientes-frecuentes
    public function clientesFrecuentes()
    {
        $clientes = DB::select("
            SELECT c.id_cliente,
                   c.nombre_cliente,
                   c.apellido_cliente,
                   c.telefono_cliente,
                   c.correo_cliente,
                   COUNT(v.id_venta) as total_compras,
                   COALESCE(SUM(v.total_venta), 0) as total_gastado
            FROM clientes c
            LEFT JOIN ventas v ON c.id_cliente = v.id_cliente AND v.id_cliente IS NOT NULL
            WHERE c.activo = true
            GROUP BY c.id_cliente, c.nombre_cliente, c.apellido_cliente,
                     c.telefono_cliente, c.correo_cliente
            ORDER BY total_compras DESC, c.nombre_cliente ASC
            LIMIT 10
        ");

        return response()->json($clientes);
    }

    // GET api/dashboard/stock-bajo
    public function stockBajo()
    {
        $productos = Productos::with('categoria')
            ->where('activo', true)
            ->where('stock', '<=', 2)
            ->orderBy('stock', 'asc')
            ->get();

        return response()->json($productos);
    }

    // GET api/dashboard/vencimientos
   public function vencimientos()
{
    try {
        $hoy = now()->format('Y-m-d');
        $proximaSemana = now()->addDays(7)->format('Y-m-d');

        // 🌟 Forzamos las tablas y columnas en MAYÚSCULAS para cumplir con PostgreSQL
        $vencimientos = DB::table('VENCIMIENTO')
            ->join('PRODUCTOS', 'VENCIMIENTO.id_producto', '=', 'PRODUCTOS.id_producto')
            ->select(
                'VENCIMIENTO.id_vencimiento as id_vencimiento',
                'VENCIMIENTO.lote',
                'VENCIMIENTO.fecha_vencimiento as fecha_vencimiento',
                'PRODUCTOS.nombre_producto'
            )
            ->whereBetween('VENCIMIENTO.fecha_vencimiento', [$hoy, $proximaSemana])
            ->where('PRODUCTOS.activo', true)
            ->orderBy('VENCIMIENTO.fecha_vencimiento', 'asc')
            ->get();

        return response()->json($vencimientos);
    } catch (\Exception $e) {
        // 🚨 Si algo falla, devolvemos un array vacío para no congelar tu Frontend (Historial.jsx)
        // Pero registramos el error real en los logs de Laravel para revisarlo
        \Log::error("Error en vencimientos: " . $e->getMessage());
        return response()->json([]);
    }
}
}