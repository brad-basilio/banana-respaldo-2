<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Mail\RawHtmlMail;

class AdminClaimNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $complaint;
    protected $coorporative_email;

    public function __construct($complaint)
    {
        $this->complaint = $complaint;
        $this->coorporative_email = \App\Models\General::where('correlative', 'coorporative_email')->first();
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Variables disponibles para la plantilla de email del administrador.
     */
    public static function availableVariables()
    {
        return [
            'customer_name'        => 'Nombre del cliente',
            'customer_email'       => 'Correo electrónico del cliente',
            'customer_phone'       => 'Celular del cliente',
            'customer_document'    => 'Documento de identidad',
            'claim_type'           => 'Tipo de reclamo',
            'product_type'         => 'Tipo de producto',
            'claim_amount'         => 'Monto reclamado',
            'order_number'         => 'Número de pedido',
            'incident_date'        => 'Fecha de ocurrencia',
            'claim_detail'         => 'Detalle del reclamo',
            'customer_address'     => 'Dirección completa del cliente',
            'claim_date'           => 'Fecha del reclamo',
            'year'                 => 'Año actual',
            'admin_note'           => 'Nota para el administrador',

            // Variables compatibles con la plantilla existente
            'nombre'               => 'Nombre del cliente',
            'tipo_documento'       => 'Tipo de documento',
            'numero_identidad'     => 'Número de identidad',
            'celular'              => 'Celular',
            'correo_electronico'   => 'Correo electrónico',
            'departamento'         => 'Departamento',
            'provincia'            => 'Provincia',
            'distrito'             => 'Distrito',
            'direccion'            => 'Dirección',
            'tipo_producto'        => 'Tipo de producto',
            'monto_reclamado'      => 'Monto reclamado',
            'descripcion_producto' => 'Descripción del producto',
            'tipo_reclamo'         => 'Tipo de reclamo',
            'fecha_ocurrencia'     => 'Fecha de ocurrencia',
            'numero_pedido'        => 'Número de pedido',
            'detalle_reclamo'      => 'Detalle del reclamo',
        ];
    }

    public function toMail($notifiable)
    {
        // Buscar plantilla específica para administrador, si no existe usar la del cliente
        $template = \App\Models\General::where('correlative', 'admin_claim_email')->first();
        if (!$template) {
            $template = \App\Models\General::where('correlative', 'claim_email')->first();
        }

        $fullAddress = implode(', ', array_filter([
            $this->complaint->direccion,
            $this->complaint->distrito,
            $this->complaint->provincia,
            $this->complaint->departamento
        ]));

        $body = $template
            ? \App\Helpers\Text::replaceData($template->description, [
                // Variables para administrador
                'customer_name'        => $this->complaint->nombre ?? 'Sin nombre',
                'customer_email'       => $this->complaint->correo_electronico ?? 'No proporcionado',
                'customer_phone'       => $this->complaint->celular ?? 'No proporcionado',
                'customer_document'    => $this->complaint->tipo_documento . ': ' . $this->complaint->numero_identidad,
                'claim_type'           => ucfirst($this->complaint->tipo_reclamo ?? 'No especificado'),
                'product_type'         => ucfirst($this->complaint->tipo_producto ?? 'No especificado'),
                'claim_amount'         => $this->complaint->monto_reclamado ? 'S/ ' . number_format($this->complaint->monto_reclamado, 2) : 'No especificado',
                'order_number'         => $this->complaint->numero_pedido ?? 'No especificado',
                'incident_date'        => $this->complaint->fecha_ocurrencia ? date('d/m/Y', strtotime($this->complaint->fecha_ocurrencia)) : 'No especificada',
                'claim_detail'         => $this->complaint->detalle_reclamo,
                'customer_address'     => $fullAddress,
                'claim_date'           => $this->complaint->created_at ? $this->complaint->created_at->format('d/m/Y H:i:s') : now()->format('d/m/Y H:i:s'),
                'year'                 => date('Y'),
                'admin_note'           => 'Nuevo reclamo recibido que requiere tu atención inmediata.',
                'id_reclamo' => $this->complaint->id,
                // Variables compatibles con la plantilla existente
                'nombre'               => $this->complaint->nombre,
                'tipo_documento'       => $this->complaint->tipo_documento,
                'numero_identidad'     => $this->complaint->numero_identidad,
                'celular'              => $this->complaint->celular ?? 'No proporcionado',
                'correo_electronico'   => $this->complaint->correo_electronico,
                'departamento'         => $this->complaint->departamento,
                'provincia'            => $this->complaint->provincia,
                'distrito'             => $this->complaint->distrito,
                'direccion'            => $this->complaint->direccion,
                'tipo_producto'        => $this->complaint->tipo_producto,
                'monto_reclamado'      => $this->complaint->monto_reclamado ? number_format($this->complaint->monto_reclamado, 2) : '0.00',
                'descripcion_producto' => $this->complaint->descripcion_producto,
                'tipo_reclamo'         => $this->complaint->tipo_reclamo,
                'fecha_ocurrencia'     => $this->complaint->fecha_ocurrencia ? date('d \d\e F \d\e\l Y', strtotime($this->complaint->fecha_ocurrencia)) : 'No especificada',
                'numero_pedido'        => $this->complaint->numero_pedido ?? 'No especificado',
                'detalle_reclamo'      => $this->complaint->detalle_reclamo,
                'fecha_reclamo'        => $this->complaint->created_at ? date('d \d\e F \d\e\l Y', strtotime($this->complaint->created_at)) : date('d \d\e F \d\e\l Y'),
            ])
            : 'Nuevo reclamo recibido de: ' . $this->complaint->nombre . ' (' . $this->complaint->correo_electronico . ')';

        return (new RawHtmlMail(
            $body,
            '[NUEVO RECLAMO] Reclamo de: ' . $this->complaint->nombre,
            $this->coorporative_email->description
        ));
    }
}
