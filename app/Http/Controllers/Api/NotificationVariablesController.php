<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationVariablesController extends Controller
{
    public function getVariables($type)
    {
        $variables = [];

        switch ($type) {
            case 'purchase_summary':
                $variables = [
                    'user_name' => 'Nombre del usuario',
                    'order_id' => 'ID del pedido',
                    'order_total' => 'Total del pedido',
                    'order_date' => 'Fecha del pedido',
                    'order_items' => 'Lista de productos',
                    'shipping_address' => 'Dirección de envío',
                    'payment_method' => 'Método de pago',
                ];
                break;

            case 'order_status_changed':
                $variables = [
                    'user_name' => 'Nombre del usuario',
                    'order_id' => 'ID del pedido',
                    'old_status' => 'Estado anterior',
                    'new_status' => 'Nuevo estado',
                    'order_date' => 'Fecha del pedido',
                    'tracking_number' => 'Número de seguimiento',
                ];
                break;

            case 'blog_published':
                $variables = [
                    'user_name' => 'Nombre del usuario',
                    'blog_title' => 'Título del blog',
                    'blog_excerpt' => 'Extracto del blog',
                    'blog_url' => 'URL del blog',
                    'publish_date' => 'Fecha de publicación',
                ];
                break;

            case 'claim':
                $variables = [
                    'user_name' => 'Nombre del usuario',
                    'claim_id' => 'ID del reclamo',
                    'claim_subject' => 'Asunto del reclamo',
                    'claim_status' => 'Estado del reclamo',
                    'claim_date' => 'Fecha del reclamo',
                    'order_id' => 'ID del pedido relacionado',
                ];
                break;

            case 'password_changed':
                $variables = [
                    'user_name' => 'Nombre del usuario',
                    'user_email' => 'Email del usuario',
                    'change_date' => 'Fecha del cambio',
                    'ip_address' => 'Dirección IP',
                ];
                break;

            case 'password_reset':
                $variables = [
                    'user_name' => 'Nombre del usuario',
                    'reset_url' => 'URL para restablecer contraseña',
                    'expiry_time' => 'Tiempo de expiración',
                ];
                break;

            case 'subscription':
                $variables = [
                    'user_name' => 'Nombre del usuario',
                    'user_email' => 'Email del usuario',
                    'subscription_date' => 'Fecha de suscripción',
                    'unsubscribe_url' => 'URL para cancelar suscripción',
                ];
                break;

            case 'verify_account':
                $variables = [
                    'user_name' => 'Nombre del usuario',
                    'verification_url' => 'URL de verificación',
                    'expiry_time' => 'Tiempo de expiración',
                ];
                break;

            default:
                $variables = [];
        }

        return response()->json([
            'type' => $type,
            'variables' => $variables
        ]);
    }
}
