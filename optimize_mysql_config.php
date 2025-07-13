<?php
/**
 * Script para optimizar configuración MySQL para editores profesionales
 * Configuraciones para soportar proyectos grandes (hasta 100MB)
 */

echo "🚀 OPTIMIZACIÓN MYSQL PARA EDITOR PROFESIONAL\n";
echo "==============================================\n\n";

// Configuraciones recomendadas para editores de diseño
$recommendations = [
    'max_allowed_packet' => [
        'current' => '16M',
        'recommended' => '100M',
        'description' => 'Tamaño máximo de paquete (para proyectos grandes)'
    ],
    'innodb_buffer_pool_size' => [
        'current' => '128M',
        'recommended' => '512M', 
        'description' => 'Buffer para mejorar rendimiento con datos grandes'
    ],
    'max_connections' => [
        'current' => '151',
        'recommended' => '500',
        'description' => 'Conexiones simultáneas (para múltiples usuarios)'
    ],
    'wait_timeout' => [
        'current' => '28800',
        'recommended' => '3600',
        'description' => 'Timeout para sesiones largas de edición'
    ],
    'interactive_timeout' => [
        'current' => '28800', 
        'recommended' => '3600',
        'description' => 'Timeout para sesiones interactivas'
    ]
];

echo "📋 CONFIGURACIONES RECOMENDADAS:\n";
echo "─────────────────────────────────\n";

foreach ($recommendations as $setting => $config) {
    echo "• {$setting}:\n";
    echo "  Actual: {$config['current']}\n";
    echo "  Recomendado: {$config['recommended']}\n";
    echo "  Descripción: {$config['description']}\n\n";
}

// Generar archivo de configuración
$configContent = "; Configuración optimizada para BananaLab Editor
; Coloca esto en tu archivo my.ini (XAMPP) o my.cnf (Linux/Mac)

[mysqld]
# Configuraciones para editores profesionales
max_allowed_packet = 100M
innodb_buffer_pool_size = 512M
max_connections = 500
wait_timeout = 3600
interactive_timeout = 3600

# Configuraciones adicionales de rendimiento
innodb_log_file_size = 256M
innodb_log_buffer_size = 64M
query_cache_size = 64M
query_cache_type = 1

# Configuraciones de seguridad
max_execution_time = 300
memory_limit = 512M
";

file_put_contents('mysql_bananalab_config.ini', $configContent);

echo "✅ ARCHIVO DE CONFIGURACIÓN GENERADO:\n";
echo "─────────────────────────────────────\n";
echo "📁 Archivo: mysql_bananalab_config.ini\n\n";

echo "🔧 INSTRUCCIONES DE INSTALACIÓN:\n";
echo "─────────────────────────────────────\n";
echo "1. Cierra XAMPP completamente\n";
echo "2. Ve a: C:\\xampp\\mysql\\bin\\my.ini\n";
echo "3. Abre my.ini con un editor de texto\n";
echo "4. Busca la sección [mysqld]\n";
echo "5. Agrega las líneas del archivo generado\n";
echo "6. Reinicia XAMPP\n\n";

echo "⚡ CONFIGURACIÓN ALTERNATIVA RÁPIDA:\n";
echo "──────────────────────────────────────\n";
echo "Si quieres una solución inmediata, ejecuta estos comandos SQL:\n\n";

$sqlCommands = [
    "SET GLOBAL max_allowed_packet = 104857600;", // 100MB
    "SET GLOBAL wait_timeout = 3600;",
    "SET GLOBAL interactive_timeout = 3600;"
];

foreach ($sqlCommands as $command) {
    echo "  {$command}\n";
}

echo "\n💡 NOTA: Los comandos SQL son temporales. Para hacerlos permanentes,\n";
echo "    debes modificar el archivo my.ini como se indica arriba.\n\n";

// Probar configuración actual
try {
    $pdo = new PDO('mysql:host=localhost;dbname=bananalab_app', 'root', '');
    
    echo "🔍 VERIFICACIÓN DE CONFIGURACIÓN ACTUAL:\n";
    echo "─────────────────────────────────────────\n";
    
    $stmt = $pdo->query("SHOW VARIABLES LIKE 'max_allowed_packet'");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $currentSize = intval($result['Value']);
    $currentMB = round($currentSize / 1024 / 1024, 2);
    
    echo "📦 max_allowed_packet actual: {$currentMB} MB\n";
    
    if ($currentSize >= 100 * 1024 * 1024) {
        echo "✅ ¡Configuración óptima! Puede manejar proyectos grandes.\n";
    } elseif ($currentSize >= 50 * 1024 * 1024) {
        echo "⚠️  Configuración aceptable, pero podría mejorar.\n";
    } else {
        echo "❌ Configuración insuficiente para proyectos grandes.\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error conectando a la base de datos: " . $e->getMessage() . "\n";
}

echo "\n🎨 CAPACIDADES ESPERADAS DESPUÉS DE LA OPTIMIZACIÓN:\n";
echo "───────────────────────────────────────────────────\n";
echo "• Proyectos con 50+ páginas\n";
echo "• Cientos de elementos por página\n";
echo "• Imágenes de alta resolución\n";
echo "• Efectos y filtros complejos\n";
echo "• Historial de cambios extenso\n";
echo "• Múltiples usuarios editando simultaneamente\n\n";

echo "🚀 ¡BananaLab estará listo para proyectos profesionales!\n";
