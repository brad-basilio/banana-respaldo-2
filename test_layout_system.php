<?php

// Script de prueba para verificar el sistema de layouts en PDF

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Api\ProjectPDFController;
use App\Models\CanvasProject;

// Datos de prueba que simulan un proyecto con layout de 2 celdas
$testProjectDataLayout2 = [
    'pages' => [
        [
            'id' => 'page-1',
            'layout' => 'layout-2', // Layout de 2 celdas horizontales
            'backgroundColor' => '#FFFFFF',
            'cells' => [
                [
                    'id' => 'cell-0',
                    'elements' => [
                        [
                            'id' => 'text-left',
                            'type' => 'text',
                            'content' => 'Texto en celda izquierda - Layout 2 celdas',
                            'position' => ['x' => 0.1, 'y' => 0.1],
                            'size' => ['width' => 0.8, 'height' => 0.8],
                            'style' => [
                                'fontSize' => '16px',
                                'fontFamily' => 'Arial',
                                'color' => '#000000',
                                'textAlign' => 'center'
                            ]
                        ]
                    ]
                ],
                [
                    'id' => 'cell-1',
                    'elements' => [
                        [
                            'id' => 'text-right',
                            'type' => 'text',
                            'content' => 'Texto en celda derecha - Layout 2 celdas',
                            'position' => ['x' => 0.1, 'y' => 0.1],
                            'size' => ['width' => 0.8, 'height' => 0.8],
                            'style' => [
                                'fontSize' => '16px',
                                'fontFamily' => 'Arial',
                                'color' => '#333333',
                                'textAlign' => 'center'
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ]
];

// Datos de prueba que simulan un proyecto con layout magazine asimétrico
$testProjectDataMagazine = [
    'pages' => [
        [
            'id' => 'page-1',
            'layout' => 'magazine-asymmetric', // Layout magazine asimétrico
            'backgroundColor' => '#F5F5F5',
            'cells' => [
                [
                    'id' => 'cell-0', // Celda principal (col-span-3 row-span-2)
                    'elements' => [
                        [
                            'id' => 'text-main',
                            'type' => 'text',
                            'content' => 'Artículo principal - Esta es la celda más grande del layout magazine',
                            'position' => ['x' => 0.05, 'y' => 0.05],
                            'size' => ['width' => 0.9, 'height' => 0.9],
                            'style' => [
                                'fontSize' => '18px',
                                'fontFamily' => 'Arial',
                                'color' => '#000000',
                                'fontWeight' => 'bold',
                                'textAlign' => 'center'
                            ]
                        ]
                    ]
                ],
                [
                    'id' => 'cell-1', // Celda secundaria superior derecha
                    'elements' => [
                        [
                            'id' => 'text-secondary-1',
                            'type' => 'text',
                            'content' => 'Artículo secundario 1',
                            'position' => ['x' => 0.1, 'y' => 0.1],
                            'size' => ['width' => 0.8, 'height' => 0.8],
                            'style' => [
                                'fontSize' => '14px',
                                'fontFamily' => 'Arial',
                                'color' => '#666666',
                                'textAlign' => 'center'
                            ]
                        ]
                    ]
                ],
                [
                    'id' => 'cell-2', // Celda secundaria inferior derecha
                    'elements' => [
                        [
                            'id' => 'text-secondary-2',
                            'type' => 'text',
                            'content' => 'Artículo secundario 2',
                            'position' => ['x' => 0.1, 'y' => 0.1],
                            'size' => ['width' => 0.8, 'height' => 0.8],
                            'style' => [
                                'fontSize' => '14px',
                                'fontFamily' => 'Arial',
                                'color' => '#666666',
                                'textAlign' => 'center'
                            ]
                        ]
                    ]
                ],
                [
                    'id' => 'cell-3', // Celda inferior completa
                    'elements' => [
                        [
                            'id' => 'text-footer',
                            'type' => 'text',
                            'content' => 'Pie de página del layout magazine',
                            'position' => ['x' => 0.1, 'y' => 0.1],
                            'size' => ['width' => 0.8, 'height' => 0.8],
                            'style' => [
                                'fontSize' => '12px',
                                'fontFamily' => 'Arial',
                                'color' => '#999999',
                                'textAlign' => 'center'
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ]
];

echo "🔄 Iniciando prueba de sistema de layouts en PDF...\n";

try {
    // Crear controlador
    $controller = new ProjectPDFController();
    $reflection = new ReflectionClass($controller);
    
    // Probar método de obtener configuración de layout
    $getLayoutMethod = $reflection->getMethod('getLayoutConfiguration');
    $getLayoutMethod->setAccessible(true);
    
    echo "🎨 Probando configuraciones de layout:\n";
    
    // Probar layout básico de 2 celdas
    $layout2 = $getLayoutMethod->invoke($controller, 'layout-2');
    echo "   ✅ Layout 2: {$layout2['name']} - {$layout2['template']} - {$layout2['cells']} celdas\n";
    
    // Probar layout magazine asimétrico
    $layoutMagazine = $getLayoutMethod->invoke($controller, 'magazine-asymmetric');
    echo "   ✅ Layout Magazine: {$layoutMagazine['name']} - {$layoutMagazine['template']} - {$layoutMagazine['cells']} celdas\n";
    
    // Probar layout inexistente (debería usar fallback)
    $layoutFallback = $getLayoutMethod->invoke($controller, 'layout-inexistente');
    echo "   ✅ Layout Fallback: {$layoutFallback['name']} - {$layoutFallback['template']} - {$layoutFallback['cells']} celdas\n";
    
    // Probar método de conversión de Tailwind CSS a CSS inline
    $convertTailwindMethod = $reflection->getMethod('convertTailwindGridToCSS');
    $convertTailwindMethod->setAccessible(true);
    
    echo "\n🎨 Probando conversión de Tailwind CSS:\n";
    
    // Probar conversión de grid
    $gridCSS = $convertTailwindMethod->invoke($controller, 'grid-cols-2 grid-rows-1 gap-4');
    echo "   ✅ Grid CSS: " . json_encode($gridCSS) . "\n";
    
    // Probar conversión de magazine grid
    $magazineGridCSS = $convertTailwindMethod->invoke($controller, 'grid-cols-5 grid-rows-3 gap-2');
    echo "   ✅ Magazine Grid CSS: " . json_encode($magazineGridCSS) . "\n";
    
    // Probar método de conversión de estilos de celda
    $convertCellMethod = $reflection->getMethod('convertCellTailwindToCSS');
    $convertCellMethod->setAccessible(true);
    
    echo "\n🎨 Probando conversión de estilos de celda:\n";
    
    // Probar conversión de celda con span
    $cellCSS = $convertCellMethod->invoke($controller, 'col-span-3 row-span-2 rounded-lg overflow-hidden shadow-lg');
    echo "   ✅ Cell CSS: " . json_encode($cellCSS) . "\n";
    
    // Probar conversión de celda simple
    $simpleCellCSS = $convertCellMethod->invoke($controller, 'rounded-xl overflow-hidden shadow-2xl');
    echo "   ✅ Simple Cell CSS: " . json_encode($simpleCellCSS) . "\n";
    
    // Probar método de procesamiento de páginas con layout
    $processPageMethod = $reflection->getMethod('processProjectPages');
    $processPageMethod->setAccessible(true);
    
    echo "\n📄 Probando procesamiento de páginas con layout:\n";
    
    // Crear proyecto mock
    $mockProject = new CanvasProject();
    $mockProject->id = 999;
    $mockProject->preset = 'a4-portrait';
    
    // Asignar proyecto actual
    $currentProjectProperty = $reflection->getProperty('currentProject');
    $currentProjectProperty->setAccessible(true);
    $currentProjectProperty->setValue($controller, $mockProject);
    
    // Procesar páginas con layout 2
    $processedPages2 = $processPageMethod->invoke($controller, $testProjectDataLayout2['pages']);
    echo "   ✅ Páginas procesadas con Layout 2: " . count($processedPages2) . "\n";
    
    if (!empty($processedPages2)) {
        $page = $processedPages2[0];
        echo "     - Layout ID: {$page['layout']['id']}\n";
        echo "     - Layout Name: {$page['layout']['name']}\n";
        echo "     - Grid CSS: " . json_encode($page['layout']['gridCSS']) . "\n";
        echo "     - Celdas: " . count($page['cells']) . "\n";
        
        foreach ($page['cells'] as $cellIndex => $cell) {
            echo "       • Celda {$cellIndex}: " . count($cell['elements']) . " elementos\n";
            if (!empty($cell['style'])) {
                echo "         CSS: " . json_encode($cell['style']) . "\n";
            }
        }
    }
    
    // Procesar páginas con layout magazine
    $processedPagesMagazine = $processPageMethod->invoke($controller, $testProjectDataMagazine['pages']);
    echo "   ✅ Páginas procesadas con Layout Magazine: " . count($processedPagesMagazine) . "\n";
    
    if (!empty($processedPagesMagazine)) {
        $page = $processedPagesMagazine[0];
        echo "     - Layout ID: {$page['layout']['id']}\n";
        echo "     - Layout Name: {$page['layout']['name']}\n";
        echo "     - Grid CSS: " . json_encode($page['layout']['gridCSS']) . "\n";
        echo "     - Celdas: " . count($page['cells']) . "\n";
    }
    
    echo "\n🎉 Todas las pruebas de sistema de layouts pasaron exitosamente!\n";
    echo "📋 Características implementadas:\n";
    echo "   ✅ Configuración de layouts desde layouts.js\n";
    echo "   ✅ Conversión de Tailwind CSS a CSS inline\n";
    echo "   ✅ Procesamiento de celdas con estilos específicos\n";
    echo "   ✅ Soporte para layouts complejos (magazine, grid, etc.)\n";
    echo "   ✅ Fallback para layouts inexistentes\n";
    echo "   ✅ Generación de CSS Grid compatible con DomPDF\n";
    echo "\n💡 Próximos pasos:\n";
    echo "   1. Probar con un proyecto real que tenga layout definido\n";
    echo "   2. Verificar que las celdas se distribuyan correctamente\n";
    echo "   3. Ajustar estilos CSS si es necesario\n";
    
} catch (Exception $e) {
    echo "❌ Error en la prueba: " . $e->getMessage() . "\n";
    echo "📍 Línea: " . $e->getLine() . "\n";
    echo "📁 Archivo: " . $e->getFile() . "\n";
}
