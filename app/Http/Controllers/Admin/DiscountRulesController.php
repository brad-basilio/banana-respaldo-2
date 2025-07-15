<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BasicController;
use App\Models\DiscountRule;
use App\Models\Item;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use App\Services\DiscountRuleService;
use Illuminate\Support\Facades\Log;

class DiscountRulesController extends BasicController
{
    public $reactView = 'Admin/DiscountRules';
    public $model = DiscountRule::class;

    public function setReactViewProperties(Request $request)
    {
        $categories = Category::where('status', 1)->get();
        $products = Item::select('id', 'name')->where('visible', 1)->get();

        return [
            'categories' => $categories,
            'products' => $products
        ];
    }

    public function setPaginationInstance(Request $request, string $model)
    {
        return $model::query();
    }    public function beforeSave(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'rule_type' => 'required|in:quantity_discount,tiered_discount,category_discount,cart_discount,buy_x_get_y,bundle_discount',
            'active' => 'boolean',
            'priority' => 'integer|min:0',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'usage_limit' => 'nullable|integer|min:1',
            'usage_limit_per_customer' => 'nullable|integer|min:1',
            'conditions' => 'nullable|array',
            'actions' => 'nullable|array',
            'combinable' => 'boolean',
            'stop_further_rules' => 'boolean'
        ]);

        // Asegurar que conditions y actions sean arrays válidos
        $data = $request->all();
        $data['conditions'] = $data['conditions'] ?? [];
        $data['actions'] = $data['actions'] ?? [];
        
        // Generar condiciones y acciones por defecto basadas en el tipo de regla
        if (empty($data['conditions']) || empty($data['actions'])) {
            $defaultConfig = $this->getDefaultRuleConfiguration($data['rule_type']);
            
            if (empty($data['conditions'])) {
                $data['conditions'] = $defaultConfig['conditions'];
            }
            
            if (empty($data['actions'])) {
                $data['actions'] = $defaultConfig['actions'];
            }
        }

        return $data;
    }

    private function getDefaultRuleConfiguration($ruleType)
    {
        $defaults = [
            'quantity_discount' => [
                'conditions' => [
                    'min_quantity' => 2,
                    'product_ids' => [],
                    'category_ids' => []
                ],
                'actions' => [
                    'discount_type' => 'percentage',
                    'discount_value' => 10
                ]
            ],
            'cart_discount' => [
                'conditions' => [
                    'min_amount' => 100,
                    'currency' => 'PEN'
                ],
                'actions' => [
                    'discount_type' => 'percentage',
                    'discount_value' => 10
                ]
            ],
            'buy_x_get_y' => [
                'conditions' => [
                    'buy_quantity' => 2,
                    'product_ids' => []
                ],
                'actions' => [
                    'get_quantity' => 1,
                    'discount_type' => 'fixed',
                    'discount_value' => 0
                ]
            ],
            'category_discount' => [
                'conditions' => [
                    'category_ids' => [],
                    'min_quantity' => 1
                ],
                'actions' => [
                    'discount_type' => 'percentage',
                    'discount_value' => 15
                ]
            ],
            'tiered_discount' => [
                'conditions' => [
                    'tiers' => [
                        ['min_quantity' => 3, 'max_quantity' => 5],
                        ['min_quantity' => 6, 'max_quantity' => 10],
                        ['min_quantity' => 11, 'max_quantity' => null]
                    ]
                ],
                'actions' => [
                    'tier_discounts' => [
                        ['discount_type' => 'percentage', 'discount_value' => 5],
                        ['discount_type' => 'percentage', 'discount_value' => 10],
                        ['discount_type' => 'percentage', 'discount_value' => 15]
                    ]
                ]
            ],
            'bundle_discount' => [
                'conditions' => [
                    'required_products' => [],
                    'min_quantity_each' => 1
                ],
                'actions' => [
                    'discount_type' => 'percentage',
                    'discount_value' => 25
                ]
            ]
        ];

        return $defaults[$ruleType] ?? [
            'conditions' => ['min_quantity' => 1],
            'actions' => ['discount_type' => 'percentage', 'discount_value' => 10]
        ];
    }

    public function toggleActive(Request $request, DiscountRule $discountRule)
    {
        $discountRule->update([
            'active' => $request->boolean('active')
        ]);

        return response()->json([
            'status' => 200,
            'message' => 'Estado actualizado exitosamente',
            'data' => $discountRule
        ]);
    }

    public function duplicate(DiscountRule $discountRule)
    {
        $newRule = $discountRule->replicate();
        $newRule->name = $discountRule->name . ' (Copia)';
        $newRule->active = false;
        $newRule->used_count = 0;
        $newRule->save();

        return response()->json([
            'status' => 200,
            'message' => 'Regla duplicada exitosamente',
            'data' => $newRule
        ]);
    }    // Endpoints auxiliares para el formulario
    public function getProducts()
    {
        $products = Item::select('id', 'name', 'sku', 'price')
                       ->where('visible', true)
                       ->orderBy('name')
                       ->get();

        return response()->json([
            'status' => 200,
            'message' => 'Productos obtenidos exitosamente',
            'data' => $products
        ]);
    }

    public function getProductsByIds(Request $request)
    {
        $ids = $request->input('ids', []);
        
        if (empty($ids)) {
            return response()->json([
                'status' => 200,
                'message' => 'No hay IDs proporcionados',
                'data' => []
            ]);
        }

        $products = Item::select('id', 'name', 'sku', 'price')
                       ->whereIn('id', $ids)
                       ->where('visible', true)
                       ->orderBy('name')
                       ->get();

        return response()->json([
            'status' => 200,
            'message' => 'Productos obtenidos exitosamente',
            'data' => $products
        ]);
    }

    public function getCategories()
    {
        $categories = Category::select('id', 'name')
                             ->orderBy('name')
                             ->get();

        return response()->json([
            'status' => 200,
            'message' => 'Categorías obtenidas exitosamente',
            'data' => $categories
        ]);
    }

    public function getCategoriesByIds(Request $request)
    {
        $ids = $request->input('ids', []);
        
        if (empty($ids)) {
            return response()->json([
                'status' => 200,
                'message' => 'No hay IDs proporcionados',
                'data' => []
            ]);
        }

        $categories = Category::select('id', 'name')
                             ->whereIn('id', $ids)
                             ->orderBy('name')
                             ->get();

        return response()->json([
            'status' => 200,
            'message' => 'Categorías obtenidas exitosamente',
            'data' => $categories
        ]);
    }

    public function getRuleTypes()
    {
        $ruleTypes = [
            'quantity_discount' => [
                'name' => 'Descuento por Cantidad',
                'description' => 'Aplica descuento cuando se compra una cantidad mínima',
                'example' => 'Compra 3 o más y obtén 20% de descuento'
            ],
            'cart_discount' => [
                'name' => 'Descuento por Carrito',
                'description' => 'Aplica descuento al total del carrito',
                'example' => 'Compras mayores a S/100 obtienen 10% descuento'
            ],
            'buy_x_get_y' => [
                'name' => 'Compra X Lleva Y',
                'description' => 'Productos gratis por comprar cierta cantidad',
                'example' => 'Compra 2 y lleva 1 gratis'
            ],
            'category_discount' => [
                'name' => 'Descuento por Categoría',
                'description' => 'Aplica descuento a productos de categorías específicas',
                'example' => '15% descuento en toda la categoría Electrónicos'
            ],
            'tiered_discount' => [
                'name' => 'Descuento Escalonado',
                'description' => 'Diferentes niveles de descuento según cantidad/monto',
                'example' => '5% por 3-5 items, 10% por 6-10 items, 15% por 11+ items'
            ],
            'bundle_discount' => [
                'name' => 'Descuento por Paquete',
                'description' => 'Descuento al comprar productos específicos juntos',
                'example' => 'Laptop + Mouse + Teclado = 25% descuento en el combo'
            ]
        ];

        return response()->json([
            'status' => 200,
            'message' => 'Tipos de reglas obtenidos exitosamente',
            'data' => $ruleTypes
        ]);
    }

    public function getUsageStats(DiscountRule $discountRule)
    {
        $stats = [
            'total_uses' => $discountRule->used_count,
            'total_discount_amount' => $discountRule->usages()->sum('discount_amount'),
            'unique_customers' => $discountRule->usages()->distinct('customer_email')->count(),
            'recent_uses' => $discountRule->usages()
                                         ->with('sale')
                                         ->latest()
                                         ->limit(10)
                                         ->get()
        ];

        return response()->json([
            'status' => 200,
            'message' => 'Estadísticas obtenidas exitosamente',
            'data' => $stats
        ]);
    }

    /**
     * Apply discount rules to a cart
     */
    public function applyToCart(Request $request)
    {        try {
            $request->validate([
                'cart_items' => 'required|array',
                'cart_items.*.item_id' => 'required|string', // Changed from integer to string for UUID
                'cart_items.*.quantity' => 'required|integer|min:1',
                'cart_items.*.price' => 'required|numeric|min:0',
                'cart_items.*.name' => 'required|string',
                'cart_items.*.category_id' => 'nullable|string', // Changed from integer to string for UUID
                'total_amount' => 'required|numeric|min:0',
                'customer_email' => 'nullable|email'
            ]);

            $cartItems = $request->cart_items;
            $totalAmount = $request->total_amount;
            $customerEmail = $request->customer_email ?? auth()->user()?->email;

            $discountService = new DiscountRuleService();
            $result = $discountService->evaluateCart($cartItems, $customerEmail, $totalAmount);

            return response()->json([
                'status' => 200,
                'message' => 'Reglas de descuento aplicadas correctamente',
                'data' => [
                    'applied_discounts' => $result['applied_discounts'],
                    'total_discount' => $result['total_discount'],
                    'original_total' => $totalAmount,
                    'final_total' => $totalAmount - $result['total_discount'],
                    'cart_items' => $result['cart_items'] ?? $cartItems
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 422,
                'message' => 'Datos de entrada inválidos',
                'data' => [
                    'errors' => $e->errors()
                ]
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error applying discount rules to cart: ' . $e->getMessage());
            
            return response()->json([
                'status' => 500,
                'message' => 'Error interno del servidor',
                'data' => [
                    'error' => $e->getMessage()
                ]
            ], 500);
        }
    }
}
