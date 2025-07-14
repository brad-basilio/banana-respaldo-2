<?php
/**
 * Test client para probar el endpoint debug del PDF
 */

// URL del endpoint debug
$projectId = '9f424fe8-dc75-499c-992c-20ba49fdd6ce';
$url = "http://127.0.0.1:8000/api/test/projects/{$projectId}/debug/html";

// Configurar contexto HTTP
$options = [
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n" .
                   "Accept: application/json\r\n",
        'content' => json_encode([
            'pages' => null // Usar páginas del proyecto guardado
        ])
    ]
];

$context = stream_context_create($options);

echo "🔍 Probando endpoint debug del PDF...\n";
echo "URL: {$url}\n\n";

// Ejecutar request
$result = file_get_contents($url, false, $context);

if ($result === false) {
    echo "❌ Error ejecutando request\n";
    echo "HTTP headers: " . print_r($http_response_header, true) . "\n";
    exit(1);
}

// Decodificar respuesta
$response = json_decode($result, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo "❌ Error decodificando JSON response\n";
    echo "Raw response: " . substr($result, 0, 1000) . "\n";
    exit(1);
}

// Mostrar resultados
echo "✅ Response recibido:\n\n";

if (isset($response['success']) && $response['success']) {
    echo "📊 INFORMACIÓN DEL PROYECTO:\n";
    echo "   ID: {$response['project_id']}\n";
    echo "   Nombre: {$response['project_name']}\n";
    echo "   Páginas originales: {$response['original_pages_count']}\n";
    echo "   Páginas procesadas: {$response['processed_pages_count']}\n";
    echo "\n";
    
    echo "⚙️ CONFIGURACIÓN DEL PRESET:\n";
    if (isset($response['preset_config'])) {
        foreach ($response['preset_config'] as $key => $value) {
            echo "   {$key}: {$value}\n";
        }
    }
    echo "\n";
    
    echo "📄 DEBUG DE PÁGINAS ORIGINALES:\n";
    if (isset($response['pages_debug'])) {
        foreach ($response['pages_debug'] as $pageDebug) {
            echo "   Página {$pageDebug['page_number']}:\n";
            echo "      ID: {$pageDebug['id']}\n";
            echo "      Color fondo: {$pageDebug['background_color']}\n";
            echo "      Imagen fondo: " . ($pageDebug['background_image'] ? 'SÍ' : 'NO') . "\n";
            echo "      Celdas: {$pageDebug['cells_count']}\n";
            echo "      Elementos totales: {$pageDebug['total_elements']}\n";
            echo "      Imágenes: {$pageDebug['image_elements']}\n";
            echo "      Textos: {$pageDebug['text_elements']}\n";
            echo "\n";
        }
    }
    
    echo "📄 DEBUG DE PÁGINAS PROCESADAS:\n";
    if (isset($response['processed_pages_debug'])) {
        foreach ($response['processed_pages_debug'] as $pageDebug) {
            echo "   Página {$pageDebug['page_number']}:\n";
            echo "      ID: {$pageDebug['id']}\n";
            echo "      Color fondo: {$pageDebug['background_color']}\n";
            echo "      Imagen fondo: " . ($pageDebug['background_image'] ? 'SÍ' : 'NO') . "\n";
            echo "      Celdas: {$pageDebug['cells_count']}\n";
            echo "      Elementos totales: {$pageDebug['total_elements']}\n";
            echo "      Imágenes: {$pageDebug['image_elements']}\n";
            echo "      Textos: {$pageDebug['text_elements']}\n";
            echo "\n";
        }
    }
    
    echo "🖼️ PREVIEW DEL HTML:\n";
    echo $response['html_preview'] . "\n\n";
    
    // Guardar HTML completo para inspección
    if (isset($response['html_full'])) {
        $htmlFile = __DIR__ . "/debug_pdf_output.html";
        file_put_contents($htmlFile, $response['html_full']);
        echo "💾 HTML completo guardado en: {$htmlFile}\n";
    }
    
} else {
    echo "❌ Error en la respuesta:\n";
    print_r($response);
}
