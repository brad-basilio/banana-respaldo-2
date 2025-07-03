<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== SIMULACIÓN DE LLAMADA AL CONTROLADOR ===\n";

// Simular los parámetros de la llamada real
$ubigeo = '140104'; // Ubigeo del usuario
$cart_total = 250; // Monto que SÍ califica (mayor a 200)
$typeDelivery = 1;

echo "Parámetros:\n";
echo "- ubigeo: $ubigeo\n";
echo "- cart_total: $cart_total\n";
echo "- typeDelivery: $typeDelivery\n\n";

// Instanciar el controlador
$controller = new \App\Http\Controllers\DeliveryPriceController();

// Crear la request simulada
$request = new \Illuminate\Http\Request();
$request->merge([
    'ubigeo' => $ubigeo,
    'cart_total' => $cart_total,
    'typeDelivery' => $typeDelivery
]);

try {
    // Llamar al método
    $response = $controller->getDeliveryPrice($request);
    
    echo "=== RESPUESTA DEL CONTROLADOR ===\n";
    echo "Status: " . $response->getStatusCode() . "\n";
    
    // Obtener el contenido como string y convertir a array
    $responseContent = $response->getContent();
    echo "Content: " . $responseContent . "\n";
    
    $responseData = json_decode($responseContent, true);
    
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "\n=== DATOS PARSEADOS ===\n";
        echo json_encode($responseData, JSON_PRETTY_PRINT) . "\n";
        
        // Análisis específico
        if (isset($responseData['data']['standard']['price'])) {
            $price = $responseData['data']['standard']['price'];
            echo "\n=== ANÁLISIS ===\n";
            echo "Precio retornado: $price\n";
            
            if ($price == 0) {
                echo "❌ PROBLEMA: Precio es 0 cuando debería ser 35\n";
            } else if ($price == 35) {
                echo "✅ CORRECTO: Precio es 35 como esperado\n";
            } else {
                echo "⚠️  INESPERADO: Precio es $price\n";
            }
        } else {
            echo "⚠️  No se encontró el campo 'data.standard.price' en la respuesta\n";
        }
    } else {
        echo "❌ Error al parsear JSON: " . json_last_error_msg() . "\n";
    }
    
} catch (\Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
