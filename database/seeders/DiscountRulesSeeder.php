<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DiscountRule;
use Carbon\Carbon;

class DiscountRulesSeeder extends Seeder
{
    public function run()
    {
        $rules = [
            [
                'name' => '2x1 en Electrónicos',
                'description' => 'Compra 2 productos de electrónicos y lleva 1 gratis',
                'active' => true,
                'priority' => 10,
                'rule_type' => 'buy_x_get_y',
                'conditions' => [
                    'buy_quantity' => 2,
                    'categories' => ['9f19e6d0-4baa-4c2e-a689-f644ac2d57f0'] // Asumiendo que 1 es electrónicos
                ],
                'actions' => [
                    'get_quantity' => 1,
                    'apply_to' => 'cheapest'
                ],
                'combinable' => false,
                'stop_further_rules' => true
            ],
            [
                'name' => 'Descuento por Volumen',
                'description' => 'Compra 5 o más productos y obtén 15% de descuento',
                'active' => true,
                'priority' => 8,
                'rule_type' => 'quantity_discount',
                'conditions' => [
                    'min_quantity' => 5
                ],
                'actions' => [
                    'discount_type' => 'percentage',
                    'discount_value' => 15,
                    'max_discount' => 100
                ],
                'combinable' => true,
                'stop_further_rules' => false
            ],
            [
                'name' => 'Compras Grandes',
                'description' => 'Compras mayores a S/200 obtienen S/20 de descuento',
                'active' => true,
                'priority' => 6,
                'rule_type' => 'cart_discount',
                'conditions' => [
                    'min_amount' => 200
                ],
                'actions' => [
                    'discount_type' => 'fixed',
                    'discount_value' => 20
                ],
                'combinable' => true,
                'stop_further_rules' => false
            ],
            [
                'name' => 'Descuento Escalonado',
                'description' => 'Diferentes descuentos según cantidad de productos',
                'active' => true,
                'priority' => 5,
                'rule_type' => 'tiered_discount',
                'conditions' => [],
                'actions' => [
                    'tiers' => [
                        [
                            'min_quantity' => 3,
                            'discount_type' => 'percentage',
                            'discount_value' => 5
                        ],
                        [
                            'min_quantity' => 6,
                            'discount_type' => 'percentage',
                            'discount_value' => 10
                        ],
                        [
                            'min_quantity' => 10,
                            'discount_type' => 'percentage',
                            'discount_value' => 15
                        ]
                    ]
                ],
                'combinable' => false,
                'stop_further_rules' => false
            ],
            [
                'name' => 'Promoción Temporal Black Friday',
                'description' => '30% descuento en toda la tienda por tiempo limitado',
                'active' => false, // Inactiva por defecto
                'priority' => 15,
                'starts_at' => Carbon::parse('2024-11-25 00:00:00'),
                'ends_at' => Carbon::parse('2024-11-30 23:59:59'),
                'usage_limit' => 1000,
                'rule_type' => 'cart_discount',
                'conditions' => [
                    'min_amount' => 50
                ],
                'actions' => [
                    'discount_type' => 'percentage',
                    'discount_value' => 30,
                    'max_discount' => 200
                ],
                'combinable' => false,
                'stop_further_rules' => true
            ]
        ];

        foreach ($rules as $rule) {
            DiscountRule::create($rule);
        }
    }
}
