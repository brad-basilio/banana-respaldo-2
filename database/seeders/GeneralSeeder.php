<?php

namespace Database\Seeders;

use App\Models\General;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GeneralSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Helper para limpiar llaves y caracteres invisibles
        $clean_blade_vars = function($html) {
            // Reemplaza comillas y caracteres raros por los normales
            $html = str_replace([
                '“', '”', '‘', '’', '′', '‵', '‹', '›', '«', '»',
                '‐', '–', '—', '−',
                ' ', // espacio no-break
            ], [
                '"', '"', "'", "'", "'", "'", "'", "'", '"', '"',
                '-', '-', '-', '-',
                ' ',
            ], $html);
            // Elimina espacios invisibles
            $html = preg_replace('/[\x{00A0}\x{200B}\x{200C}\x{200D}\x{FEFF}]/u', '', $html);
            // Normaliza las llaves: {{   variable   }} => {{variable}}
            $html = preg_replace('/\{\s*\{\s*/', '{{', $html);
            $html = preg_replace('/\s*}\s*}/', '}}', $html);
            // Elimina $ en variables tipo {{ $variable }} => {{variable}}
            $html = preg_replace('/{{\s*\$([a-zA-Z0-9_]+)\s*}}/', '{{$1}}', $html);
            // Elimina cualquier instrucción Blade o PHP
            $html = preg_replace('/@\w+\s*\(.*?\)/', '', $html); // directivas @if, @foreach, etc
            $html = preg_replace('/{{\s*[^\s}]+\(.*?\)\s*}}/', '', $html); // funciones dentro de {{ }}
            return $html;
        };
        $generalData = [
            [
                'correlative' => 'order_status_changed_email',
                'name' => 'Diseño de email de cambio de estado de pedido',
                'description' => $clean_blade_vars(<<<'HTML'

<h1>¡Hola!</h1>
<p>El estado de tu pedido #{{ orderId }} ha cambiado a: <strong>{{ status }}</strong></p>
<p>Gracias por tu compra.</p>
<p>{{ config('app.name') }}<br>&copy; {{ date('Y') }}</p>
HTML
                ),
            ],
            [
                'correlative' => 'claim_email',
                'name' => 'Diseño de email de reclamo',
                'description' => $clean_blade_vars(<<<'HTML'

<h1>¡Hola {{ nombre }}!</h1>
<p>Hemos recibido tu reclamo/queja y te enviamos un respaldo de lo que registraste:</p>
<ul>
    <li><strong>Tipo:</strong> {{ tipo_reclamo }}</li>
    <li><strong>Detalle:</strong> {{ detalle_reclamo }}</li>
    <li><strong>Fecha:</strong> {{ fecha_ocurrencia }}</li>
    <li><strong>Monto reclamado:</strong> S/ {{ monto_reclamado }}</li>
    <li><strong>Producto/Servicio:</strong> {{ descripcion_producto }}</li>
    <li><strong>Número de pedido:</strong> {{ numero_pedido }}</li>
</ul>
<p>Gracias por confiar en nosotros. Nos pondremos en contacto contigo pronto.</p>
<p>{{ config('app.name') }}<br>&copy; {{ date('Y') }}</p>
HTML
                ),
            ],
            [
                'correlative' => 'password_changed_email',
                'name' => 'Diseño de email de contraseña cambiada',
                'description' => <<<HTML

<h1>¡Hola!</h1>
<p>Te informamos que tu contraseña ha sido cambiada exitosamente.</p>
<p>Si no realizaste este cambio, por favor contacta con soporte de inmediato.</p>
<p>{{ config('app.name') }}<br>&copy; {{ date('Y') }}</p>
HTML
            ],
            [
                'correlative' => 'reset_password_email',
                'name' => 'Diseño de email de restablecer contraseña',
                'description' => <<<HTML
<h1>Restablecer contraseña</h1>
<p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
<p>Haz clic en el siguiente enlace para continuar:</p>
<a href="{{ resetUrl }}">Restablecer contraseña</a>
<p>Si no has solicitado esto, ignora este correo.</p>
HTML
            ],
            [
                'correlative' => 'subscription_email',
                'name' => 'Diseño de email de suscripción',
                'description' => <<<HTML

<h1>¡Hola!</h1>
<p>Te has suscrito exitosamente. Pronto recibirás novedades y actualizaciones.</p>
<p>{{ config('app.name') }}<br>&copy; {{ date('Y') }}</p>
HTML
            ],
            [
                'correlative' => 'verify_account_email',
                'name' => 'Diseño de email de verificación de cuenta',
                'description' => <<<HTML

<h1>¡Hola!</h1>
<p>Gracias por registrarte. Por favor, haz clic en el botón para verificar tu cuenta:</p>
<p>
    <a href="{{ verificationUrl }}">Verificar cuenta</a>
</p>
<p>Si no creaste una cuenta, ignora este correo.</p>
<p>{{ config('app.name') }}<br>&copy; {{ date('Y') }}</p>
HTML
            ],
            [
                'correlative' => 'blog_published_email',
                'name' => 'Diseño de email de blog publicado',
                'description' => <<<HTML

<h1>¡Hola!</h1>
<p>Se ha publicado un nuevo blog: <strong>{{ title }}</strong></p>
<p>
    <a href="{{ url }}">Leer blog</a>
</p>
<p>{{ config('app.name') }}<br>&copy; {{ date('Y') }}</p>
HTML
            ],
            [
                'correlative' => 'purchase_summary_email',
                'name' => 'Diseño de email de resumen de compra',
                'description' => <<<HTML

<h1>¡Gracias por tu compra!</h1>
<p>Hola {{ nombre }},</p>
<p><strong>Código de pedido:</strong> {{ codigo }}<br><strong>Total:</strong> S/ {{ total }}</p>
<table width="100%">
    <thead>
        <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
        </tr>
    </thead>
    <tbody>
        {{ productos }}
    </tbody>
</table>
<p>¡Gracias por confiar en nosotros!</p>
<p>{{ config('app.name') }}<br>&copy; {{ date('Y') }}</p>
HTML
            ],
            // [
            //     'correlative' => 'phone_contact',
            //     'name' => 'Teléfono de contacto',
            //     'description' => '+51 945 622 983'
            // ],
            // [
            //     'correlative' => 'email_contact',
            //     'name' => 'Correo de contacto',
            //     'description' => 'soporte@trasciende.com'
            // ],
            // [
            //     'correlative' => 'address',
            //     'name' => 'Dirección',
            //     'description' => 'Calle Nicanor Rocca de Vergallo 493, Magdalena del Mar Lima -Perú'
            // ],
            // [
            //     'correlative' => 'opening_hours',
            //     'name' => 'Horarios de atención',
            //     'description' => 'De lunes a viernes - 10 am a 7pm'
            // ],
            // [
            //     'correlative' => 'support_phone',
            //     'name' => 'Número de soporte',
            //     'description' => '+51 945 622 983'
            // ],
            // [
            //     'correlative' => 'support_email',
            //     'name' => 'Correo de soporte',
            //     'description' => 'soporte@trasciende.com'
            // ],
            // [
            //     'correlative' => 'privacy_policy',
            //     'name' => 'Política de privacidad',
            //     'description' => 'Nuestra política de privacidad protege la información personal de nuestros usuarios...'
            // ],
            // [
            //     'correlative' => 'terms_conditions',
            //     'name' => 'Términos y condiciones',
            //     'description' => 'Al usar nuestros servicios, usted acepta los siguientes términos y condiciones...'
            // ],
            // [
            //     'correlative' => 'location',
            //     'name' => 'Ubicación',
            //     'description' => '-12.097029,-77.037251'
            // ]
        ];

        foreach ($generalData as $data) {
            $data['description'] = $clean_blade_vars($data['description']);
            General::updateOrCreate(
                ['correlative' => $data['correlative']],
                [
                    'name' => $data['name'],
                    'description' => $data['description']
                ]
            );
        }
    }
}
