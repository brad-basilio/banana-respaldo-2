<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== TIPOS DE DELIVERY DISPONIBLES ===\n";

$types = \App\Models\TypeDelivery::all();

echo "Total tipos encontrados: " . $types->count() . "\n\n";

foreach($types as $type) {
    echo "- ID: {$type->id}\n";
    echo "  Name: {$type->name}\n";
    echo "  Slug: {$type->slug}\n";
    echo "  Description: {$type->description}\n";
    echo "  Characteristics: " . json_encode($type->characteristics) . "\n";
    echo "  Status: {$type->status}\n\n";
}

echo "\n=== BUSCANDO TIPO PARA DELIVERY NORMAL ===\n";

// Buscar un tipo que sea para delivery normal (no gratis)
$normalType = \App\Models\TypeDelivery::where('slug', 'like', '%delivery%')
                                     ->where('slug', 'not like', '%express%')
                                     ->where('slug', 'not like', '%gratis%')
                                     ->first();

if ($normalType) {
    echo "✅ Tipo encontrado para delivery normal:\n";
    echo "- Name: {$normalType->name}\n";
    echo "- Slug: {$normalType->slug}\n";
    echo "- Description: {$normalType->description}\n";
} else {
    echo "❌ No se encontró tipo específico para delivery normal\n";
}
