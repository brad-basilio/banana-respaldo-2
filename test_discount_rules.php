<?php

require 'vendor/autoload.php';

use App\Services\DiscountRuleService;
use App\Models\DiscountRule;
use Illuminate\Foundation\Application;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Testing Discount Rules Module ===\n\n";

// Test 1: Check if models work
echo "1. Testing DiscountRule model:\n";
$rules = DiscountRule::all();
echo "   Found {$rules->count()} discount rules\n";
foreach ($rules as $rule) {
    echo "   - {$rule->name} ({$rule->type}) - " . ($rule->is_active ? 'Active' : 'Inactive') . "\n";
}

// Test 2: Test service
echo "\n2. Testing DiscountRuleService:\n";
$service = new DiscountRuleService();

// Mock cart items
$cartItems = [
    ['item_id' => 1, 'quantity' => 2, 'price' => 25.00, 'name' => 'Product 1'],
    ['item_id' => 2, 'quantity' => 1, 'price' => 50.00, 'name' => 'Product 2']
];

$totalAmount = 100.00;
$customerEmail = 'test@example.com';

echo "   Testing cart evaluation with {$totalAmount} total amount\n";

$result = $service->evaluateCart($cartItems, $customerEmail, $totalAmount);

echo "   Cart evaluation results:\n";
echo "   - Applied discounts: " . count($result['applied_discounts']) . "\n";
echo "   - Total discount: $" . number_format($result['total_discount'], 2) . "\n";

if (!empty($result['applied_discounts'])) {
    foreach ($result['applied_discounts'] as $discount) {
        echo "     * {$discount['rule_name']}: $" . number_format($discount['discount_amount'], 2) . "\n";
    }
}

echo "\n=== Test Complete ===\n";
