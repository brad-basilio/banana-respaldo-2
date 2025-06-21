<?php

namespace App\Services;

use App\Models\DiscountRule;
use App\Models\DiscountRuleUsage;
use App\Models\Item;
use App\Models\Category;
use Illuminate\Support\Collection;

class DiscountRuleService
{
    /**
     * Evalúa y aplica reglas de descuento a un carrito
     */    public function evaluateCart($cartItems, $customerEmail = null, $totalAmount = 0)
    {
        $appliedDiscounts = [];
        $totalDiscount = 0;
        $modifiedCart = collect($cartItems);
        $freeItems = [];

        // Obtener reglas válidas ordenadas por prioridad
        $rules = DiscountRule::valid()
            ->byPriority()
            ->get();

        foreach ($rules as $rule) {
            // Verificar si la regla puede ser usada por el cliente
            if ($customerEmail && !$rule->canBeUsedByCustomer($customerEmail)) {
                continue;
            }            // Evaluar si la regla aplica al carrito
            if ($this->evaluateRuleConditions($rule, $modifiedCart, $totalAmount, $customerEmail)) {
                // Aplicar la regla
                $discount = $this->applyRule($rule, $modifiedCart, $totalAmount);
                
                if ($discount['amount'] > 0 || !empty($discount['suggested_items'])) {
                    $appliedDiscounts[] = [
                        'rule_id' => $rule->id,
                        'rule_name' => $rule->name,
                        'rule_type' => $rule->rule_type,
                        'discount_amount' => $discount['amount'],
                        'applied_items' => $discount['applied_items'] ?? [],
                        'suggested_items' => $discount['suggested_items'] ?? [],
                        'description' => $discount['description'] ?? $rule->getReadableDescription(),
                        'promotion_type' => $discount['promotion_type'] ?? null,
                        'free_items' => $discount['free_items'] ?? []
                    ];
                    
                    $totalDiscount += $discount['amount'];
                    
                    // Agregar items gratuitos si existen
                    if (isset($discount['free_items']) && !empty($discount['free_items'])) {
                        $freeItems = array_merge($freeItems, $discount['free_items']);
                    }
                    
                    // Si la regla modifica el carrito (productos gratis, etc.)
                    if (isset($discount['modified_cart'])) {
                        $modifiedCart = collect($discount['modified_cart']);
                    }
                    
                    // Si la regla dice que pare la evaluación
                    if ($rule->stop_further_rules) {
                        break;
                    }
                }
            }
        }

        return [
            'applied_discounts' => $appliedDiscounts,
            'total_discount' => $totalDiscount,
            'modified_cart' => $modifiedCart->toArray(),
            'free_items' => $freeItems
        ];
    }

