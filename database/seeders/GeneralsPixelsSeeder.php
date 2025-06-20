<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\General;

class GeneralsPixelsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {        $generals = [
            // Email corporativo
            [
                'correlative' => 'coorporative_email',
                'name' => 'Email Corporativo',
                'description' => '',
            ],            // Plantillas de email para administrador
            [
                'correlative' => 'admin_purchase_email',
                'name' => 'Plantilla Email Admin - Nueva Compra',
                'description' => '<!-- Contenedor principal para admin -->
<table border="0" width="100%" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td style="padding: 20px 0;" align="center">
<!-- Email container -->
<table style="background-color: #ffffff; border-radius: 16px; box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 30px; overflow: hidden; width: 600px;" border="0" width="600" cellspacing="0" cellpadding="0">
<!-- Header Admin -->
<tbody>
<tr>
<td style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 40px 30px; text-align: center; color: white;">
<img src="https://s-tech.com.pe/storage/images/image_emails/7c07b846-ab76-4c45-8e60-9a0156564296.png" alt="S-tech Peru" width="120" height="53">
<h1 style="font-size: 28px; font-weight: 800; margin: 20px 0 8px 0; color: white; letter-spacing: -0.5px;">🔔 Nueva Compra Recibida</h1>
<p style="font-size: 16px; color: rgba(255, 255, 255, 0.9); margin: 0;">Pedido #{orderId} requiere tu atención</p>
</td>
</tr>

<!-- Alert Section -->
<tr>
<td style="padding: 30px; background-color: #fef3c7; border-left: 5px solid #f59e0b;">
<h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 18px;">⚠️ ACCIÓN REQUERIDA</h3>
<p style="margin: 0; color: #92400e; font-size: 14px;">Un nuevo pedido necesita ser procesado y preparado para envío.</p>
</td>
</tr>

<!-- Customer Info Section -->
<tr>
<td style="padding: 30px;">
<table style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px;" border="0" width="100%" cellspacing="0" cellpadding="0">
<tr>
<td style="padding: 20px;">
<h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 0 0 15px 0; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">👤 INFORMACIÓN DEL CLIENTE</h3>
<table border="0" width="100%" cellspacing="0" cellpadding="0">
<tr>
<td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
<strong style="color: #374151;">Cliente:</strong>
</td>
<td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #1f2937;">
{customer_name}
</td>
</tr>
<tr>
<td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
<strong style="color: #374151;">Email:</strong>
</td>
<td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #1f2937;">
{customer_email}
</td>
</tr>
<tr>
<td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
<strong style="color: #374151;">Teléfono:</strong>
</td>
<td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #1f2937;">
{customer_phone}
</td>
</tr>
<tr>
<td style="padding: 8px 0;">
<strong style="color: #374151;">Fecha Pedido:</strong>
</td>
<td style="padding: 8px 0; text-align: right; color: #1f2937;">
{fecha_pedido}
</td>
</tr>
</table>
</td>
</tr>
</table>

<!-- Order Status -->
<table style="background: linear-gradient(135deg, #059669 0%, #047857 100%); border-radius: 12px; margin-bottom: 20px;" border="0" width="100%" cellspacing="0" cellpadding="0">
<tr>
<td style="padding: 25px; text-align: center; color: white;">
<h3 style="font-size: 20px; font-weight: bold; margin: 0 0 8px 0;">💳 PAGO CONFIRMADO</h3>
<p style="font-size: 16px; margin: 0; opacity: 0.9;">Pedido #{orderId} - Total: {total}</p>
</td>
</tr>
</table>

<!-- Products Section -->
<table style="background-color: #ffffff; border: 2px solid #e5e7eb; border-radius: 12px; margin-bottom: 20px;" border="0" width="100%" cellspacing="0" cellpadding="0">
<tr>
<td style="padding: 20px;">
<h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 0 0 15px 0; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">📦 PRODUCTOS A PREPARAR</h3>
<div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; font-family: monospace; white-space: pre-line; border-left: 4px solid #ef4444;">{productos_detalle}</div>
<p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;"><strong>Total de items:</strong> {productos_cantidad}</p>
</td>
</tr>
</table>

<!-- Shipping Info -->
<table style="background-color: #dbeafe; border: 2px solid #3b82f6; border-radius: 12px; margin-bottom: 20px;" border="0" width="100%" cellspacing="0" cellpadding="0">
<tr>
<td style="padding: 20px;">
<h3 style="font-size: 18px; font-weight: bold; color: #1e40af; margin: 0 0 15px 0;">🚚 DIRECCIÓN DE ENVÍO</h3>
<p style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">{direccion_envio}</p>
<p style="margin: 0 0 8px 0; color: #374151;"><strong>Distrito:</strong> {distrito}, <strong>Provincia:</strong> {provincia}</p>
<p style="margin: 0 0 8px 0; color: #374151;"><strong>Departamento:</strong> {departamento}</p>
<p style="margin: 0; color: #6b7280;"><strong>Referencia:</strong> {referencia}</p>
</td>
</tr>
</table>

<!-- Payment Summary -->
<table style="background-color: #f0fdf4; border: 2px solid #16a34a; border-radius: 12px; margin-bottom: 20px;" border="0" width="100%" cellspacing="0" cellpadding="0">
<tr>
<td style="padding: 20px;">
<h3 style="font-size: 18px; font-weight: bold; color: #15803d; margin: 0 0 15px 0;">💰 RESUMEN FINANCIERO</h3>
<table border="0" width="100%" cellspacing="0" cellpadding="0">
<tr>
<td style="padding: 5px 0; color: #374151;"><strong>Subtotal:</strong></td>
<td style="padding: 5px 0; text-align: right; color: #1f2937; font-weight: 600;">{subtotal}</td>
</tr>
<tr>
<td style="padding: 5px 0; color: #374151;"><strong>IGV (18%):</strong></td>
<td style="padding: 5px 0; text-align: right; color: #1f2937; font-weight: 600;">{igv}</td>
</tr>
<tr>
<td style="padding: 5px 0; color: #374151;"><strong>Envío:</strong></td>
<td style="padding: 5px 0; text-align: right; color: #1f2937; font-weight: 600;">{costo_envio}</td>
</tr>
<tr>
<td style="padding: 5px 0; color: #374151;"><strong>Descuento ({cupon_codigo}):</strong></td>
<td style="padding: 5px 0; text-align: right; color: #dc2626; font-weight: 600;">-{cupon_descuento}</td>
</tr>
<tr style="border-top: 2px solid #16a34a;">
<td style="padding: 10px 0 5px 0; color: #15803d; font-size: 18px;"><strong>TOTAL:</strong></td>
<td style="padding: 10px 0 5px 0; text-align: right; color: #15803d; font-size: 20px; font-weight: bold;">{total}</td>
</tr>
</table>
</td>
</tr>
</table>

<!-- Billing Info -->
<table style="background-color: #fefce8; border: 2px solid #eab308; border-radius: 12px; margin-bottom: 20px;" border="0" width="100%" cellspacing="0" cellpadding="0">
<tr>
<td style="padding: 20px;">
<h3 style="font-size: 18px; font-weight: bold; color: #a16207; margin: 0 0 15px 0;">📄 INFORMACIÓN DE FACTURACIÓN</h3>
<p style="margin: 0 0 5px 0; color: #374151;"><strong>Tipo de Comprobante:</strong> {invoice_type}</p>
<p style="margin: 0 0 5px 0; color: #374151;"><strong>Tipo de Documento:</strong> {document_type}</p>
<p style="margin: 0 0 5px 0; color: #374151;"><strong>Número de Documento:</strong> {document}</p>
<p style="margin: 0; color: #374151;"><strong>Razón Social:</strong> {business_name}</p>
</td>
</tr>
</table>

<!-- Payment Info -->
<table style="background-color: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 12px; margin-bottom: 30px;" border="0" width="100%" cellspacing="0" cellpadding="0">
<tr>
<td style="padding: 20px;">
<h3 style="font-size: 18px; font-weight: bold; color: #0369a1; margin: 0 0 15px 0;">💳 INFORMACIÓN DE PAGO</h3>
<p style="margin: 0 0 5px 0; color: #374151;"><strong>Método:</strong> {payment_method}</p>
<p style="margin: 0; color: #374151;"><strong>ID de Transacción:</strong> {payment_id}</p>
</td>
</tr>
</table>

</td>
</tr>

<!-- Admin Actions -->
<tr>
<td style="background-color: #1f2937; padding: 30px; text-align: center; color: white;">
<h3 style="font-size: 20px; font-weight: bold; margin: 0 0 15px 0;">🚀 PRÓXIMOS PASOS</h3>
<p style="font-size: 14px; opacity: 0.9; margin: 0 0 15px 0;">1. Verificar stock de productos<br>2. Preparar pedido para envío<br>3. Generar guía de envío<br>4. Notificar al cliente sobre el despacho</p>
<p style="font-size: 12px; opacity: 0.7; margin: 0;">Sistema de Notificaciones S-tech Perú - {year}</p>
</td>
</tr>

</tbody>
</table>
</td>
</tr>
</tbody>
</table>',
            ],            [
                'correlative' => 'admin_contact_email',
                'name' => 'Plantilla Email Admin - Nuevo Contacto',
                'description' => '<!-- Contenedor principal para admin contact -->
<table border="0" width="100%" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td style="padding: 20px 0;" align="center">
<!-- Email container -->
<table style="background-color: #ffffff; border-radius: 16px; box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 30px; overflow: hidden; width: 600px;" border="0" width="600" cellspacing="0" cellpadding="0">
<!-- Header Admin -->
<tbody>
<tr>
<td style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 40px 30px; text-align: center; color: white;">
<img src="https://s-tech.com.pe/storage/images/image_emails/7c07b846-ab76-4c45-8e60-9a0156564296.png" alt="S-tech Peru" width="120" height="53">
<h1 style="font-size: 28px; font-weight: 800; margin: 20px 0 8px 0; color: white; letter-spacing: -0.5px;">💬 Nuevo Mensaje de Contacto</h1>
<p style="font-size: 16px; color: rgba(255, 255, 255, 0.9); margin: 0;">Un cliente te ha enviado un mensaje</p>
</td>
</tr>

<!-- Alert Section -->
<tr>
<td style="padding: 30px; background-color: #ddd6fe; border-left: 5px solid #7c3aed;">
<h3 style="margin: 0 0 10px 0; color: #5b21b6; font-size: 18px;">📧 RESPUESTA REQUERIDA</h3>
<p style="margin: 0; color: #5b21b6; font-size: 14px;">Un cliente espera tu respuesta. Tiempo recomendado de respuesta: 24 horas.</p>
</td>
</tr>

<!-- Customer Info -->
<tr>
<td style="padding: 30px;">
<table style="background-color: #f8fafc; border-radius: 12px; border: 2px solid #e2e8f0; margin-bottom: 20px;" border="0" width="100%" cellspacing="0" cellpadding="0">
<tr>
<td style="padding: 20px;">
<h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 0 0 15px 0; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">👤 INFORMACIÓN DEL CLIENTE</h3>
<table border="0" width="100%" cellspacing="0" cellpadding="0">
<tr>
<td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
<strong style="color: #374151; font-size: 16px;">Nombre:</strong>
</td>
<td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
<span style="color: #1f2937; font-size: 16px; font-weight: 600;">{customer_name}</span>
</td>
</tr>
<tr>
<td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
<strong style="color: #374151; font-size: 16px;">Email:</strong>
</td>
<td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
<a href="mailto:{customer_email}" style="color: #7c3aed; font-size: 16px; text-decoration: none; font-weight: 600;">{customer_email}</a>
</td>
</tr>
<tr>
<td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
<strong style="color: #374151; font-size: 16px;">Teléfono:</strong>
</td>
<td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
<a href="tel:{customer_phone}" style="color: #059669; font-size: 16px; text-decoration: none; font-weight: 600;">{customer_phone}</a>
</td>
</tr>
<tr>
<td style="padding: 10px 0;">
<strong style="color: #374151; font-size: 16px;">Fecha:</strong>
</td>
<td style="padding: 10px 0; text-align: right;">
<span style="color: #6b7280; font-size: 16px;">{fecha_contacto}</span>
</td>
</tr>
</table>
</td>
</tr>
</table>

<!-- Message Subject -->
<table style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); border-radius: 12px; margin-bottom: 20px;" border="0" width="100%" cellspacing="0" cellpadding="0">
<tr>
<td style="padding: 25px; text-align: center; color: white;">
<h3 style="font-size: 20px; font-weight: bold; margin: 0 0 8px 0;">📝 ASUNTO</h3>
<p style="font-size: 18px; margin: 0; opacity: 0.95; font-weight: 600;">{message_subject}</p>
</td>
</tr>
</table>

<!-- Message Content -->
<table style="background-color: #ffffff; border: 2px solid #e5e7eb; border-radius: 12px; margin-bottom: 20px;" border="0" width="100%" cellspacing="0" cellpadding="0">
<tr>
<td style="padding: 25px;">
<h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 0 0 15px 0; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">💭 MENSAJE DEL CLIENTE</h3>
<div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; font-size: 16px; line-height: 1.6; color: #374151;">
{message_content}
</div>
</td>
</tr>
</table>

<!-- Quick Actions -->
<table style="background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; margin-bottom: 30px;" border="0" width="100%" cellspacing="0" cellpadding="0">
<tr>
<td style="padding: 25px; text-align: center;">
<h3 style="font-size: 18px; font-weight: bold; color: #047857; margin: 0 0 15px 0;">⚡ ACCIONES RÁPIDAS</h3>
<table border="0" width="100%" cellspacing="0" cellpadding="0">
<tr>
<td style="padding: 10px; text-align: center;">
<a href="mailto:{customer_email}?subject=Re: {message_subject}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">📧 Responder por Email</a>
</td>
</tr>
<tr>
<td style="padding: 10px; text-align: center;">
<a href="tel:{customer_phone}" style="display: inline-block; background-color: #059669; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 10px;">📞 Llamar al Cliente</a>
</td>
</tr>
</table>
</td>
</tr>
</table>

</td>
</tr>

<!-- Admin Footer -->
<tr>
<td style="background-color: #7c3aed; padding: 30px; text-align: center; color: white;">
<h3 style="font-size: 20px; font-weight: bold; margin: 0 0 15px 0;">📋 RECORDATORIO</h3>
<p style="font-size: 14px; opacity: 0.9; margin: 0 0 15px 0;">Responde al cliente dentro de las próximas 24 horas para mantener un excelente servicio.</p>
<p style="font-size: 12px; opacity: 0.7; margin: 0;">Sistema de Contacto S-tech Perú - {year}</p>
</td>
</tr>

</tbody>
</table>
</td>
</tr>
</tbody>
</table>',
            ],
            
