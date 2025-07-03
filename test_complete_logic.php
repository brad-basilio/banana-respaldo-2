<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== SIMULACIÓN COMPLETA CON CONFIGURACIÓN CORRECTA ===\n";

// Parámetros de entrada
$ubigeo = '150108'; // Breña
$cart_total = 189;
$typeDelivery = 1; // Delivery normal

echo "Parámetros de entrada:\n";
echo "- Ubigeo: $ubigeo\n";
echo "- Cart Total: $cart_total\n";
echo "- Type Delivery: $typeDelivery\n\n";

// Obtener configuración correcta (como en el controlador)
$freeShippingThreshold = \App\Models\General::where('correlative', 'shipping_free')->first();
$minFreeShipping = $freeShippingThreshold ? floatval($freeShippingThreshold->description) : 0;

echo "Configuración General (correcta):\n";
echo "- Shipping Free Threshold: $minFreeShipping\n\n";

// Obtener precio de delivery
$deliveryPrice = \App\Models\DeliveryPrice::where('ubigeo', $ubigeo)->first();

if (!$deliveryPrice) {
    echo "❌ No delivery price found\n";
    exit;
}

echo "Delivery Price encontrado:\n";
echo "- Price: " . $deliveryPrice->price . "\n";
echo "- Is Free: " . ($deliveryPrice->is_free ? 'true' : 'false') . "\n\n";

// Aplicar lógica exacta del controlador
echo "=== APLICANDO LÓGICA EXACTA DEL CONTROLADOR ===\n";

// Paso 1: Validación de envío gratis
$qualifiesForFreeShipping = $minFreeShipping > 0 && $cart_total >= $minFreeShipping;

echo "1. Validación de envío gratis:\n";
echo "   - minFreeShipping > 0: " . ($minFreeShipping > 0 ? 'true' : 'false') . " ($minFreeShipping > 0)\n";
echo "   - cart_total >= minFreeShipping: " . ($cart_total >= $minFreeShipping ? 'true' : 'false') . " ($cart_total >= $minFreeShipping)\n";
echo "   - qualifiesForFreeShipping: " . ($qualifiesForFreeShipping ? 'true' : 'false') . "\n\n";

// Paso 2: Lógica para ubicaciones is_free
if ($deliveryPrice->is_free) {
    echo "2. ✅ Ubicación con is_free = true\n";
    
    if ($qualifiesForFreeShipping) {
        $final_price = 0;
        echo "   - ✅ CALIFICA PARA ENVÍO GRATIS - Precio final: $final_price\n";
        $description = 'Envío gratuito por compra mayor a S/ ' . $minFreeShipping;
    } else {
        $final_price = $deliveryPrice->price;
        echo "   - 💰 NO CALIFICA - COBRAR DELIVERY - Precio final: $final_price\n";
        $description = 'Delivery estándar';
    }
} else {
    echo "2. ❌ Ubicación con is_free = false\n";
    $final_price = $deliveryPrice->price;
    echo "   - 💰 SIEMPRE COBRAR - Precio final: $final_price\n";
    $description = 'Delivery estándar';
}

echo "\n=== RESULTADO FINAL ===\n";
echo "Precio que debe retornar la API: $final_price\n";
echo "Descripción: $description\n";
