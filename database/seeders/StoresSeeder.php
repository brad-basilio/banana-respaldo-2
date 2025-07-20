<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Store;
use SoDe\Extend\Crypto;

class StoresSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $stores = [
            [
                'name' => 'STech Perú - Lima Centro',
                'address' => 'Av. Abancay 123, Cercado de Lima, Lima',
                'phone' => '014567890',
                'email' => 'lima.centro@stechperu.com',
                'description' => 'Nuestra tienda principal en el centro de Lima, con atención personalizada y amplio stock.',
                'ubigeo' => '150101', // Lima, Lima, Lima
                'latitude' => -12.046374,
                'longitude' => -77.042793,
                'status' => true,
                'manager' => 'Carlos Mendoza',
                'capacity' => 100,
                'business_hours' => [
                    ['day' => 'Lunes', 'open' => '09:00', 'close' => '18:00', 'closed' => false],
                    ['day' => 'Martes', 'open' => '09:00', 'close' => '18:00', 'closed' => false],
                    ['day' => 'Miércoles', 'open' => '09:00', 'close' => '18:00', 'closed' => false],
                    ['day' => 'Jueves', 'open' => '09:00', 'close' => '18:00', 'closed' => false],
                    ['day' => 'Viernes', 'open' => '09:00', 'close' => '18:00', 'closed' => false],
                    ['day' => 'Sábado', 'open' => '09:00', 'close' => '15:00', 'closed' => false],
                    ['day' => 'Domingo', 'open' => '09:00', 'close' => '15:00', 'closed' => true],
                ],
                'slug' => Crypto::randomUUID(),
            ],
            [
                'name' => 'STech Perú - Miraflores',
                'address' => 'Av. Larco 456, Miraflores, Lima',
                'phone' => '014567891',
                'email' => 'miraflores@stechperu.com',
                'description' => 'Sucursal moderna en Miraflores, perfecta para recojo de pedidos con fácil acceso.',
                'ubigeo' => '150122', // Lima, Lima, Miraflores
                'latitude' => -12.119294,
                'longitude' => -77.030154,
                'status' => true,
                'manager' => 'Ana García',
                'capacity' => 80,
                'business_hours' => [
                    ['day' => 'Lunes', 'open' => '10:00', 'close' => '19:00', 'closed' => false],
                    ['day' => 'Martes', 'open' => '10:00', 'close' => '19:00', 'closed' => false],
                    ['day' => 'Miércoles', 'open' => '10:00', 'close' => '19:00', 'closed' => false],
                    ['day' => 'Jueves', 'open' => '10:00', 'close' => '19:00', 'closed' => false],
                    ['day' => 'Viernes', 'open' => '10:00', 'close' => '19:00', 'closed' => false],
                    ['day' => 'Sábado', 'open' => '10:00', 'close' => '16:00', 'closed' => false],
                    ['day' => 'Domingo', 'open' => '10:00', 'close' => '16:00', 'closed' => true],
                ],
                'slug' => Crypto::randomUUID(),
            ],
            [
                'name' => 'STech Perú - San Isidro',
                'address' => 'Av. Javier Prado Este 789, San Isidro, Lima',
                'phone' => '014567892',
                'email' => 'sanisidro@stechperu.com',
                'description' => 'Tienda ejecutiva en San Isidro, ideal para clientes corporativos.',
                'ubigeo' => '150129', // Lima, Lima, San Isidro
                'latitude' => -12.095789,
                'longitude' => -77.035156,
                'status' => true,
                'manager' => 'Roberto Silva',
                'capacity' => 60,
                'business_hours' => [
                    ['day' => 'Lunes', 'open' => '08:30', 'close' => '17:30', 'closed' => false],
                    ['day' => 'Martes', 'open' => '08:30', 'close' => '17:30', 'closed' => false],
                    ['day' => 'Miércoles', 'open' => '08:30', 'close' => '17:30', 'closed' => false],
                    ['day' => 'Jueves', 'open' => '08:30', 'close' => '17:30', 'closed' => false],
                    ['day' => 'Viernes', 'open' => '08:30', 'close' => '17:30', 'closed' => false],
                    ['day' => 'Sábado', 'open' => '09:00', 'close' => '14:00', 'closed' => false],
                    ['day' => 'Domingo', 'open' => '09:00', 'close' => '14:00', 'closed' => true],
                ],
                'slug' => Crypto::randomUUID(),
            ],
            [
                'name' => 'STech Perú - Arequipa Centro',
                'address' => 'Calle Mercaderes 321, Cercado, Arequipa',
                'phone' => '054123456',
                'email' => 'arequipa@stechperu.com',
                'description' => 'Primera sucursal en Arequipa, atendiendo toda la región sur del país.',
                'ubigeo' => '040101', // Arequipa, Arequipa, Arequipa
                'latitude' => -16.409047,
                'longitude' => -71.537451,
                'status' => true,
                'manager' => 'Luis Mamani',
                'capacity' => 70,
                'business_hours' => [
                    ['day' => 'Lunes', 'open' => '09:00', 'close' => '18:00', 'closed' => false],
                    ['day' => 'Martes', 'open' => '09:00', 'close' => '18:00', 'closed' => false],
                    ['day' => 'Miércoles', 'open' => '09:00', 'close' => '18:00', 'closed' => false],
                    ['day' => 'Jueves', 'open' => '09:00', 'close' => '18:00', 'closed' => false],
                    ['day' => 'Viernes', 'open' => '09:00', 'close' => '18:00', 'closed' => false],
                    ['day' => 'Sábado', 'open' => '09:00', 'close' => '15:00', 'closed' => false],
                    ['day' => 'Domingo', 'open' => '09:00', 'close' => '15:00', 'closed' => true],
                ],
                'slug' => Crypto::randomUUID(),
            ],
        ];

        foreach ($stores as $storeData) {
            Store::create($storeData);
        }
    }
}
