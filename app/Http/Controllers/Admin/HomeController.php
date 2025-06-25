<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BasicController;
use App\Models\Benefit;
use App\Models\Item;
use App\Models\Sale;
use App\Models\SaleStatus;
use Carbon\Carbon;
use Culqi\Culqi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HomeController extends BasicController
{
    public $reactView = 'Admin/Home';
    public $reactRootView = 'admin';

    public function setReactViewProperties(Request $request)
    {
        
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();
        $startOfYear = Carbon::now()->startOfYear();

        // Total productos activos (visible = 1, status activo)
        $totalProducts = Item::where('visible', true)->where('status', 1)->count();

        // Total stock disponible
        $totalStock = Item::where('visible', true)->where('status', 1)->sum('stock');

        // Total ventas y monto generado hoy, mes, año
        $salesToday = Sale::whereDate('created_at', $today)->count();
        $salesMonth = Sale::whereBetween('created_at', [$startOfMonth, Carbon::now()])->count();
        $salesYear = Sale::whereBetween('created_at', [$startOfYear, Carbon::now()])->count();

        $incomeToday = Sale::whereDate('created_at', $today)->sum('amount');
        $incomeMonth = Sale::whereBetween('created_at', [$startOfMonth, Carbon::now()])->sum('amount');
        $incomeYear = Sale::whereBetween('created_at', [$startOfYear, Carbon::now()])->sum('amount');

        // Pedidos por estado
        $statuses = SaleStatus::all();
        $ordersByStatus = [];
        foreach ($statuses as $status) {
            $count = Sale::where('status_id', $status->id)->count();
            $ordersByStatus[] = [
                'name' => $status->name,
                'color' => $status->color,
                'count' => $count
            ];
        }

        // Productos más vendidos (top 5)
        $topProducts = DB::table('sale_details')
            ->select('item_id', DB::raw('SUM(quantity) as total_quantity'))
            ->groupBy('item_id')
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->get()
            ->map(function($row) {
                $item = Item::find($row->item_id);
                return [
                    'name' => $item ? $item->name : 'Desconocido',
                    'quantity' => $row->total_quantity,
                    'image' => $item ? $item->image : null,
                ];
            });

        // Nuevos productos destacados (is_new o featured)
        $newFeatured = Item::where('visible', true)
            ->where(function ($q) {
                $q->where('is_new', true)
                  ->orWhere('featured', true);
            })
            ->limit(5)
            ->get(['id', 'name', 'image', 'price']);

        // Ventas por dispositivo (simulación / ejemplo)
        // Asumimos que tienes columna 'device' en tabla sales con valores: desktop, mobile, tablet, other
      /*  $salesByDevice = Sale::select('device', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
            ->groupBy('device')
            ->get();*/

        // Ventas por ubicación (departamento, provincia, distrito)
        $salesByLocation = Sale::select('department', 'province', 'district', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
            ->groupBy('department', 'province', 'district')
            ->orderByDesc('count')
            ->limit(10)
            ->get();
            $latestTransactions = Sale::latest()->take(5)->get();
        // Cupones más usados (top 5)
        $topCoupons = \App\Models\Coupon::orderByDesc('used_count')->limit(5)->get(['code', 'name', 'used_count', 'value', 'type']);

        // Reglas de descuento más usadas (top 5)
        $topDiscountRules = DB::table('discount_rule_usages')
            ->select('discount_rule_id', DB::raw('COUNT(*) as times_used'), DB::raw('SUM(discount_amount) as total_discount'))
            ->groupBy('discount_rule_id')
            ->orderByDesc('times_used')
            ->limit(5)
            ->get()
            ->map(function($row) {
                $rule = \App\Models\DiscountRule::find($row->discount_rule_id);
                return [
                    'name' => $rule ? $rule->name : 'Desconocido',
                    'times_used' => $row->times_used,
                    'total_discount' => $row->total_discount
                ];
            });

        // Marcas activas y su estado
        $brands = \App\Models\Brand::select('name', 'status', 'featured', 'visible')->get();

        // Top clientes por compras (top 5) usando user_id y users.email
        $topClients = DB::table('sales')
            ->join('users', 'sales.user_id', '=', 'users.id')
            ->select('users.email', DB::raw('COUNT(sales.id) as total_orders'), DB::raw('SUM(sales.amount) as total_spent'))
            ->groupBy('users.email')
            ->orderByDesc('total_spent')
            ->limit(5)
            ->get();

        // Ventas y pedidos últimos 30 días (para gráfica compuesta)
        $salesLast30Days = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $sales = Sale::whereDate('created_at', $date)->sum('amount');
            $orders = Sale::whereDate('created_at', $date)->count();
            $salesLast30Days[] = [
                'date' => $date->format('Y-m-d'),
                'amount' => $sales,
                'orders' => $orders
            ];
        }

        // Nuevos usuarios (hoy, mes, año)
        $usersToday = \App\Models\User::whereDate('created_at', $today)->count();
        $usersMonth = \App\Models\User::whereBetween('created_at', [$startOfMonth, Carbon::now()])->count();
        $usersYear = \App\Models\User::whereBetween('created_at', [$startOfYear, Carbon::now()])->count();

        // Satisfacción del cliente (dummy, si no hay tabla de feedback)
        $customerSatisfaction = 94.3;

        return [
            'totalProducts' => $totalProducts,
            'totalStock' => $totalStock,
            'salesToday' => $salesToday,
            'salesMonth' => $salesMonth,
            'salesYear' => $salesYear,
            'incomeToday' => $incomeToday,
            'incomeMonth' => $incomeMonth,
            'incomeYear' => $incomeYear,
            'ordersByStatus' => $ordersByStatus,
            'topProducts' => $topProducts,
            'newFeatured' => $newFeatured,
            'latestTransactions' => $latestTransactions,
            'salesByLocation' => $salesByLocation,
            'topCoupons' => $topCoupons,
            'topDiscountRules' => $topDiscountRules,
            'brands' => $brands,
            'topClients' => $topClients,
            'salesLast30Days' => $salesLast30Days,
            'usersToday' => $usersToday,
            'usersMonth' => $usersMonth,
            'usersYear' => $usersYear,
            'customerSatisfaction' => $customerSatisfaction,
        ];
    }
}
