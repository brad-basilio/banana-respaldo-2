<?php

require_once 'vendor/autoload.php';

// Configurar Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔧 [MANUAL-SAVE] Verificando implementación del sistema de guardado manual...\n\n";

try {
    // Verificar que los archivos fueron modificados correctamente
    $editorPath = 'resources/js/Components/Tailwind/BananaLab/Editor.jsx';
    
    if (!file_exists($editorPath)) {
        echo "❌ Error: No se encontró el archivo Editor.jsx\n";
        exit(1);
    }
    
    $editorContent = file_get_contents($editorPath);
    
    // Verificaciones de implementación
    $checks = [
        'Auto-save de respaldo (5 min)' => [
            'pattern' => '5 \* 60 \* 1000',
            'description' => 'Intervalo de 5 minutos para auto-save de respaldo'
        ],
        'Función de guardado manual' => [
            'pattern' => 'saveProgressManually',
            'description' => 'Función de guardado manual implementada'
        ],
        'Botón Guardar en UI' => [
            'pattern' => 'Guardar.*Save.*h-4.*w-4',
            'description' => 'Botón de guardado manual en la interfaz'
        ],
        'Import del icono Save' => [
            'pattern' => 'Save.*\} from "lucide-react"',
            'description' => 'Icono Save importado desde lucide-react'
        ],
        'Auto-save deshabilitado' => [
            'pattern' => '\/\*.*debouncedAutoSave.*\*\/',
            'description' => 'Auto-save automático por cambios deshabilitado'
        ],
        'Toast de confirmación' => [
            'pattern' => 'toast\.success.*Progreso guardado',
            'description' => 'Mensaje de confirmación al guardar'
        ]
    ];
    
    echo "📋 [CHECKS] Verificando implementación:\n\n";
    
    $allPassed = true;
    
    foreach ($checks as $name => $check) {
        $pattern = '/' . $check['pattern'] . '/s';
        $found = preg_match($pattern, $editorContent);
        
        if ($found) {
            echo "✅ {$name}: OK\n";
            echo "   └─ {$check['description']}\n\n";
        } else {
            echo "❌ {$name}: NO ENCONTRADO\n";
            echo "   └─ {$check['description']}\n\n";
            $allPassed = false;
        }
    }
    
    if ($allPassed) {
        echo "🎉 [SUCCESS] Todas las verificaciones pasaron exitosamente!\n\n";
        
        echo "📊 [SUMMARY] Cambios implementados:\n";
        echo "  • Auto-save: 30 segundos → 5 minutos (reducción del 90%)\n";
        echo "  • Guardado: Automático → Manual + respaldo\n";
        echo "  • Carga del servidor: Significativamente reducida\n";
        echo "  • Control del usuario: Completo sobre cuándo guardar\n";
        echo "  • Seguridad: Respaldo automático cada 5 minutos\n\n";
        
        echo "🚀 [NEXT STEPS] Para probar:\n";
        echo "  1. Abre el editor en: http://localhost:8000/editor?project=PROJECT_ID\n";
        echo "  2. Busca el botón 'Guardar' en la barra superior\n";
        echo "  3. Haz cambios y prueba el guardado manual\n";
        echo "  4. Verifica los mensajes de confirmación\n";
        echo "  5. Observa los logs de auto-save de respaldo (cada 5 min)\n\n";
        
        echo "📄 [DOCUMENTATION] Ver detalles en:\n";
        echo "  http://localhost:8000/manual-save-system.html\n\n";
        
    } else {
        echo "❌ [ERROR] Algunas verificaciones fallaron. Revisa la implementación.\n";
        exit(1);
    }

} catch (Exception $e) {
    echo "❌ [ERROR] Error durante la verificación: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}

echo "✅ [MANUAL-SAVE] Verificación completada exitosamente\n";
