<?php
/**
 * Verificar y mostrar configuraciones PHP críticas para editores
 */

echo "🔧 CONFIGURACIONES PHP PARA EDITOR PROFESIONAL\n";
echo "==============================================\n\n";

$configs = [
    'memory_limit' => [
        'current' => ini_get('memory_limit'),
        'recommended' => '512M',
        'description' => 'Memoria disponible para PHP'
    ],
    'max_execution_time' => [
        'current' => ini_get('max_execution_time'),
        'recommended' => '300',
        'description' => 'Tiempo máximo de ejecución'
    ],
    'max_input_time' => [
        'current' => ini_get('max_input_time'),
        'recommended' => '300', 
        'description' => 'Tiempo máximo para procesar input'
    ],
    'post_max_size' => [
        'current' => ini_get('post_max_size'),
        'recommended' => '100M',
        'description' => 'Tamaño máximo de POST'
    ],
    'upload_max_filesize' => [
        'current' => ini_get('upload_max_filesize'),
        'recommended' => '50M',
        'description' => 'Tamaño máximo de archivo'
    ],
    'max_file_uploads' => [
        'current' => ini_get('max_file_uploads'),
        'recommended' => '50',
        'description' => 'Máximo archivos simultáneos'
    ]
];

foreach ($configs as $setting => $config) {
    echo "📌 {$setting}:\n";
    echo "   Actual: {$config['current']}\n";
    echo "   Recomendado: {$config['recommended']}\n";
    echo "   Descripción: {$config['description']}\n\n";
}

// Generar configuración para php.ini
$phpConfig = "; Configuración optimizada para BananaLab Editor
; Agrega estas líneas a tu php.ini

memory_limit = 512M
max_execution_time = 300
max_input_time = 300
post_max_size = 100M
upload_max_filesize = 50M
max_file_uploads = 50

; Configuraciones adicionales
max_input_vars = 5000
";

file_put_contents('php_bananalab_config.ini', $phpConfig);

echo "✅ ARCHIVO GENERADO: php_bananalab_config.ini\n\n";

echo "🔧 UBICACIÓN DE php.ini EN XAMPP:\n";
echo "C:\\xampp\\php\\php.ini\n\n";

echo "💡 REINICIA APACHE después de modificar php.ini\n";
