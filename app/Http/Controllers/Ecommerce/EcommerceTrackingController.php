<?php

namespace App\Http\Controllers\Ecommerce;

use App\Http\Controllers\Controller;
use App\Helpers\PixelHelper;
use App\Models\Item;
use App\Models\Sale;
use Illuminate\Http\Request;

class EcommerceTrackingController extends Controller
{
    /**
     * Track when user views a product
     */
    public function trackProductView($productId)
    {
        $product = Item::find($productId);
        if (!$product) return;

        $trackingData = [
            'content_name' => $product->name,
            'content_ids' => [$product->id],
            'content_type' => 'product',
            'value' => $product->price,
            'currency' => 'PEN'
        ];

        return view('ecommerce.product-tracking', [
            'product' => $product,
            'trackingData' => $trackingData
        ]);
    }

    /**
     * Track when user adds product to cart
     */
    public function trackAddToCart(Request $request)
    {
        $productId = $request->input('product_id');
        $quantity = $request->input('quantity', 1);
        
        $product = Item::find($productId);
        if (!$product) return response()->json(['error' => 'Product not found'], 404);

        $scripts = $this->generateAddToCartScripts($product, $quantity);
        
        return response()->json([
            'success' => true,
            'tracking_scripts' => $scripts
        ]);
    }

    /**
     * Track when user starts checkout process
     */
    public function trackInitiateCheckout(Request $request)
    {
        $cartItems = $request->input('cart_items', []);
        $totalValue = array_sum(array_column($cartItems, 'subtotal'));
        
        $scripts = $this->generateInitiateCheckoutScripts($cartItems, $totalValue);
        
        return response()->json([
            'success' => true,
            'tracking_scripts' => $scripts
        ]);
    }

    /**
     * Track successful purchase
     */
    public function trackPurchase($orderId)
    {
        $order = Sale::with('details.item')->find($orderId);
        if (!$order) return '';

        $orderData = [
            'order_id' => $order->id,
            'total' => $order->total,
            'product_ids' => $order->details->pluck('item_id')->toArray(),
            'user_id' => $order->customer_id,
            'items' => $order->details->map(function($detail) {
                return [
                    'item_id' => $detail->item_id,
                    'item_name' => $detail->item->name ?? '',
                    'price' => $detail->price,
                    'quantity' => $detail->quantity
                ];
            })->toArray()
        ];

        return PixelHelper::trackPurchase($orderData);
    }

    /**
     * Generate Add to Cart tracking scripts
     */
    private function generateAddToCartScripts($product, $quantity)
    {
        $generals = \App\Models\General::whereIn('correlative', [
            'facebook_pixel_id',
            'google_analytics_id',
            'tiktok_pixel_id'
        ])->get()->keyBy('correlative');

        $scripts = '';

        // Facebook Pixel AddToCart
        if ($fbPixelId = $generals->get('facebook_pixel_id')?->description) {
            $scripts .= "
<script>
fbq('track', 'AddToCart', {
    content_name: '{$product->name}',
    content_ids: ['{$product->id}'],
    content_type: 'product',
    value: {$product->price},
    currency: 'PEN'
});
</script>";
        }        // Google Analytics Enhanced Ecommerce
        if ($gaId = $generals->get('google_analytics_id')?->description) {
            $categoryName = $product->category->name ?? 'Sin categoría';
            $scripts .= "
<script>
gtag('event', 'add_to_cart', {
    currency: 'PEN',
    value: {$product->price},
    items: [{
        item_id: '{$product->id}',
        item_name: '{$product->name}',
        category: '{$categoryName}',
        quantity: {$quantity},
        price: {$product->price}
    }]
});
</script>";
        }

        // TikTok Pixel AddToCart
        if ($tiktokId = $generals->get('tiktok_pixel_id')?->description) {
            $scripts .= "
<script>
ttq.track('AddToCart', {
    content_id: '{$product->id}',
    content_type: 'product',
    content_name: '{$product->name}',
    value: {$product->price},
    currency: 'PEN'
});
</script>";
        }

        return $scripts;
    }

    /**
     * Generate Initiate Checkout tracking scripts
     */
    private function generateInitiateCheckoutScripts($cartItems, $totalValue)
    {
        $generals = \App\Models\General::whereIn('correlative', [
            'facebook_pixel_id',
            'google_analytics_id',
            'tiktok_pixel_id'
        ])->get()->keyBy('correlative');

        $scripts = '';

        // Facebook Pixel InitiateCheckout
        if ($fbPixelId = $generals->get('facebook_pixel_id')?->description) {
            $contentIds = array_column($cartItems, 'product_id');
            $scripts .= "
<script>
fbq('track', 'InitiateCheckout', {
    content_ids: [" . implode(',', array_map(fn($id) => "'$id'", $contentIds)) . "],
    content_type: 'product',
    value: {$totalValue},
    currency: 'PEN',
    num_items: " . count($cartItems) . "
});
</script>";
        }

        // Google Analytics Begin Checkout
        if ($gaId = $generals->get('google_analytics_id')?->description) {
            $items = array_map(function($item) {
                return [
                    'item_id' => $item['product_id'],
                    'item_name' => $item['name'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price']
                ];
            }, $cartItems);

            $scripts .= "
<script>
gtag('event', 'begin_checkout', {
    currency: 'PEN',
    value: {$totalValue},
    items: " . json_encode($items) . "
});
</script>";
        }

        // TikTok Pixel InitiateCheckout
        if ($tiktokId = $generals->get('tiktok_pixel_id')?->description) {
            $scripts .= "
<script>
ttq.track('InitiateCheckout', {
    value: {$totalValue},
    currency: 'PEN',
    content_type: 'product'
});
</script>";
        }

        return $scripts;
    }
}
