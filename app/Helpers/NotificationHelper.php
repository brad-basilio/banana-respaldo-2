<?php

namespace App\Helpers;

use App\Models\General;
use App\Notifications\AdminPurchaseNotification;
use App\Notifications\AdminContactNotification;
use App\Notifications\PurchaseSummaryNotification;
use App\Notifications\MessageContactNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class NotificationHelper
{
    /**
     * Obtiene el email corporativo desde la configuración
     */
    public static function getCorporateEmail()
    {
        try {
            $corporate = General::where('correlative', 'coorporative_email')->first();
            $email = $corporate ? $corporate->description : null;
            
            Log::info('NotificationHelper - Email corporativo obtenido', [
                'email' => $email
            ]);
            
            return $email;
        } catch (\Exception $e) {
            Log::error('NotificationHelper - Error obteniendo email corporativo', [
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }    /**
     * Envía una notificación tanto al destinatario original como al administrador
     */
    public static function sendToClientAndAdmin($originalNotifiable, $notification)
    {
        try {
            // Enviar al cliente/destinatario original
            $originalNotifiable->notify($notification);
            Log::info('NotificationHelper - Notificación enviada al cliente');

            // Enviar al administrador con notificación específica
            $corporateEmail = self::getCorporateEmail();
            if ($corporateEmail) {
                $adminNotification = self::createAdminNotification($notification);
                if ($adminNotification) {
                    Notification::route('mail', $corporateEmail)->notify($adminNotification);
                    Log::info('NotificationHelper - Notificación específica enviada al administrador', [
                        'admin_email' => $corporateEmail,
                        'notification_type' => get_class($adminNotification)
                    ]);
                } else {
                    // Fallback: usar la misma notificación
                    Notification::route('mail', $corporateEmail)->notify($notification);
                    Log::info('NotificationHelper - Notificación genérica enviada al administrador', [
                        'admin_email' => $corporateEmail
                    ]);
                }
            } else {
                Log::warning('NotificationHelper - No se pudo enviar al administrador: email corporativo no configurado');
            }
        } catch (\Exception $e) {
            Log::error('NotificationHelper - Error enviando notificaciones', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }    /**
     * Crea una notificación específica para el administrador basada en la notificación original
     */
    private static function createAdminNotification($originalNotification)
    {
        try {
            // Usar reflection para acceder a las propiedades protegidas
            $reflection = new \ReflectionClass($originalNotification);
            
            if ($originalNotification instanceof PurchaseSummaryNotification) {
                $saleProperty = $reflection->getProperty('sale');
                $saleProperty->setAccessible(true);
                $sale = $saleProperty->getValue($originalNotification);
                
                $detailsProperty = $reflection->getProperty('details');
                $detailsProperty->setAccessible(true);
                $details = $detailsProperty->getValue($originalNotification);
                
                return new AdminPurchaseNotification($sale, $details);
                
            } elseif ($originalNotification instanceof MessageContactNotification) {
                $messageProperty = $reflection->getProperty('message');
                $messageProperty->setAccessible(true);
                $message = $messageProperty->getValue($originalNotification);
                
                return new AdminContactNotification($message);
            }
            
            return null;
        } catch (\Exception $e) {
            Log::error('NotificationHelper - Error creando notificación para admin', [
                'error' => $e->getMessage(),
                'original_notification' => get_class($originalNotification)
            ]);
            return null;
        }
    }

    /**
     * Envía notificación específica de compra (para casos especiales)
     */
    public static function sendPurchaseNotification($sale, $details)
    {
        try {
            // Al cliente
            $sale->notify(new PurchaseSummaryNotification($sale, $details));
            
            // Al administrador
            $corporateEmail = self::getCorporateEmail();
            if ($corporateEmail) {
                Notification::route('mail', $corporateEmail)->notify(new AdminPurchaseNotification($sale, $details));
            }
            
            Log::info('NotificationHelper - Notificaciones de compra enviadas exitosamente');
        } catch (\Exception $e) {
            Log::error('NotificationHelper - Error enviando notificaciones de compra', [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Envía notificación específica de contacto (para casos especiales)
     */
    public static function sendContactNotification($message)
    {
        try {
            // Al cliente (si tiene email)
            if ($message->email) {
                $message->notify(new MessageContactNotification($message));
            }
            
            // Al administrador
            $corporateEmail = self::getCorporateEmail();
            if ($corporateEmail) {
                Notification::route('mail', $corporateEmail)->notify(new AdminContactNotification($message));
            }
            
            Log::info('NotificationHelper - Notificaciones de contacto enviadas exitosamente');
        } catch (\Exception $e) {
            Log::error('NotificationHelper - Error enviando notificaciones de contacto', [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
}
