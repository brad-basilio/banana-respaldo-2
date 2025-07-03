<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== DEBUG BREÑA DELIVERY PRICE ===\n";

// Consultar el precio para Breña (ubigeo 150108)
$deliveryPrice = \App\Models\DeliveryPrice::where('ubigeo', '150108')->first();

if ($deliveryPrice) {
    echo "✅ Precio encontrado para Breña:\n";
    echo "- Ubigeo: " . $deliveryPrice->ubigeo . "\n";
    echo "- Price: " . $deliveryPrice->price . "\n";
    echo "- Express Price: " . $deliveryPrice->express_price . "\n";
    echo "- Is Free: " . ($deliveryPrice->is_free ? 'true' : 'false') . "\n";
    echo "- Is Agency: " . ($deliveryPrice->is_agency ? 'true' : 'false') . "\n";
    echo "- Type: " . ($deliveryPrice->type ? $deliveryPrice->type->name : 'No type') . "\n";
} else {
    echo "❌ No se encontró precio para Breña (150108)\n";
    
    // Buscar todos los ubigeos que empiecen con 1501 (Breña)
    echo "\n=== BUSCANDO UBIGEOS SIMILARES ===\n";
    $similar = \App\Models\DeliveryPrice::where('ubigeo', 'like', '1501%')->get();
    foreach($similar as $dp) {
        echo "- Ubigeo: {$dp->ubigeo}, Price: {$dp->price}, Free: " . ($dp->is_free ? 'true' : 'false') . "\n";
    }
}
