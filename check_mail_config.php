<?php

// Script simple para verificar configuración de correo en el servidor
// Ejecutar con: php check_mail_config.php

echo "🔍 VERIFICACIÓN DE CONFIGURACIÓN DE CORREO\n";
echo "==========================================\n\n";

// Cargar configuración de Laravel
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "📧 Configuración actual:\n";
echo "MAIL_MAILER: " . env('MAIL_MAILER') . "\n";
echo "MAIL_HOST: " . env('MAIL_HOST') . "\n";
echo "MAIL_PORT: " . env('MAIL_PORT') . "\n";
echo "MAIL_USERNAME: " . env('MAIL_USERNAME') . "\n";
echo "MAIL_ENCRYPTION: " . env('MAIL_ENCRYPTION') . "\n";
echo "MAIL_FROM_ADDRESS: " . env('MAIL_FROM_ADDRESS') . "\n";
echo "MAIL_FROM_NAME: " . env('MAIL_FROM_NAME') . "\n\n";

// Verificar si la configuración es óptima para Zoho
$fromAddress = env('MAIL_FROM_ADDRESS');
$host = env('MAIL_HOST');

if ($fromAddress && $host) {
    $fromDomain = substr(strrchr($fromAddress, "@"), 1);
    $hostDomain = str_replace(['mail.', 'smtp.'], '', $host);
    
    echo "🔍 Análisis:\n";
    echo "Dominio FROM: {$fromDomain}\n";
    echo "Dominio HOST: {$hostDomain}\n";
    
    if ($fromDomain === $hostDomain) {
        echo "✅ PERFECTO: Mismo dominio en FROM y HOST\n";
        echo "✅ Configuración ideal para Zoho Mail\n\n";
        
        echo "🎯 PASOS PARA EL CLIENTE (web@s-tech.com.pe):\n";
        echo "1. Revisar carpeta de SPAM en Zoho Mail\n";
        echo "2. Agregar {$fromAddress} a contactos\n";
        echo "3. Verificar filtros automáticos\n";
        echo "4. Si aún no funciona, contactar soporte de Zoho\n\n";
        
    } else {
        echo "⚠️  ADVERTENCIA: Dominios diferentes\n";
        echo "⚠️  Esto puede causar problemas con Zoho Mail\n\n";
    }
    
    // Comando de prueba
    echo "🧪 Para enviar correo de prueba:\n";
    echo "php artisan send:test-zoho web@s-tech.com.pe\n\n";
    
} else {
    echo "❌ Error: No se pudo leer la configuración\n";
}

echo "📝 Este script debe ejecutarse EN EL SERVIDOR, no en local\n";
echo "==========================================\n";
?>
