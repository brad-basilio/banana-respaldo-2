<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== SIMULACIÓN DE SOLICITUD ACTUAL ===\n";

// Simular los parámetros que llegan al controlador
$ubigeo = '150108'; // Breña
$cart_total = 189;
$typeDelivery = 1; // Delivery normal

echo "Parámetros de entrada:\n";
echo "- Ubigeo: $ubigeo\n";
echo "- Cart Total: $cart_total\n";
echo "- Type Delivery: $typeDelivery\n\n";

// Obtener configuración general
$general = \App\Models\General::first();
$shipping_free = $general ? $general->shipping_free : 0;
echo "Configuración General:\n";
echo "- Shipping Free Threshold: $shipping_free\n\n";

// Obtener precio de delivery
$deliveryPrice = \App\Models\DeliveryPrice::where('ubigeo', $ubigeo)->first();

if (!$deliveryPrice) {
    echo "❌ No delivery price found\n";
    exit;
}

echo "Delivery Price encontrado:\n";
echo "- Price: " . $deliveryPrice->price . "\n";
echo "- Is Free: " . ($deliveryPrice->is_free ? 'true' : 'false') . "\n\n";

// Aplicar lógica corregida
echo "=== APLICANDO LÓGICA CORREGIDA ===\n";

$initial_price = $deliveryPrice->price; // PRECIO BASE SIEMPRE
echo "1. Precio inicial: $initial_price\n";

$qualifies_for_free = $deliveryPrice->is_free && ($cart_total >= $shipping_free);
echo "2. Califica para envío gratis: " . ($qualifies_for_free ? 'SI' : 'NO') . "\n";
echo "   - is_free: " . ($deliveryPrice->is_free ? 'true' : 'false') . "\n";
echo "   - cart_total >= shipping_free: " . ($cart_total >= $shipping_free ? 'true' : 'false') . " ($cart_total >= $shipping_free)\n";

if ($qualifies_for_free) {
    $final_price = 0;
    echo "3. ✅ ENVÍO GRATIS - Precio final: $final_price\n";
} else {
    $final_price = $initial_price;
    echo "3. 💰 COBRAR DELIVERY - Precio final: $final_price\n";
}

echo "\n=== RESULTADO FINAL ===\n";
echo "Precio que debe retornar la API: $final_price\n";
