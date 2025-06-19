<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Coupon;
use Carbon\Carbon;

class CouponSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $coupons = [
            [
                'code' => 'BIENVENIDO20',
                'name' => 'Descuento de Bienvenida',
                'description' => 'Descuento del 20% para nuevos clientes',
                'type' => 'percentage',
                'value' => 20.00,
                'minimum_amount' => 100.00,
                'usage_limit' => 100,
                'usage_limit_per_user' => 1,
                'starts_at' => Carbon::now(),
                'expires_at' => Carbon::now()->addMonths(3),
                'first_purchase_only' => true,
                'active' => true,
            ],
            [
                'code' => 'DESCUENTO50',
                'name' => 'Descuento Fijo 50 Soles',
                'description' => 'Descuento fijo de S/. 50.00 en compras mayores a S/. 200.00',
                'type' => 'fixed',
                'value' => 50.00,
                'minimum_amount' => 200.00,
                'usage_limit' => 50,
                'usage_limit_per_user' => 2,
                'starts_at' => Carbon::now(),
                'expires_at' => Carbon::now()->addMonths(2),
                'first_purchase_only' => false,
                'active' => true,
            ],
            [
                'code' => 'MEGA30',
                'name' => 'Mega Descuento 30%',
                'description' => 'Descuento del 30% con tope máximo de S/. 150.00',
                'type' => 'percentage',
                'value' => 30.00,
                'minimum_amount' => 300.00,
                'maximum_discount' => 150.00,
                'usage_limit' => 20,
                'usage_limit_per_user' => 1,
                'starts_at' => Carbon::now(),
                'expires_at' => Carbon::now()->addMonths(1),
                'first_purchase_only' => false,
                'active' => true,
            ],
            [
                'code' => 'PRONTO15',
                'name' => 'Descuento Próximamente',
                'description' => 'Descuento del 15% que estará disponible próximamente',
                'type' => 'percentage',
                'value' => 15.00,
                'minimum_amount' => 50.00,
                'usage_limit' => null, // Ilimitado
                'usage_limit_per_user' => 3,
                'starts_at' => Carbon::now()->addWeek(),
                'expires_at' => Carbon::now()->addMonths(4),
                'first_purchase_only' => false,
                'active' => true,
            ],
            [
                'code' => 'EXPIRADO10',
                'name' => 'Descuento Expirado',
                'description' => 'Descuento del 10% que ya expiró',
                'type' => 'percentage',
                'value' => 10.00,
                'minimum_amount' => 0.00,
                'usage_limit' => 1000,
                'usage_limit_per_user' => 5,
                'starts_at' => Carbon::now()->subMonths(2),
                'expires_at' => Carbon::now()->subWeek(),
                'first_purchase_only' => false,
                'active' => true,
            ]
        ];

        foreach ($coupons as $couponData) {
            Coupon::create($couponData);
        }
    }
}
