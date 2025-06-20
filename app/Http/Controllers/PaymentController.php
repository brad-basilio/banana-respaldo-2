<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\SaleStatus;
use App\Models\User;
use App\Models\Coupon;
use App\Notifications\PurchaseSummaryNotification;
use App\Helpers\PixelHelper;
use Culqi\Culqi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function getPaymentStatus($sale_id)
    {
        $sale = Sale::findOrFail($sale_id);
        return response()->json($sale);
    }

    public function charge(Request $request)
    {
        try {
            // Debug: Log de todos los datos recibidos
            Log::info('PaymentController - Datos recibidos:', $request->all());
            
            // Redondear y convertir el monto a centavos para Culqi
            $amountInSoles = round((float)$request->amount, 2);
            $amountInCents = round($amountInSoles * 100);
            
            Log::info('PaymentController - Monto procesado:', [
                'amount_original' => $request->amount,
                'amount_type' => gettype($request->amount),
                'amount_rounded' => $amountInSoles,
                'amount_cents' => $amountInCents,
                'delivery' => $request->delivery,
                'coupon_discount' => $request->coupon_discount
            ]);
            
            $culqi = new Culqi([
                'api_key' => config('services.culqi.secret_key'),
            ]);
            
            // Crear el intento de pago
            try {
                Log::info('PaymentController - Intentando crear cargo en Culqi:', [
                    'amount_cents' => $amountInCents,
                    'email' => $request->email,
                    'token' => $request->token
                ]);
                
                $charge = $culqi->Charges->create([
                    "amount" => $amountInCents,  // Usar el monto redondeado en centavos
                    "currency_code" => "PEN",
                    "email" => $request->email,
                    "source_id" => $request->token
                ]);
                
                Log::info('PaymentController - Respuesta de Culqi:', [
                    'charge_id' => $charge->id ?? 'No ID',
                    'charge_outcome' => $charge->outcome ?? 'No outcome',
                    'charge_full' => $charge
                ]);
            } catch (\Exception $culqiException) {
                Log::error('PaymentController - Error en Culqi:', [
                    'error' => $culqiException->getMessage(),
                    'trace' => $culqiException->getTraceAsString()
                ]);
                return response()->json([
                    'message' => 'Error del procesador de pagos: ' . $culqiException->getMessage(),
                    'status' => false
                ], 400);
            }

            // Validar si el pago fue exitoso
            if (!isset($charge->id) || ($charge->outcome->type ?? '') !== 'venta_exitosa') {
                return response()->json([
                    'message' => 'Pago fallido',
                    'status' => false,
                    'error' => $charge->outcome->user_message ?? 'Error desconocido'
                ], 400);
            }

            Log::info('PaymentController - Pago exitoso, iniciando creación de venta');

            $saleStatusPagado = SaleStatus::getByName('Pagado');
            Log::info('PaymentController - SaleStatus obtenido', ['status_id' => $saleStatusPagado?->id]);

            // Registrar la venta
            Log::info('PaymentController - Creando venta con datos:', [
                'code' => $request->orderNumber,
                'amount' => $request->amount,
                'coupon_code' => $request->coupon_code,
                'coupon_discount' => $request->coupon_discount
            ]);
            
            $sale = Sale::create([
                'code' => $request->orderNumber,
                'user_id' => $request->user_id,
                'name' => $request->name,
                'lastname' => $request->lastname,
                'fullname' => $request->fullname,
                'email' => $request->email,
                'phone' => $request->phone,
                'country' => $request->country,
                'department' => $request->department,
                'province' => $request->province,
                'district' => $request->district,
                'ubigeo' => $request->ubigeo,
                'address' => $request->address,
                'number' => $request->number,
                'reference' => $request->reference,
                'comment' => $request->comment,
                'amount' => $request->amount,
                'delivery' => $request->delivery,
                'coupon_id' => $request->coupon_id,
                'coupon_code' => $request->coupon_code,
                'coupon_discount' => $request->coupon_discount ?? 0,
                'culqi_charge_id' => $charge->id,
                'payment_status' => 'pagado',
                'status_id' => $saleStatusPagado ? $saleStatusPagado->id : null,
                'invoiceType' => $request->invoiceType,
                'documentType' => $request->documentType,
                'document' => $request->document,
                'businessName' => $request->businessName
            ]);
            
            Log::info('PaymentController - Venta creada exitosamente', ['sale_id' => $sale->id]);

            // Registrar detalles de la venta y actualizar stock
            Log::info('PaymentController - Procesando detalles de venta', ['cart_items' => count($request->cart)]);
            
            foreach ($request->cart as $item) {
                $itemId = is_array($item) ? $item['id'] ?? null : $item->id ?? null;
                $itemName = is_array($item) ? $item['name'] ?? null : $item->name ?? null;
                $itemPrice = is_array($item) ? $item['final_price'] ?? null : $item->final_price ?? null;
                $itemQuantity = is_array($item) ? $item['quantity'] ?? null : $item->quantity ?? null;

                SaleDetail::create([
                    'sale_id' => $sale->id,
                    'item_id' => $itemId,
                    'name' => $itemName,
                    'price' => $itemPrice,
                    'quantity' => $itemQuantity,
                ]);

                Item::where('id', $itemId)->decrement('stock', $itemQuantity);
            }
            
            Log::info('PaymentController - Detalles de venta procesados exitosamente');

            // Incrementar el contador de uso del cupón si se aplicó uno
            if ($request->coupon_code) {
                $coupon = Coupon::where('code', $request->coupon_code)->first();
                if ($coupon) {
                    $coupon->incrementUsage();
                    Log::info('PaymentController - Cupón incrementado', [
                        'coupon_code' => $coupon->code,
                        'usage_count' => $coupon->usage_count + 1
                    ]);
                }
            }

            //usuario autenticado actualizar datos de contacto
            if (Auth::check()) {
                $userJpa = User::find(Auth::user()->id);
                $userJpa->phone = $request->phone;
                $userJpa->dni = $request->dni;
                $userJpa->country = $request->country;
                $userJpa->department = $request->department;
                $userJpa->province = $request->province;
                $userJpa->district = $request->district;
                $userJpa->ubigeo = $request->ubigeo;
                $userJpa->address = $request->address;
                $userJpa->reference = $request->reference;
                $userJpa->number = $request->number;
            
                $userJpa->save();
            }

            Log::info('PaymentController - Datos procesados exitosamente', [
                'sale_id' => $sale->id,
                'amount' => $sale->amount,
                'coupon_code' => $sale->coupon_code,
                'coupon_discount' => $sale->coupon_discount
            ]);

            // Generar scripts de tracking de conversión
            $orderData = [
                'order_id' => $sale->id,
                'total' => $sale->amount,
                'product_ids' => collect($request->cart)->pluck('id')->toArray(),
                'user_id' => $sale->user_id,
                'items' => collect($request->cart)->map(function($item) {
                    return [
                        'item_id' => is_array($item) ? $item['id'] : $item->id,
                        'item_name' => is_array($item) ? $item['name'] : $item->name,
                        'price' => is_array($item) ? $item['final_price'] : $item->final_price,
                        'quantity' => is_array($item) ? $item['quantity'] : $item->quantity
                    ];
                })->toArray()
            ];
            
            $conversionScripts = PixelHelper::trackPurchase($orderData);
            Log::info('PaymentController - Scripts de conversión generados');

            // Enviar correo de resumen de compra
            try {
                Log::info('PaymentController - Preparando notificación de email');
                $details = $sale->details ?? $sale->saleDetails ?? $sale->sale_details ?? SaleDetail::where('sale_id', $sale->id)->get();
                $sale->notify(new PurchaseSummaryNotification($sale, $details));
                Log::info('PaymentController - Email enviado exitosamente');
            } catch (\Exception $emailException) {
                Log::warning('PaymentController - Error enviando email (no crítico)', [
                    'error' => $emailException->getMessage()
                ]);
                // No retornamos error aquí porque el pago ya se procesó exitosamente
            }

            return response()->json([
                'message' => 'Pago exitoso',
                'status' => true,
                'culqi_response' => $charge,
                'sale' => $request->cart,
                'code' => $request->orderNumber,
                'delivery' => $request->delivery,
                'conversion_scripts' => $conversionScripts,
                'sale_id' => $sale->id
            ]);
            
        } catch (\Exception $e) {
            Log::error('PaymentController - Error completo', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Error en el pago: ' . $e->getMessage(),
                'status' => false,
                'error' => $e->getMessage()
            ], 400);
        }
    }
}
