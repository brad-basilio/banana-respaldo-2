<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== DEBUG SHIPPING_FREE ===\n";

// Consultar el registro
$general = \App\Models\General::where('correlative', 'shipping_free')->first();

if ($general) {
    echo "✅ Registro encontrado:\n";
    echo "- ID: " . $general->id . "\n";
    echo "- Correlative: " . $general->correlative . "\n";
    echo "- Description: " . $general->description . "\n";
    echo "- Valor como float: " . floatval($general->description) . "\n";
} else {
    echo "❌ No se encontró registro con correlative 'shipping_free'\n";
}

// Ver todos los registros de generals
echo "\n=== TODOS LOS REGISTROS DE GENERALS ===\n";
$allGenerals = \App\Models\General::all();
foreach ($allGenerals as $g) {
    echo "- {$g->correlative}: {$g->description}\n";
}

echo "\n=== SIMULAR CÁLCULO ===\n";
$testCartTotal = 189.0;
$minFreeShipping = $general ? floatval($general->description) : 0;

echo "Cart Total: $testCartTotal\n";
echo "Min Free Shipping: $minFreeShipping\n";
echo "Califica? " . ($testCartTotal >= $minFreeShipping ? 'SÍ' : 'NO') . "\n";