    /**
     * Evalúa si una regla aplica al carrito actual
     */
    private function evaluateRuleConditions(DiscountRule $rule, Collection $cartItems, $totalAmount, $customerEmail)
    {
        $conditions = $rule->conditions;

        // Verificar cantidad mínima
        if (isset($conditions['min_quantity'])) {
            $totalQuantity = $cartItems->sum('quantity');
            if ($totalQuantity < $conditions['min_quantity']) {
                return false;
            }
        }

        // Verificar monto mínimo
        if (isset($conditions['min_amount'])) {
            if ($totalAmount < $conditions['min_amount']) {
                return false;
            }
        }

        // Verificar productos específicos
        if (isset($conditions['products'])) {
            $requiredProducts = $conditions['products'];
            $cartProductIds = $cartItems->pluck('item_id')->unique()->toArray();
            
            if (!array_intersect($requiredProducts, $cartProductIds)) {
                return false;
            }
        }

        // Verificar categorías específicas
        if (isset($conditions['categories'])) {
            $requiredCategories = $conditions['categories'];
            $cartCategoryIds = [];
            
            foreach ($cartItems as $item) {
                $product = Item::find($item['item_id']);
                if ($product && $product->category_id) {
                    $cartCategoryIds[] = $product->category_id;
                }
            }
            
            if (!array_intersect($requiredCategories, array_unique($cartCategoryIds))) {
                return false;
            }
        }

        // Verificar que tenga productos para compra X lleva Y
        if ($rule->rule_type === 'buy_x_get_y' && isset($conditions['buy_quantity'])) {
            $targetProducts = $conditions['products'] ?? [];
            if (!empty($targetProducts)) {
                $targetQuantity = $cartItems->whereIn('item_id', $targetProducts)->sum('quantity');
                if ($targetQuantity < $conditions['buy_quantity']) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Aplica una regla específica al carrito
     */
    private function applyRule(DiscountRule $rule, Collection $cartItems, $totalAmount)
    {
        $actions = $rule->actions;
        $conditions = $rule->conditions;

        switch ($rule->rule_type) {
            case 'quantity_discount':
                return $this->applyQuantityDiscount($rule, $cartItems, $actions, $conditions);
                
            case 'cart_discount':
                return $this->applyCartDiscount($rule, $totalAmount, $actions);
                
            case 'buy_x_get_y':
                return $this->applyBuyXGetY($rule, $cartItems, $actions, $conditions);
                
            case 'category_discount':
                return $this->applyCategoryDiscount($rule, $cartItems, $actions, $conditions);
                
            case 'tiered_discount':
                return $this->applyTieredDiscount($rule, $cartItems, $actions, $conditions);
                
            default:
                return ['amount' => 0, 'applied_items' => []];
        }
    }

    /**
     * Aplica descuento por cantidad
     */
    private function applyQuantityDiscount(DiscountRule $rule, Collection $cartItems, $actions, $conditions)
    {
        $discountAmount = 0;
        $appliedItems = [];

        // Filtrar productos aplicables
        $applicableItems = $cartItems;
        if (isset($conditions['products'])) {
            $applicableItems = $cartItems->whereIn('item_id', $conditions['products']);
        }

        foreach ($applicableItems as $index => $item) {
            if ($item['quantity'] >= ($conditions['min_quantity'] ?? 1)) {
                $itemDiscount = 0;
                
                if ($actions['discount_type'] === 'percentage') {
                    $itemDiscount = ($item['final_price'] * $item['quantity']) * ($actions['discount_value'] / 100);
                } else if ($actions['discount_type'] === 'fixed') {
                    $itemDiscount = $actions['discount_value'] * $item['quantity'];
                }

                // Aplicar límite máximo si existe
                if (isset($actions['max_discount'])) {
                    $itemDiscount = min($itemDiscount, $actions['max_discount']);
                }

                $discountAmount += $itemDiscount;
                $appliedItems[] = [
                    'item_id' => $item['item_id'],
                    'quantity' => $item['quantity'],
                    'discount' => $itemDiscount
                ];
            }
        }

        return [
            'amount' => $discountAmount,
            'applied_items' => $appliedItems,
            'description' => "Descuento por cantidad: {$actions['discount_value']}" . 
                           ($actions['discount_type'] === 'percentage' ? '%' : ' soles')
        ];
    }

    /**
     * Aplica descuento al carrito total
     */
    private function applyCartDiscount(DiscountRule $rule, $totalAmount, $actions)
    {
        $discountAmount = 0;

        if ($actions['discount_type'] === 'percentage') {
            $discountAmount = $totalAmount * ($actions['discount_value'] / 100);
        } else if ($actions['discount_type'] === 'fixed') {
            $discountAmount = $actions['discount_value'];
        }

        // Aplicar límite máximo si existe
        if (isset($actions['max_discount'])) {
            $discountAmount = min($discountAmount, $actions['max_discount']);
        }

        return [
            'amount' => $discountAmount,
            'applied_items' => [],
            'description' => "Descuento en carrito: {$actions['discount_value']}" . 
                           ($actions['discount_type'] === 'percentage' ? '%' : ' soles')
        ];
    }    /**
     * Aplica promoción compra X lleva Y
     */
    private function applyBuyXGetY(DiscountRule $rule, Collection $cartItems, $actions, $conditions)
    {
        $modifiedCart = $cartItems->toArray();
        $freeItems = [];
        $suggestedItems = [];
        $discountAmount = 0;

        $buyQuantity = $conditions['buy_quantity'] ?? 1;
        $getQuantity = $actions['get_quantity'] ?? 1;
        $totalRequired = $buyQuantity + $getQuantity; // Total necesario para aplicar descuento
        
        // Productos aplicables
        $targetProducts = $conditions['product_ids'] ?? [];
        
        if (!empty($targetProducts)) {
            foreach ($targetProducts as $productId) {
                $cartItem = $cartItems->firstWhere('item_id', $productId);
                $product = Item::find($productId);
                
                if ($cartItem && $product) {
                    $currentQuantity = $cartItem['quantity'];
                    
                    // Caso 1: Ya tiene suficientes productos para aplicar descuento
                    if ($currentQuantity >= $totalRequired) {
                        $freeItemsEligible = floor($currentQuantity / $totalRequired) * $getQuantity;
                        $freeItemsValue = $freeItemsEligible * $product->final_price;
                        $discountAmount += $freeItemsValue;
                        
                        $freeItems[] = [
                            'item_id' => $productId,
                            'item_name' => $product->name,
                            'item_image' => $product->image,
                            'item_price' => $product->final_price,
                            'quantity' => $freeItemsEligible,
                            'discount' => $freeItemsValue,
                            'buy_quantity' => $buyQuantity,
                            'get_quantity' => $getQuantity,
                            'status' => 'applied' // Descuento ya aplicado
                        ];
                    }
                    // Caso 2: Tiene suficientes para comprar pero no el gratis
                    else if ($currentQuantity >= $buyQuantity) {
                        $missingQuantity = $getQuantity; // Cantidad que falta para completar la promo
                        
                        $suggestedItems[] = [
                            'item_id' => $productId,
                            'item_name' => $product->name,
                            'item_image' => $product->image,
                            'item_price' => $product->final_price,
                            'current_quantity' => $currentQuantity,
                            'suggested_quantity' => $missingQuantity,
                            'buy_quantity' => $buyQuantity,
                            'get_quantity' => $getQuantity,
                            'status' => 'suggestion', // Sugerencia para agregar más
                            'savings' => $missingQuantity * $product->final_price // Cuánto se ahorraría
                        ];
                    }
                }
            }
        }        return [
            'amount' => $discountAmount,
            'applied_items' => $freeItems,
            'suggested_items' => $suggestedItems,
            'modified_cart' => $modifiedCart,
            'description' => "Compra {$buyQuantity} lleva {$getQuantity} gratis",
            'promotion_type' => 'buy_x_get_y',
            'free_items' => $freeItems
        ];
    }

    /**
     * Aplica descuento por categoría
     */
    private function applyCategoryDiscount(DiscountRule $rule, Collection $cartItems, $actions, $conditions)
    {
        $discountAmount = 0;
        $appliedItems = [];
        $targetCategories = $conditions['categories'] ?? [];

        foreach ($cartItems as $item) {
            $product = Item::find($item['item_id']);
            if ($product && in_array($product->category_id, $targetCategories)) {
                $itemDiscount = 0;
                
                if ($actions['discount_type'] === 'percentage') {
                    $itemDiscount = ($item['final_price'] * $item['quantity']) * ($actions['discount_value'] / 100);
                } else if ($actions['discount_type'] === 'fixed') {
                    $itemDiscount = $actions['discount_value'] * $item['quantity'];
                }

                $discountAmount += $itemDiscount;
                $appliedItems[] = [
                    'item_id' => $item['item_id'],
                    'quantity' => $item['quantity'],
                    'discount' => $itemDiscount
                ];
            }
        }

        return [
            'amount' => $discountAmount,
            'applied_items' => $appliedItems,
            'description' => "Descuento por categoría: {$actions['discount_value']}" . 
                           ($actions['discount_type'] === 'percentage' ? '%' : ' soles')
        ];
    }

    /**
     * Aplica descuento escalonado
     */
    private function applyTieredDiscount(DiscountRule $rule, Collection $cartItems, $actions, $conditions)
    {
        // Implementación simple de descuento escalonado
        $totalQuantity = $cartItems->sum('quantity');
        $tiers = $actions['tiers'] ?? [];
        
        $discountAmount = 0;
        $appliedTier = null;

        // Buscar el tier aplicable (mayor cantidad que califique)
        foreach ($tiers as $tier) {
            if ($totalQuantity >= $tier['min_quantity']) {
                $appliedTier = $tier;
            }
        }

        if ($appliedTier) {
            if ($appliedTier['discount_type'] === 'percentage') {
                $totalCartValue = $cartItems->sum(function($item) {
                    return $item['final_price'] * $item['quantity'];
                });
                $discountAmount = $totalCartValue * ($appliedTier['discount_value'] / 100);
            } else if ($appliedTier['discount_type'] === 'fixed') {
                $discountAmount = $appliedTier['discount_value'];
            }
        }

        return [
            'amount' => $discountAmount,
            'applied_items' => [],
            'description' => $appliedTier ? 
                "Descuento escalonado: {$appliedTier['discount_value']}" . 
                ($appliedTier['discount_type'] === 'percentage' ? '%' : ' soles') : 
                'Sin descuento escalonado aplicable'
        ];
    }

    /**
     * Registra el uso de una regla de descuento
     */
    public function recordRuleUsage($ruleId, $saleId, $customerEmail, $discountAmount, $appliedItems = [])
    {
        DiscountRuleUsage::create([
            'discount_rule_id' => $ruleId,
            'sale_id' => $saleId,
            'customer_email' => $customerEmail,
            'discount_amount' => $discountAmount,
            'applied_items' => $appliedItems
        ]);

        // Incrementar contador de uso de la regla
        $rule = DiscountRule::find($ruleId);
        if ($rule) {
            $rule->incrementUsage();
        }
    }
}
