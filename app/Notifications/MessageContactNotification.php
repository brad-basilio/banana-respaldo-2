<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Mail\RawHtmlMail;
use Illuminate\Support\Facades\Storage;

class MessageContactNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $message;

    public function __construct($message)
    {
        $this->message = $message;
    }

      /**
     * Variables disponibles para la plantilla de email.
     */
    public static function availableVariables()
    {
        return [
            'nombre' => 'Nombre del remitente',
            'descripcion' => 'Descripción del mensaje',
            'email' => 'Correo electrónico del remitente',
            'telefono' => 'Teléfono del remitente',
            'fecha_contacto' => 'Fecha de contacto',
        ];
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
         \Log::info('Enviando a: ' . $notifiable->description);
        $template = \App\Models\General::where('correlative', 'message_contact_email')->first();
        $body = $template
            ? \App\Helpers\Text::replaceData($template->description, [

                'nombre' => $this->message->name,
                'descripcion' => $this->message->description,
                'email' => $this->message->email,
                'telefono' => $this->message->phone,
                'year'         => date('Y'),
                'fecha_contacto' => $this->message->created_at
                    ? $this->message->created_at->translatedFormat('d \d\e F \d\e\l Y')
                    : '',
            ])
            : 'Plantilla no encontrada';
        return (new RawHtmlMail($body, 'Gracias por contactarnos: ' . $this->message->name, $notifiable->email));
    }
}
