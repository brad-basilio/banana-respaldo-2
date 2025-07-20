<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\DeliveryPrice;
use SoDe\Extend\Crypto;

class SetupStorePickupPricing extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'setup:store-pickup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Setup store pickup pricing for major cities';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Setting up store pickup pricing...');

        $configurations = [
            [
                'name' => 'Lima, Lima',
                'ubigeo' => '150101', // Lima, Lima, Lima
                'description' => 'Retiro en tienda disponible en nuestras sucursales de Lima',
                'price' => null, // Delivery gratis + retiro en tienda
                'is_free' => true,
                'is_agency' => false,
                'is_store_pickup' => true,
                'express_price' => 15.00,
                'agency_price' => 0,
            ],
            [
                'name' => 'Miraflores, Lima',
                'ubigeo' => '150122', // Lima, Lima, Miraflores
                'description' => 'Retiro en tienda disponible en nuestra sucursal de Miraflores',
                'price' => null,
                'is_free' => true,
                'is_agency' => false,
                'is_store_pickup' => true,
                'express_price' => 12.00,
                'agency_price' => 0,
            ],
            [
                'name' => 'San Isidro, Lima',
                'ubigeo' => '150129', // Lima, Lima, San Isidro
                'description' => 'Retiro en tienda disponible en nuestra sucursal ejecutiva',
                'price' => null,
                'is_free' => true,
                'is_agency' => false,
                'is_store_pickup' => true,
                'express_price' => 12.00,
                'agency_price' => 0,
            ],
            [
                'name' => 'Arequipa, Arequipa',
                'ubigeo' => '040101', // Arequipa, Arequipa, Arequipa
                'description' => 'Retiro en tienda disponible en nuestra sucursal de Arequipa',
                'price' => 0, // Solo retiro en tienda
                'is_free' => false,
                'is_agency' => false,
                'is_store_pickup' => true,
                'express_price' => 0,
                'agency_price' => 0,
            ],
        ];

        foreach ($configurations as $config) {
            // Verificar si ya existe una configuración para este ubigeo
            $existing = DeliveryPrice::where('ubigeo', $config['ubigeo'])->first();
            
            if ($existing) {
                // Actualizar la configuración existente para incluir retiro en tienda
                $existing->update([
                    'is_store_pickup' => true,
                    'description' => $config['description'],
                ]);
                $this->info("✓ Actualizado: {$config['name']} - Retiro en tienda habilitado");
            } else {
                // Crear nueva configuración
                $config['id'] = Crypto::randomUUID();
                DeliveryPrice::create($config);
                $this->info("✓ Creado: {$config['name']} - Configuración completa");
            }
        }

        $this->info('');
        $this->info('🎉 Configuración de retiro en tienda completada!');
        $this->info('Las siguientes ciudades ahora tienen retiro en tienda disponible:');
        $this->info('- Lima Centro');
        $this->info('- Miraflores');
        $this->info('- San Isidro');
        $this->info('- Arequipa');
        
        return 0;
    }
}
