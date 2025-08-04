<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Mail\RawHtmlMail;

class VerifyAccountNotification extends Notification implements ShouldQueue
{
    use Queueable;
    protected $verificationUrl;
    protected $cuponDescuento;
    protected $mensajeCupon;

    public function __construct($verificationUrl, $cuponDescuento = null, $mensajeCupon = null)
    {
        $this->verificationUrl = $verificationUrl;
        $this->cuponDescuento = $cuponDescuento;
        $this->mensajeCupon = $mensajeCupon ?: 'Usa este cupón en tu primera compra para obtener un descuento especial.';
    }

        /**
     * Variables disponibles para la plantilla de email.
     */
    public static function availableVariables()
    {
        return [
            'verificationUrl' => 'Enlace para verificar la cuenta',
            'nombre' => 'Nombre del usuario',
            'apellido' => 'Apellido del usuario',
            'email' => 'Correo electrónico',
            'year' => 'Año actual',
            'fecha_registro' => 'Fecha de registro',
            'cupon_descuento' => 'Cupón de descuento para primera compra',
            'mensaje_cupon' => 'Mensaje sobre el cupón de descuento',
        ];
    }

    public function via($notifiable)
    {
        return ['mail'];
    }
    public function toMail($notifiable)
    {
        $template = \App\Models\General::where('correlative', 'verify_account_email')->first();
        $body = $template
            ? \App\Helpers\Text::replaceData($template->description, [
                'verificationUrl' => $this->verificationUrl,
                'nombre' => $notifiable->name ?? '',
                'apellido' => $notifiable->lastname ?? '',
                'email' => $notifiable->email ?? '',
                'year' => date('Y'),
                'fecha_registro' => $notifiable->created_at->translatedFormat('d \d\e F \d\e\l Y'),
                'cupon_descuento' => $this->cuponDescuento ?? '',
                'mensaje_cupon' => $this->cuponDescuento ? $this->mensajeCupon : '',
            ])
            : 'Plantilla no encontrada';
        return (new RawHtmlMail($body, 'Verifica tu cuenta',$notifiable->email));
    }
}
