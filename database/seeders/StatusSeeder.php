<?php

namespace Database\Seeders;

use App\Models\SaleStatus;
use Illuminate\Database\Seeder;
use SoDe\Extend\Crypto;

class StatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            [
                'id' => 'f13fa605-72dd-4729-beaa-ee14c9bbc47b',
                'name' => 'Pendiente',
                'color' => '#6c757d',
                'editable' => false,
                'reversible' => true
            ],
            [
                'id' => '312f9a91-d3f2-4672-a6bf-678967616cac',
                'name' => 'Pagado',
                'color' => '#71b6f9',
                'editable' => false,
                'reversible' => true
            ],
            [
                'id' => 'bd60fc99-c0c0-463d-b738-1c72d7b085f5',
                'name' => 'Pagado - Por verificar',
                'color' => '#71b6f9',
                'editable' => false,
                'reversible' => true
            ],
            [
                'id' => 'd3a77651-15df-4fdc-a3db-91d6a8f4247c',
                'name' => 'Rechazado',
                'color' => '#ff5b5b',
                'editable' => false,
                'reversible' => true
            ],
            [
                'id' => 'c063efb2-1e9b-4a43-8991-b444c14d30dd',
                'name' => 'Anulado',
                'color' => '#323a46',
                'reversible' => false
            ],
            [
                'id' => 'a8903cd5-e91d-47d2-93ee-e0fca3845ecc',
                'name' => 'En producción',
                'color' => '#ffc107',
                'reversible' => true
            ],
            [
                'id' => 'ad509181-6701-4fa1-a990-6bcb103254af',
                'name' => 'Enviado',
                'color' => '#17a2b8',
                'reversible' => true
            ],
            [
                'id' => 'bc012ef5-96e8-4bbb-867b-061c4090d9d2',
                'name' => 'Entregado',
                'color' => '#10c469',
                'reversible' => false
            ],
        ];
        foreach ($statuses as $status) {
            SaleStatus::updateOrCreate(['name' => $status['name']], $status);
        }
    }
}
