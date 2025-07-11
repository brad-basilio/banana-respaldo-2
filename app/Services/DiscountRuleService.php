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

        \Log::info('🔄 Starting discount evaluation', [
            'valid_rules_count' => $rules->count(),
            'cart_items_count' => count($cartItems),
            'total_amount' => $totalAmount,
            'customer_email' => $customerEmail
        ]);
        
        foreach ($rules as $rule) {
            \Log::info('🔍 Evaluating rule', [
                'rule_id' => $rule->id,
                'rule_name' => $rule->name,
                'rule_type' => $rule->rule_type,
                'conditions' => $rule->conditions,
                'actions' => $rule->actions
            ]);
            
            // Verificar si la regla puede ser usada por el cliente
            if ($customerEmail && !$rule->canBeUsedByCustomer($customerEmail)) {
                \Log::info('❌ Customer cannot use rule', ['rule_id' => $rule->id]);
                continue;
            }
            
            // Evaluar si la regla aplica al carrito
            $conditionsResult = $this->evaluateRuleConditions($rule, $modifiedCart, $totalAmount, $customerEmail);
            \Log::info('📋 Rule conditions evaluation', [
                'rule_id' => $rule->id,
                'conditions_met' => $conditionsResult
            ]);
            
            if ($conditionsResult) {
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
        
        \Log::info('🔍 Evaluating rule conditions', [
            'rule_id' => $rule->id,
            'rule_type' => $rule->rule_type,
            'conditions' => $conditions,
            'cart_items_count' => count($cartItems),
            'total_amount' => $totalAmount
        ]);

        // Verificar cantidad mínima
        if (isset($conditions['min_quantity'])) {
            $totalQuantity = $cartItems->sum('quantity');
            \Log::info('📊 Checking min_quantity condition', [
                'required_min_quantity' => $conditions['min_quantity'],
                'actual_total_quantity' => $totalQuantity,
                'condition_met' => $totalQuantity >= $conditions['min_quantity']
            ]);
            
            if ($totalQuantity < $conditions['min_quantity']) {
                \Log::info('❌ min_quantity condition failed');
                return false;
            }
        }

        // Verificar monto mínimo
        if (isset($conditions['min_amount'])) {
            \Log::info('💰 Checking min_amount condition', [
                'required_min_amount' => $conditions['min_amount'],
                'actual_total_amount' => $totalAmount,
                'condition_met' => $totalAmount >= $conditions['min_amount']
            ]);
            
            if ($totalAmount < $conditions['min_amount']) {
                \Log::info('❌ min_amount condition failed');
                return false;
            }
        }

        // Verificar productos específicos
        if (isset($conditions['products']) || isset($conditions['product_ids'])) {
            $requiredProducts = $conditions['products'] ?? $conditions['product_ids'] ?? [];
            $cartProductIds = $cartItems->pluck('item_id')->unique()->toArray();
            // Si requiredProducts está vacío, no filtrar por productos (aplica a todos)
            if (is_array($requiredProducts) && count($requiredProducts) > 0) {
                if (!array_intersect($requiredProducts, $cartProductIds)) {
                    return false;
                }
            }
        }

        // Verificar categorías específicas
        if (isset($conditions['categories']) || isset($conditions['category_ids'])) {
            $requiredCategories = $conditions['categories'] ?? $conditions['category_ids'] ?? [];
            $cartCategoryIds = [];
            foreach ($cartItems as $item) {
                $product = Item::find($item['item_id']);
                if ($product && $product->category_id) {
                    $cartCategoryIds[] = $product->category_id;
                }
            }
            // Si requiredCategories está vacío, no filtrar por categorías (aplica a todas)
            if (is_array($requiredCategories) && count($requiredCategories) > 0) {
                if (!array_intersect($requiredCategories, array_unique($cartCategoryIds))) {
                    return false;
                }
            }
        }

        // Verificar que tenga productos para compra X lleva Y
        if ($rule->rule_type === 'buy_x_get_y' && isset($conditions['buy_quantity'])) {
            $targetProducts = $conditions['product_ids'] ?? [];
            if (!empty($targetProducts)) {
                $targetQuantity = $cartItems->whereIn('item_id', $targetProducts)->sum('quantity');
                if ($targetQuantity < $conditions['buy_quantity']) {
                    return false;
                }
            }
        }

        // Verificar productos requeridos para bundle_discount
        if ($rule->rule_type === 'bundle_discount' && isset($conditions['required_products'])) {
            $requiredProducts = $conditions['required_products'];
            $minQuantityEach = $conditions['min_quantity_each'] ?? 1;
            $cartProductIds = $cartItems->pluck('item_id')->unique()->toArray();
            
            // Verificar que todos los productos requeridos estén en el carrito
            foreach ($requiredProducts as $productId) {
                if (!in_array($productId, $cartProductIds)) {
                    return false;
                }
                
                // Verificar cantidad mínima de cada producto
                $productQuantity = $cartItems->where('item_id', $productId)->sum('quantity');
                if ($productQuantity < $minQuantityEach) {
                    return false;
                }
            }
        }

        \Log::info('✅ All rule conditions passed', ['rule_id' => $rule->id]);
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
                
            case 'bundle_discount':
                return $this->applyBundleDiscount($rule, $cartItems, $actions, $conditions);
                
            default:
                return ['amount' => 0, 'applied_items' => []];
        }
    }

    /**
     * Aplica descuento por cantidad
     */
    private function applyQuantityDiscount(DiscountRule $rule, Collection $cartItems, $actions, $conditions)
    {
        \Log::info('🔍 Applying quantity discount', [
            'rule_id' => $rule->id,
            'rule_name' => $rule->name,
            'conditions' => $conditions,
            'actions' => $actions,
            'cart_items_count' =>count($cartItems),
            'cart_items' => $cartItems->toArray()
        ]);
        
        $discountAmount = 0;
        $appliedItems = [];
        $minQuantity = $conditions['min_quantity'] ?? 1;
        
        \Log::info('📊 Quantity discount parameters', [
            'min_quantity' => $minQuantity,
            'product_ids' => $conditions['product_ids'] ?? [],
            'category_ids' => $conditions['category_ids'] ?? []
        ]);
        
        // Filtrar productos aplicables
        $applicableItems = $cartItems;
        
        // Filtrar por productos específicos si están definidos
        if (isset($conditions['product_ids']) && !empty($conditions['product_ids'])) {
            $applicableItems = $cartItems->whereIn('item_id', $conditions['product_ids']);
            \Log::info('🎯 Filtered by product_ids', [
                'product_ids' => $conditions['product_ids'],
                'applicable_items_count' => $applicableItems->count()
            ]);
        }
        
        // Filtrar por categorías si están definidas
        if (isset($conditions['category_ids']) && !empty($conditions['category_ids'])) {
            $categoryFilteredItems = collect();
            foreach ($cartItems as $item) {
                $product = Item::find($item['item_id']);
                if ($product && in_array($product->category_id, $conditions['category_ids'])) {
                    $categoryFilteredItems->push($item);
                }
            }
            $applicableItems = $categoryFilteredItems;
            \Log::info('🏷️ Filtered by category_ids', [
                'category_ids' => $conditions['category_ids'],
                'applicable_items_count' => $applicableItems->count()
            ]);
        }
        
        // Verificar si la cantidad total de productos aplicables cumple el mínimo
        $totalApplicableQuantity = $applicableItems->sum('quantity');
        \Log::info('📈 Quantity check', [
            'total_applicable_quantity' => $totalApplicableQuantity,
            'min_quantity_required' => $minQuantity,
            'meets_requirement' => $totalApplicableQuantity >= $minQuantity
        ]);
        
        if ($totalApplicableQuantity < $minQuantity) {
            \Log::info('❌ Quantity discount not applied - insufficient quantity');
            return ['amount' => 0, 'applied_items' => []];
        }

        foreach ($applicableItems as $item) {
            $itemDiscount = 0;
            $itemPrice = $item['price'] ?? $item['final_price'] ?? 0;
            
            if ($actions['discount_type'] === 'percentage') {
                $itemDiscount = ($itemPrice * $item['quantity']) * ($actions['discount_value'] / 100);
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

        \Log::info('✅ Quantity discount applied successfully', [
            'discount_amount' => $discountAmount,
            'applied_items_count' => count($appliedItems),
            'applied_items' => $appliedItems
        ]);
        
        return [
            'amount' => $discountAmount,
            'applied_items' => $appliedItems,
            'description' => "Descuento por cantidad (≥{$minQuantity} productos): {$actions['discount_value']}" . 
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
        $totalQuantity = $cartItems->sum('quantity');
        $totalCartValue = $cartItems->sum(function($item) {
            return ($item['price'] ?? $item['final_price'] ?? 0) * $item['quantity'];
        });
        
        $discountAmount = 0;
        $appliedTier = null;
        $appliedItems = [];
        
        // Obtener tiers de actions o conditions
        $tiers = $actions['tiers'] ?? $conditions['tiers'] ?? [];
        
        // Si no hay tiers en actions, usar tier_discounts
        if (empty($tiers) && isset($actions['tier_discounts'])) {
            $tierDiscounts = $actions['tier_discounts'];
            $conditionTiers = $conditions['tiers'] ?? [];
            
            // Combinar condiciones con acciones
            $tiers = [];
            foreach ($conditionTiers as $index => $conditionTier) {
                if (isset($tierDiscounts[$index])) {
                    $tiers[] = array_merge($conditionTier, $tierDiscounts[$index]);
                }
            }
        }
        
        if (empty($tiers)) {
            return ['amount' => 0, 'applied_items' => []];
        }
        
        // Buscar el tier aplicable (mayor cantidad que califique)
        foreach ($tiers as $tier) {
            $minQuantity = $tier['min_quantity'] ?? 0;
            if ($totalQuantity >= $minQuantity) {
                $appliedTier = $tier;
            }
        }
        
        if ($appliedTier) {
            $discountType = $appliedTier['discount_type'] ?? 'percentage';
            $discountValue = $appliedTier['discount_value'] ?? 0;
            
            if ($discountType === 'percentage') {
                $discountAmount = $totalCartValue * ($discountValue / 100);
            } else if ($discountType === 'fixed') {
                $discountAmount = $discountValue;
            }
            
            // Aplicar límite máximo si existe
            if (isset($appliedTier['max_discount'])) {
                $discountAmount = min($discountAmount, $appliedTier['max_discount']);
            }
            
            // Preparar items aplicados
            foreach ($cartItems as $item) {
                $itemValue = ($item['price'] ?? $item['final_price'] ?? 0) * $item['quantity'];
                $itemDiscount = ($itemValue / $totalCartValue) * $discountAmount;
                
                $appliedItems[] = [
                    'item_id' => $item['item_id'],
                    'quantity' => $item['quantity'],
                    'discount' => $itemDiscount,
                    'tier_applied' => $appliedTier['min_quantity']
                ];
            }
        }
        
        return [
            'amount' => $discountAmount,
            'applied_items' => $appliedItems,
            'description' => $appliedTier ? 
                "Descuento escalonado (≥{$appliedTier['min_quantity']} productos): {$appliedTier['discount_value']}" . 
                ($appliedTier['discount_type'] === 'percentage' ? '%' : ' soles') : 
                'Sin descuento escalonado aplicable',
            'tier_applied' => $appliedTier
        ];
    }

    /**
     * Aplica descuento por paquete/bundle
     */
    private function applyBundleDiscount(DiscountRule $rule, Collection $cartItems, $actions, $conditions)
    {
        $discountAmount = 0;
        $appliedItems = [];
        $requiredProducts = $conditions['required_products'] ?? [];
        $minQuantityEach = $conditions['min_quantity_each'] ?? 1;
        
        if (empty($requiredProducts)) {
            return ['amount' => 0, 'applied_items' => []];
        }
        
        // Calcular cuántos bundles completos se pueden formar
        $maxBundles = PHP_INT_MAX;
        $bundleItems = [];
        
        foreach ($requiredProducts as $productId) {
            $cartItem = $cartItems->firstWhere('item_id', $productId);
            if (!$cartItem) {
                return ['amount' => 0, 'applied_items' => []]; // No se puede formar el bundle
            }
            
            $availableQuantity = $cartItem['quantity'];
            $possibleBundles = floor($availableQuantity / $minQuantityEach);
            $maxBundles = min($maxBundles, $possibleBundles);
            
            $bundleItems[] = [
                'item_id' => $productId,
                'item_name' => $cartItem['name'] ?? 'Producto',
                'price' => $cartItem['price'] ?? $cartItem['final_price'] ?? 0,
                'quantity_per_bundle' => $minQuantityEach,
                'available_quantity' => $availableQuantity
            ];
        }
        
        if ($maxBundles <= 0) {
            return ['amount' => 0, 'applied_items' => []];
        }
        
        // Calcular el valor total del bundle
        $bundleValue = 0;
        foreach ($bundleItems as $item) {
            $bundleValue += $item['price'] * $item['quantity_per_bundle'];
        }
        
        // Aplicar descuento
        if ($actions['discount_type'] === 'percentage') {
            $discountPerBundle = $bundleValue * ($actions['discount_value'] / 100);
        } else {
            $discountPerBundle = $actions['discount_value'];
        }
        
        $totalDiscount = $discountPerBundle * $maxBundles;
        
        // Preparar items aplicados
        foreach ($bundleItems as $item) {
            $appliedItems[] = [
                'item_id' => $item['item_id'],
                'item_name' => $item['item_name'],
                'quantity' => $item['quantity_per_bundle'] * $maxBundles,
                'discount' => ($discountPerBundle / count($bundleItems)) * $maxBundles,
                'bundle_count' => $maxBundles
            ];
        }
        
        return [
            'amount' => $totalDiscount,
            'applied_items' => $appliedItems,
            'description' => "Descuento por paquete ({$maxBundles} paquete" . ($maxBundles > 1 ? 's' : '') . "): {$actions['discount_value']}" . 
                           ($actions['discount_type'] === 'percentage' ? '%' : ' soles'),
            'bundle_count' => $maxBundles,
            'bundle_value' => $bundleValue
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
