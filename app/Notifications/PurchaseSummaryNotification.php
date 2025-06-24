<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Mail\RawHtmlMail;
use App\Models\General;
use App\Models\SaleStatus;
use Illuminate\Support\Facades\Storage;

class PurchaseSummaryNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $sale;
    protected $details;

    public function __construct($sale, $details)
    {
        $this->sale = $sale;
        $this->details = $details;
    }

    /**
     * Variables disponibles para la plantilla de email.
     */
    public static function availableVariables()
    {
        return [
            'orderId'        => 'Código del pedido',
            'fecha_pedido'   => 'Fecha y hora del pedido',
            'status'         => 'Estado actual',
            'status_color'   => 'Color para mostrar el estado',
            'name'           => 'Nombre del cliente',
            'email'          => 'Correo electrónico del cliente',
            'year'           => 'Año actual',
            'total'          => 'Total de la compra',
            'subtotal'       => 'Subtotal de la compra',
            'costo_envio'    => 'Costo de envío',
            'direccion_envio' => 'Dirección de envío',
            'distrito'       => 'Distrito de envío',
            'provincia'      => 'Provincia de envío',
            'departamento'   => 'Departamento de envío',
            'telefono'       => 'Teléfono del cliente',



            'productos'      => 'Bloque repetible de productos: {{#productos}}...{{/productos}}. Variables: nombre, cantidad, sku, precio_unitario, precio_total, categoria, imagen',
        ];
    }

    // Recibe el correlative del cliente

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $template = General::where('correlative', 'purchase_summary_email')->first();
        // Armar array de productos para bloque repetible (con más detalles)
        $productos = [];
        foreach ($this->details as $detail) {
            $imgPath = $detail->image ?? ($detail->item->image ?? '');
            $imgUrl = '';
            if (preg_match('/^https?:\\/\\//i', $imgPath)) {
                $imgUrl = $imgPath;
            } elseif ($imgPath) {
                $imgUrl = url('storage/images/item/' . ltrim($imgPath, '/'));
            }
            $precio_unitario = isset($detail->price) ? number_format($detail->price, 2) : '';
            $cantidad = $detail->quantity ?? 1;
            $precio_total = (isset($detail->price) && $cantidad) ? number_format($detail->price * $cantidad, 2) : $precio_unitario;
            $productos[] = [
                'nombre'          => $detail->name ?? '',
                'cantidad'        => $cantidad,
                'sku'             => $detail->sku ?? ($detail->item->sku ?? ''),
                'precio_unitario' => $precio_unitario,
                'precio_total'    => $precio_total,
                'categoria'       => $detail->item->category->name ?? '',
                'imagen'          =>  url(Storage::url("images/item/" . $detail->item->image ?? '')),
            ];
        }
        $body = $template
            ? \App\Helpers\Text::replaceData($template->description, [
                'orderId'        => $this->sale->code,
                'fecha_pedido'   => $this->sale->created_at ? $this->sale->created_at->format('d/m/Y H:i') : '',
                'status'         => $this->sale->status->name ?? '',
                'status_color'   => optional(SaleStatus::where('name', $this->sale->status->name ?? '')->first())->color ?? '#6c757d',
                'nombre'           => $this->sale->name ?? ($this->sale->user->name ?? ''),
                'email'          => $this->sale->email ?? ($this->sale->user->email ?? ''),
                'telefono'       => $this->sale->phone ?? ($this->sale->user->phone ?? ''),
                'departamento'     => $this->sale->department ?? $this->sale->user->department ?? '',
                'provincia'       => $this->sale->province ?? $this->sale->user->province ?? '',
                'distrito'       => $this->sale->district ?? $this->sale->user->district ?? '',
                'direccion_envio' => $this->sale->address ?? $this->sale->user->address ?? '',
                'total'          => number_format($this->sale->amount ?? 0, 2),
                'subtotal'       => number_format($this->sale->amount - $this->sale->delivery ?? 0, 2),
                'costo_envio'    => number_format($this->sale->delivery ?? 0, 2),
                'year'           => date('Y'),
                'productos'      => $productos,
            ])
            : 'Plantilla no encontrada';

        $corporateEmail = General::where('correlative', 'corporative_email')->first();

        // return (new RawHtmlMail($body, '¡Gracias por tu compra!', $this->sale->email ?? ($this->sale->user->email ?? '')));
        return (new RawHtmlMail($body, '¡Gracias por tu compra!', $this->sale->email ?? ($this->sale->user->email ?? '')))
            ->bcc($corporateEmail->description ?? '');
    }
}
