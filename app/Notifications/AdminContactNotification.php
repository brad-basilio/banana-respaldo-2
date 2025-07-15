<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Mail\RawHtmlMail;
use Illuminate\Support\Facades\Storage;

class AdminContactNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $message;
    protected $coorporative_email;

    public function __construct($message)
    {
        $this->message = $message;
        $this->coorporative_email = \App\Models\General::where('correlative', 'coorporative_email')->first();
    }

    /**
     * Variables disponibles para la plantilla de email del administrador.
     */
    public static function availableVariables()
    {
        return [
            'customer_name'    => 'Nombre del cliente',
            'customer_email'   => 'Correo electrónico del cliente',
            'customer_phone'   => 'Teléfono del cliente',
            'message_subject'  => 'Asunto del mensaje',
            'message_content'  => 'Contenido del mensaje',
            'fecha_contacto'   => 'Fecha y hora del contacto',
            'year'             => 'Año actual',
            'admin_note'       => 'Nota para el administrador',
        ];
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        // Buscar plantilla específica para administrador, si no existe usar la del cliente
        $template = \App\Models\General::where('correlative', 'admin_contact_email')->first();
        if (!$template) {
            $template = \App\Models\General::where('correlative', 'message_contact_email')->first();
        }

        $body = $template
            ? \App\Helpers\Text::replaceData($template->description, [
                'customer_name'    => $this->message->name ?? 'Sin nombre',
                'customer_email'   => $this->message->email ?? 'No proporcionado',
                'customer_phone'   => $this->message->phone ?? 'No proporcionado',
                'message_subject'  => $this->message->subject ?? 'Sin asunto',
                'message_content'  => $this->message->description,
                'fecha_contacto'   => $this->message->created_at ? $this->message->created_at->format('d/m/Y H:i:s') : now()->format('d/m/Y H:i:s'),
                'year'             => date('Y'),
                'admin_note'       => 'Este es un nuevo mensaje de contacto que requiere tu atención.',

                //Variables compatibles con la plantilla existente
                'nombre'           => $this->message->name,
                'descripcion'      => $this->message->description,
                'email'            => $this->message->email,
                'telefono'         => $this->message->phone ?? 'No proporcionado',
            ])
            : 'Nuevo mensaje de contacto recibido de: ' . $this->message->name;

        return (new RawHtmlMail($body, '[NUEVO CONTACTO] Mensaje de: ' . $this->message->name, $this->coorporative_email->description));
    }
}
