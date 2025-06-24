<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Mail\RawHtmlMail;
use App\Models\General;
use App\Models\SaleStatus;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OrderStatusChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $sale;
    protected $details;

    public function __construct($sale, $details = null)
    {
        $this->sale = $sale;
        $this->details = $details ?? $sale->details;
    }
    /**
     * Variables disponibles para la plantilla de email.
     */
    public static function availableVariables()
    {
        return [
            'orderId'      => 'Código del pedido',
            'fecha_pedido' => 'Fecha del pedido',
            'status'       => 'Estado actual',
            'status_color' => 'Color para mostrar el estado',
            'name'         => 'Nombre del cliente',
            'year'         => 'Año actual',
            'productos'    => 'Bloque repetible de productos: {{#productos}}...{{/productos}}. Variables: nombre, cantidad, precio, categoria, imagen',
        ];
    }

    public function via($notifiable)
    {
        return ['mail'];
    }


    public function toMail($notifiable)
    {
        // \Log::info('Enviando a: ' . $notifiable->email);
        $template = General::where('correlative', 'order_status_changed_email')->first();
        $content = $template ? $template->description : '';

        // Construir array de productos para el bloque repetible
        $productos = [];
        // Log::info('Detalles recibidos:', (array) $this->details);
        // Log::info('Entrando al foreach de detalles...');
        foreach ($this->details as $detail) {


            // Log::info('Productos array generado:', $productos);
            $productos[] = [
                'nombre'    => $detail->name ?? '',
                'cantidad'  => $detail->quantity ?? '',
                'precio'    => isset($detail->price) ? number_format($detail->price, 2) : '',
                'categoria' => isset($detail->item) && isset($detail->item->category) && isset($detail->item->category->name) ? $detail->item->category->name : '',
                'imagen'    => url(Storage::url("images/item/" . $detail->item->image ?? '')), // SOLO "imagen"
            ];
        }

        $body = $template
            ? \App\Helpers\Text::replaceData($content, [
                'orderId'      => $this->sale->code,
                'status'       => $this->sale->status->name,
                'status_color' => optional(SaleStatus::where('name', $this->sale->status->name)->first())->color ?? '#6c757d',
                'name'         => $this->sale->user->name ?? $this->sale->name ?? '',
                'year'         => date('Y'),
                'fecha_pedido' => $this->sale->created_at
                    ? $this->sale->created_at->translatedFormat('d \d\e F \d\e\l Y')
                    : '',
                'productos'    => $productos,
            ])
            : 'Plantilla no encontrada';

        // \Log::info('Cuerpo: ' . $body);
        $toEmail = $notifiable->email ?? $this->sale->email ?? $this->sale->user->email;
        dump('Dentro de notifier');
        return (new RawHtmlMail(
            $body,
            'Estado de tu pedido actualizado',
            $toEmail
        ));
    }
}
