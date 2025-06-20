<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Mail\RawHtmlMail;
use Illuminate\Support\Facades\Storage;

class AdminPurchaseNotification extends Notification implements ShouldQueue
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
     * Variables disponibles para la plantilla de email del administrador.
     */
    public static function availableVariables()
    {
        return [
            'orderId'         => 'Código del pedido',
            'fecha_pedido'    => 'Fecha y hora del pedido',
            'status'          => 'Estado actual',
            'status_color'    => 'Color para mostrar el estado',
            'customer_name'   => 'Nombre del cliente',
            'customer_email'  => 'Correo electrónico del cliente',
            'customer_phone'  => 'Teléfono del cliente',
            'year'            => 'Año actual',
            'total'           => 'Total de la compra',
            'subtotal'        => 'Subtotal de la compra (sin IGV)',
            'igv'             => 'Impuesto General a las Ventas (18%)',
            'costo_envio'     => 'Costo de envío',
            'direccion_envio' => 'Dirección de envío completa',
            'distrito'        => 'Distrito de envío',
            'provincia'       => 'Provincia de envío',
            'departamento'    => 'Departamento de envío',
            'referencia'      => 'Referencia del cliente',
            'comentario'      => 'Comentarios del cliente',
            
            // Variables del cupón
            'cupon_codigo'    => 'Código del cupón aplicado',
            'cupon_descuento' => 'Descuento del cupón aplicado',
            
            // Variables de facturación
            'invoice_type'    => 'Tipo de comprobante',
            'document_type'   => 'Tipo de documento',
            'document'        => 'Número de documento',
            'business_name'   => 'Razón social (si aplica)',
            
            // Variables de productos
            'productos_detalle' => 'Lista detallada de productos comprados',
            'productos_cantidad' => 'Cantidad total de productos',
            
            // Variables de pago
            'payment_method'  => 'Método de pago',
            'payment_id'      => 'ID de transacción de pago',
        ];
    }

    public function via($notifiable)
    {
        return ['mail'];
    }    public function toMail($notifiable)
    {
        // Buscar plantilla específica para administrador, si no existe usar la del cliente
        $template = \App\Models\General::where('correlative', 'admin_purchase_email')->first();
        if (!$template) {
            $template = \App\Models\General::where('correlative', 'purchase_summary_email')->first();
        }

        // Calcular valores monetarios - REPLICANDO LA LÓGICA DE PurchaseSummaryNotification
        // amount ya es el total final (con IGV, envío y descuento de cupón aplicado)
        $totalAmount = $this->sale->amount ?? 0;
        $deliveryCost = $this->sale->delivery ?? 0;
        $couponDiscount = $this->sale->coupon_discount ?? 0;
        
        // Para mostrar el desglose correcto, necesitamos calcular el subtotal ORIGINAL
        // (antes del descuento del cupón) para que coincida con lo que se muestra en web
        
        // Paso 1: Obtener el total sin envío
        $totalSinEnvio = $totalAmount - $deliveryCost;
        
        // Paso 2: Agregar el descuento del cupón para obtener el total original (antes del cupón)
        $totalOriginalSinEnvio = $totalSinEnvio + $couponDiscount;
        
        // Paso 3: Separar subtotal e IGV del total original
        $subtotalAmount = $totalOriginalSinEnvio / 1.18;  // Subtotal sin IGV
        $igvAmount = $totalOriginalSinEnvio - $subtotalAmount;  // IGV del subtotal

        // Crear dirección completa
        $direccion_completa = collect([
            $this->sale->address,
            $this->sale->number,
            $this->sale->district,
            $this->sale->province,
            $this->sale->departamento
        ])->filter()->implode(', ');

        // Generar detalle de productos
        $productos_detalle = $this->details->map(function($detail) {
            return "• {$detail->name} (Cant: {$detail->quantity}) - S/ " . number_format($detail->price, 2);
        })->implode("\n");

        $body = $template
            ? \App\Helpers\Text::replaceData($template->description, [
                'orderId'         => $this->sale->code,
                'fecha_pedido'    => $this->sale->created_at->format('d/m/Y H:i:s'),
                'status'          => $this->sale->status->name ?? 'Pagado',
                'status_color'    => '#28a745', // Verde para pagado
                'customer_name'   => $this->sale->name . ' ' . $this->sale->lastname,
                'customer_email'  => $this->sale->email,
                'customer_phone'  => $this->sale->phone,
                'year'            => date('Y'),
                'total'           => 'S/ ' . number_format($totalAmount, 2),
                'subtotal'        => 'S/ ' . number_format($subtotalAmount, 2),
                'igv'             => 'S/ ' . number_format($igvAmount, 2),
                'costo_envio'     => 'S/ ' . number_format($deliveryCost, 2),
                'direccion_envio' => $direccion_completa,
                'distrito'        => $this->sale->district,
                'provincia'       => $this->sale->province,
                'departamento'    => $this->sale->department,
                'referencia'      => $this->sale->reference,
                'comentario'      => $this->sale->comment,
                
                // Variables del cupón
                'cupon_codigo'    => $this->sale->coupon_code ?? 'No aplicado',
                'cupon_descuento' => 'S/ ' . number_format($couponDiscount, 2),
                
                // Variables de facturación
                'invoice_type'    => $this->sale->invoiceType ?? 'Boleta',
                'document_type'   => $this->sale->documentType ?? 'DNI',
                'document'        => $this->sale->document ?? 'No especificado',
                'business_name'   => $this->sale->businessName ?? 'No aplica',
                
                // Variables de productos
                'productos_detalle' => $productos_detalle,
                'productos_cantidad' => $this->details->sum('quantity'),
                
                // Variables de pago
                'payment_method'  => 'Tarjeta de Crédito/Débito (Culqi)',
                'payment_id'      => $this->sale->culqi_charge_id,
            ])
            : 'Nueva compra realizada - Pedido #' . $this->sale->code;

        return (new MailMessage)
            ->subject('[NUEVA COMPRA] Pedido #' . $this->sale->code . ' - ' . $this->sale->name)
            ->view('emails.raw-html', ['body' => $body]);
    }
}
