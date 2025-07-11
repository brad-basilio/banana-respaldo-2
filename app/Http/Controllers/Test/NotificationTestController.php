<?php

namespace App\Http\Controllers\Test;

use App\Http\Controllers\Controller;
use App\Helpers\NotificationHelper;
use App\Models\Message;
use App\Models\Sale;
use App\Models\SaleDetail;
use App\Notifications\PurchaseSummaryNotification;
use App\Notifications\MessageContactNotification;
use Illuminate\Http\Request;

class NotificationTestController extends Controller
{
    /**
     * Página de pruebas de notificaciones
     */
    public function index()
    {
        return view('test.notifications');
    }

    /**
     * Probar envío de notificación de contacto
     */
    public function testContactNotification(Request $request)
    {
        try {
            // Crear un mensaje de prueba
            $message = new Message([
                'name' => 'Juan Pérez',
                'email' => 'cliente@ejemplo.com',
                'phone' => '987654321',
                'subject' => 'Prueba de contacto',
                'description' => 'Este es un mensaje de prueba para verificar las notificaciones.'
            ]);
            $message->save();

            // Enviar notificaciones
            NotificationHelper::sendToClientAndAdmin($message, new MessageContactNotification($message));

            return response()->json([
                'status' => 'success',
                'message' => 'Notificación de contacto enviada exitosamente',
                'corporate_email' => NotificationHelper::getCorporateEmail()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error enviando notificación: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Probar envío de notificación de compra
     */
    public function testPurchaseNotification(Request $request)
    {
        try {
            // Buscar una venta existente o crear una de prueba
            $sale = Sale::first();
            if (!$sale) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No hay ventas disponibles para probar. Realiza una compra primero.'
                ], 404);
            }

            $details = SaleDetail::where('sale_id', $sale->id)->get();

            // Enviar notificaciones
            NotificationHelper::sendToClientAndAdmin($sale, new PurchaseSummaryNotification($sale, $details));

            return response()->json([
                'status' => 'success',
                'message' => 'Notificación de compra enviada exitosamente',
                'sale_id' => $sale->id,
                'corporate_email' => NotificationHelper::getCorporateEmail()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error enviando notificación: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar configuración de email corporativo
     */
    public function checkCorporateEmail()
    {
        $corporateEmail = NotificationHelper::getCorporateEmail();
        
        return response()->json([
            'corporate_email' => $corporateEmail,
            'is_configured' => !empty($corporateEmail),
            'status' => !empty($corporateEmail) ? 'configured' : 'not_configured'
        ]);
    }
}
