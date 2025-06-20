<?php

namespace App\Http\Controllers\Ecommerce;

use App\Http\Controllers\Controller;
use App\Helpers\PixelHelper;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    public function success(Request $request, $orderId)
    {
        // Obtener datos del pedido
        $order = \App\Models\Sale::find($orderId);
        
        if (!$order) {
            return redirect()->route('home');
        }

        // Preparar datos para tracking de píxeles
        $orderData = [
            'order_id' => $order->id,
            'total' => $order->total,
            'product_ids' => $order->details->pluck('item_id')->toArray(),
            'user_id' => $order->customer_id,
        ];

        // Generar scripts de tracking de conversión
        $conversionScripts = PixelHelper::trackPurchase($orderData);

        return view('ecommerce.checkout.success', [
            'order' => $order,
            'conversionScripts' => $conversionScripts
        ]);
    }
}
