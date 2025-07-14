<?php
/**
 * Test para generar PDF real y verificar si las imágenes aparecen
 */

// URL del endpoint de PDF
$projectId = '9f424fe8-dc75-499c-992c-20ba49fdd6ce';
$url = "http://127.0.0.1:8000/api/test/projects/{$projectId}/export/pdf";

// Configurar contexto HTTP
$options = [
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n" .
                   "Accept: application/pdf\r\n",
        'content' => json_encode([
            'pages' => null // Usar páginas del proyecto guardado
        ])
    ]
];

$context = stream_context_create($options);

echo "🔍 Probando generación de PDF...\n";
echo "URL: {$url}\n\n";

// Ejecutar request
$result = file_get_contents($url, false, $context);

if ($result === false) {
    echo "❌ Error ejecutando request\n";
    echo "HTTP headers: " . print_r($http_response_header, true) . "\n";
    exit(1);
}

// Verificar si es un PDF
if (strpos($result, '%PDF') === 0) {
    // Guardar PDF
    $pdfFile = __DIR__ . "/test_output_fixed.pdf";
    file_put_contents($pdfFile, $result);
    
    $fileSize = strlen($result);
    echo "✅ PDF generado exitosamente!\n";
    echo "💾 Archivo guardado: {$pdfFile}\n";
    echo "📏 Tamaño: " . number_format($fileSize / 1024, 2) . " KB\n";
    echo "\n";
    echo "🔍 Por favor, abre el archivo PDF y verifica si:\n";
    echo "   1. Las imágenes de fondo aparecen\n";
    echo "   2. Los textos están visibles\n";
    echo "   3. Los elementos de imagen aparecen (si los hay)\n";
    
} else {
    echo "❌ La respuesta no es un PDF válido\n";
    echo "Primeros 500 caracteres de la respuesta:\n";
    echo substr($result, 0, 500) . "\n";
}
