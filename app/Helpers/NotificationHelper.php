<?php

namespace App\Helpers;

use App\Models\General;
use App\Notifications\AdminPurchaseNotification;
use App\Notifications\AdminContactNotification;
use App\Notifications\PurchaseSummaryNotification;
use App\Notifications\MessageContactNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Mail;

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
    }

    /**
     * Verifica si un email pertenece a Zoho Mail
     */
    public static function isZohoEmail($email)
    {
        if (!$email) return false;
        
        $zohoPatterns = [
            '@zoho.com',
            '@zohomail.com',
            // También verificar si usa servidores de Zoho con dominio personalizado
        ];
        
        foreach ($zohoPatterns as $pattern) {
            if (strpos(strtolower($email), $pattern) !== false) {
                return true;
            }
        }
        
        // Verificar si es un dominio personalizado que usa Zoho
        // Esto requeriría verificar los registros MX, pero por ahora 
        // asumimos que dominios como s-tech.com.pe podrían usar Zoho
        $domain = substr(strrchr($email, "@"), 1);
        $possibleZohoDomains = ['s-tech.com.pe']; // Agregar más dominios conocidos que usan Zoho
        
        return in_array(strtolower($domain), $possibleZohoDomains);
    }    /**
     * Envía una notificación tanto al destinatario original como al administrador
     */
    public static function sendToClientAndAdmin($originalNotifiable, $notification)
    {
        try {
            // Enviar al cliente/destinatario original
            if ($originalNotifiable->email) {
                Log::info('NotificationHelper - Enviando notificación al cliente', [
                    'client_email' => $originalNotifiable->email,
                    'notification_type' => get_class($notification)
                ]);
                
                $originalNotifiable->notify($notification);
                Log::info('NotificationHelper - Notificación enviada al cliente exitosamente');
            } else {
                Log::warning('NotificationHelper - Cliente sin email, saltando envío al cliente');
            }

            // Enviar al administrador con notificación específica
            $corporateEmail = self::getCorporateEmail();
            if ($corporateEmail) {
                Log::info('NotificationHelper - Preparando envío al administrador', [
                    'admin_email' => $corporateEmail,
                    'is_zoho' => self::isZohoEmail($corporateEmail),
                    'mail_config' => [
                        'host' => config('mail.mailers.smtp.host'),
                        'port' => config('mail.mailers.smtp.port'),
                        'encryption' => config('mail.mailers.smtp.encryption'),
                        'from_address' => config('mail.from.address'),
                        'from_name' => config('mail.from.name')
                    ]
                ]);

                $adminNotification = self::createAdminNotification($notification);
                if ($adminNotification) {
                    Log::info('NotificationHelper - Enviando notificación específica al administrador');
                    Notification::route('mail', $corporateEmail)->notify($adminNotification);
                    Log::info('NotificationHelper - Notificación específica enviada al administrador exitosamente', [
                        'admin_email' => $corporateEmail,
                        'notification_type' => get_class($adminNotification)
                    ]);
                } else {
                    // Fallback: usar la misma notificación
                    Log::info('NotificationHelper - Enviando notificación genérica al administrador');
                    Notification::route('mail', $corporateEmail)->notify($notification);
                    Log::info('NotificationHelper - Notificación genérica enviada al administrador exitosamente', [
                        'admin_email' => $corporateEmail
                    ]);
                }

                // Verificación adicional para Zoho
                if (self::isZohoEmail($corporateEmail)) {
                    Log::info('NotificationHelper - Email Zoho detectado, verificando configuraciones adicionales', [
                        'zoho_email' => $corporateEmail,
                        'recommendations' => [
                            'verify_spf_record' => 'Verificar registro SPF del dominio',
                            'verify_dkim' => 'Verificar configuración DKIM',
                            'check_spam_folder' => 'Revisar carpeta de spam en Zoho',
                            'whitelist_sender' => 'Agregar remitente a lista blanca'
                        ]
                    ]);
                }
            } else {
                Log::warning('NotificationHelper - No se pudo enviar al administrador: email corporativo no configurado');
            }
        } catch (\Exception $e) {
            Log::error('NotificationHelper - Error enviando notificaciones', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'admin_email' => $corporateEmail ?? 'not_set',
                'is_zoho' => isset($corporateEmail) ? self::isZohoEmail($corporateEmail) : false
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

    /**
     * Envía un correo optimizado para Zoho Mail
     */
    public static function sendZohoOptimizedEmail($to, $subject, $content, $isHtml = false)
    {
        try {
            Log::info('NotificationHelper - Enviando correo optimizado para Zoho', [
                'to' => $to,
                'subject' => $subject,
                'is_zoho' => self::isZohoEmail($to)
            ]);

            if ($isHtml) {
                Mail::html($content, function ($message) use ($to, $subject) {
                    $message->to($to)
                            ->subject($subject)
                            ->from(config('mail.from.address'), config('mail.from.name'))
                            ->replyTo(config('mail.from.address'), config('mail.from.name'));
                    
                    // Headers optimizados para Zoho
                    $message->getHeaders()
                            ->addTextHeader('X-Mailer', 'Laravel-STP')
                            ->addTextHeader('X-Priority', '3')
                            ->addTextHeader('List-Unsubscribe', '<mailto:' . config('mail.from.address') . '>')
                            ->addTextHeader('Precedence', 'bulk');
                });
            } else {
                Mail::raw($content, function ($message) use ($to, $subject) {
                    $message->to($to)
                            ->subject($subject)
                            ->from(config('mail.from.address'), config('mail.from.name'))
                            ->replyTo(config('mail.from.address'), config('mail.from.name'));
                    
                    // Headers optimizados para Zoho
                    $message->getHeaders()
                            ->addTextHeader('X-Mailer', 'Laravel-STP')
                            ->addTextHeader('X-Priority', '3');
                });
            }

            Log::info('NotificationHelper - Correo optimizado enviado exitosamente', [
                'to' => $to
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('NotificationHelper - Error enviando correo optimizado', [
                'to' => $to,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
}
