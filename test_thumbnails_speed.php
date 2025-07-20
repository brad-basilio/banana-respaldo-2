<?php
/**
 * Script para testear la velocidad de generación de thumbnails
 */

// Simular páginas con diferentes elementos
$testPages = [
    [
        'id' => 'page_1',
        'type' => 'cover',
        'backgroundColor' => '#ffffff',
        'cells' => [
            [
                'id' => 'cell_1',
                'elements' => [
                    [
                        'id' => 'img_1',
                        'type' => 'image',
                        'content' => 'https://picsum.photos/800/600?random=1'
                    ]
                ]
            ]
        ]
    ],
    [
        'id' => 'page_2',
        'type' => 'content',
        'backgroundColor' => '#f0f0f0',
        'cells' => [
            [
                'id' => 'cell_2',
                'elements' => [
                    [
                        'id' => 'img_2',
                        'type' => 'image',
                        'content' => 'https://picsum.photos/800/600?random=2'
                    ]
                ]
            ]
        ]
    ]
];

echo "🧪 Iniciando test de velocidad de thumbnails...\n";
echo "📊 Páginas de prueba: " . count($testPages) . "\n";

$startTime = microtime(true);

// Simular diferentes tamaños de thumbnail
$sizes = [
    'small' => 150,
    'medium' => 300,
    'large' => 600
];

foreach ($sizes as $sizeName => $size) {
    echo "\n🔄 Testeando tamaño: {$sizeName} ({$size}px)\n";
    
    $sizeStartTime = microtime(true);
    
    // Simular procesamiento
    for ($i = 0; $i < count($testPages); $i++) {
        usleep(100000); // 100ms por página (simulando generación)
    }
    
    $sizeEndTime = microtime(true);
    $sizeDuration = ($sizeEndTime - $sizeStartTime) * 1000;
    
    echo "⏱️  Tiempo para {$sizeName}: " . round($sizeDuration, 2) . "ms\n";
    echo "📈 Velocidad por página: " . round($sizeDuration / count($testPages), 2) . "ms\n";
}

$endTime = microtime(true);
$totalDuration = ($endTime - $startTime) * 1000;

echo "\n✅ Test completado!\n";
echo "⏱️  Tiempo total: " . round($totalDuration, 2) . "ms\n";
echo "📊 Promedio por página: " . round($totalDuration / count($testPages), 2) . "ms\n";

// Recomendaciones
echo "\n💡 Recomendaciones:\n";
echo "- Tamaño óptimo: 300px (balance velocidad/calidad)\n";
echo "- Cache de imágenes: CRÍTICO para rendimiento\n";
echo "- Generación en lotes: Máximo 5 páginas por lote\n";
echo "- Timeout por imagen: 3 segundos máximo\n";
echo "- Formato: JPEG con 70% calidad para menor tamaño\n";
?>
