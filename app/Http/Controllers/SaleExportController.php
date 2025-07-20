<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SaleExportController extends Controller
{
    /**
     * Exportar datos de ventas para Excel con filtros opcionales
     */
    public function exportData(Request $request): JsonResponse
    {
        try {
            // Iniciar query con relaciones necesarias
            $query = Sale::with([
                'saleStatus',
                'store',
                'coupon',
                'saleDetails.product',
                'saleDetails.productVariation'
            ]);

            // Aplicar filtro de fecha de inicio
            if ($request->has('start_date') && $request->start_date) {
                $startDate = Carbon::parse($request->start_date)->startOfDay();
                $query->where('created_at', '>=', $startDate);
            }

            // Aplicar filtro de fecha de fin
            if ($request->has('end_date') && $request->end_date) {
                $endDate = Carbon::parse($request->end_date)->endOfDay();
                $query->where('created_at', '<=', $endDate);
            }

            // Aplicar filtro de estado
            if ($request->has('status') && $request->status) {
                $query->where('sale_status_id', $request->status);
            }

            // Obtener ventas ordenadas por fecha descendente
            $sales = $query->orderBy('created_at', 'desc')->get();

            // Formatear datos para exportación
            $formattedSales = $sales->map(function ($sale) {
                // Formatear productos con detalles completos
                $productsFormatted = $sale->saleDetails->map(function ($detail) {
                    $productName = $detail->product->name ?? 'Producto eliminado';
                    $variationInfo = '';
                    
                    if ($detail->productVariation) {
                        $variationInfo = " ({$detail->productVariation->attribute_combination})";
                    }
                    
                    return "{$productName}{$variationInfo} - Cantidad: {$detail->quantity} - Precio: S/ {$detail->price}";
                })->implode(' | ');

                // Calcular totales de productos
                $productsCount = $sale->saleDetails->count();
                $productsTotalQuantity = $sale->saleDetails->sum('quantity');

                // Formatear dirección completa
                $fullAddress = trim("{$sale->address} {$sale->address_reference}");
                if ($sale->district) {
                    $fullAddress .= ", {$sale->district}";
                }
                if ($sale->province) {
                    $fullAddress .= ", {$sale->province}";
                }
                if ($sale->department) {
                    $fullAddress .= ", {$sale->department}";
                }

                return [
                    'correlative_code' => $sale->correlative_code,
                    'created_at' => $sale->created_at->format('Y-m-d H:i:s'),
                    'status_name' => $sale->saleStatus->name ?? 'Sin estado',
                    'fullname' => $sale->fullname,
                    'email' => $sale->email,
                    'phone' => $sale->phone,
                    'document_type' => $sale->document_type,
                    'document' => $sale->document,
                    'business_name' => $sale->business_name,
                    'invoice_type' => $sale->invoice_type,
                    'payment_method' => $sale->payment_method,
                    'culqi_charge_id' => $sale->culqi_charge_id,
                    'payment_status' => $sale->payment_status,
                    'delivery_type' => $sale->delivery_type,
                    'full_address' => $fullAddress,
                    'reference' => $sale->reference,
                    'comment' => $sale->comment,
                    'store_name' => $sale->store->name ?? null,
                    'store_address' => $sale->store ? "{$sale->store->address}, {$sale->store->district}" : null,
                    'products_formatted' => $productsFormatted,
                    'products_count' => $productsCount,
                    'products_total_quantity' => $productsTotalQuantity,
                    'subtotal' => number_format($sale->subtotal, 2),
                    'delivery_cost' => number_format($sale->delivery_cost, 2),
                    'coupon_discount' => number_format($sale->coupon_discount, 2),
                    'coupon_code' => $sale->coupon->code ?? null,
                    'promotion_discount' => number_format($sale->promotion_discount, 2),
                    'bundle_discount' => number_format($sale->bundle_discount, 2),
                    'renewal_discount' => number_format($sale->renewal_discount, 2),
                    'total_amount' => number_format($sale->total_amount, 2)
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Datos obtenidos correctamente',
                'data' => $formattedSales,
                'count' => $formattedSales->count(),
                'filters' => [
                    'start_date' => $request->start_date,
                    'end_date' => $request->end_date,
                    'status' => $request->status
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error en exportación de ventas: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los datos de ventas: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }
}
