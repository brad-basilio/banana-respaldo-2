<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TypeDelivery;

class TypeDeliveryStorePickupSeeder extends Seeder
{
    public function run()
    {
        TypeDelivery::firstOrCreate([
            'slug' => 'retiro-en-tienda'
        ], [
            'name' => 'Retiro en Tienda',
            'description' => 'Retira tu pedido en cualquiera de nuestras tiendas físicas sin costo adicional. Horarios flexibles y atención personalizada.',
            'characteristics' => [
                'Sin costo de envío',
                'Horarios flexibles de atención',
                'Atención personalizada',
                'Disponible en todas nuestras tiendas',
                'Producto listo para recoger en 24-48 horas'
            ]
        ]);
    }
}