            // Píxeles de tracking para ecommerce
            [
                'correlative' => 'google_analytics_id',
                'name' => 'Google Analytics ID',
                'description' => '',
            ],
            [
                'correlative' => 'google_tag_manager_id',
                'name' => 'Google Tag Manager ID',
                'description' => '',
            ],
            [
                'correlative' => 'facebook_pixel_id',
                'name' => 'Facebook Pixel ID',
                'description' => '',
            ],
            [
                'correlative' => 'google_ads_conversion_id',
                'name' => 'Google Ads Conversion ID',
                'description' => '',
            ],
            [
                'correlative' => 'google_ads_conversion_label',
                'name' => 'Google Ads Conversion Label',
                'description' => '',
            ],
            [
                'correlative' => 'tiktok_pixel_id',
                'name' => 'TikTok Pixel ID',
                'description' => '',
            ],
            [
                'correlative' => 'hotjar_id',
                'name' => 'Hotjar ID',
                'description' => '',
            ],
            [
                'correlative' => 'clarity_id',
                'name' => 'Microsoft Clarity ID',
                'description' => '',
            ],
            [
                'correlative' => 'linkedin_insight_tag',
                'name' => 'LinkedIn Insight Tag ID',
                'description' => '',
            ],
            [
                'correlative' => 'twitter_pixel_id',
                'name' => 'Twitter Pixel ID',
                'description' => '',
            ],
            [
                'correlative' => 'pinterest_tag_id',
                'name' => 'Pinterest Tag ID',
                'description' => '',
            ],
            [
                'correlative' => 'snapchat_pixel_id',
                'name' => 'Snapchat Pixel ID',
                'description' => '',
            ],
            [
                'correlative' => 'custom_head_scripts',
                'name' => 'Scripts Personalizados (Head)',
                'description' => '',
            ],
            [
                'correlative' => 'custom_body_scripts',
                'name' => 'Scripts Personalizados (Body)',
                'description' => '',
            ],
        ];

        foreach ($generals as $general) {
            General::updateOrCreate(
                ['correlative' => $general['correlative']],
                $general
            );
        }
    }
}
