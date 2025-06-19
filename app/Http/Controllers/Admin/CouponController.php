<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BasicController;
use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Category;
use App\Models\Item;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Routing\ResponseFactory;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CouponController extends BasicController
{
    public $reactView = 'Admin/Coupons';
    public $model = Coupon::class;

   

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
        return $model::query();    }

    public function save(Request $request): HttpResponse|ResponseFactory
    {
        $response = new \SoDe\Extend\Response();
        
        try {
            $isUpdate = !empty($request->input('id'));
            $coupon = $isUpdate ? Coupon::findOrFail($request->input('id')) : new Coupon();

            $validated = $request->validate([
                'code' => $isUpdate 
                    ? 'required|string|max:50|unique:coupons,code,' . $coupon->id
                    : 'required|string|max:50|unique:coupons,code',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'type' => 'required|in:percentage,fixed',
                'value' => 'required|numeric|min:0',
                'minimum_amount' => 'nullable|numeric|min:0',
                'usage_limit' => 'nullable|integer|min:1',
                'usage_limit_per_user' => 'required|integer|min:1',
                'starts_at' => 'required|date',
                'expires_at' => 'required|date|after:starts_at',
                'maximum_discount' => 'nullable|numeric|min:0',
                'first_purchase_only' => 'boolean',
                'applicable_categories' => 'nullable|array',
                'applicable_categories.*' => 'exists:categories,id',
                'applicable_products' => 'nullable|array',
                'applicable_products.*' => 'exists:items,id',
            ]);

            // Validaciones adicionales
            if ($validated['type'] === 'percentage' && $validated['value'] > 100) {
                $response->message = 'El porcentaje no puede ser mayor a 100%';
                $response->status = 422;
                return \response($response->toArray(), $response->status);
            }

            // Convertir fechas
            $validated['starts_at'] = Carbon::parse($validated['starts_at']);
            $validated['expires_at'] = Carbon::parse($validated['expires_at']);
            $validated['code'] = strtoupper($validated['code']);
            $validated['first_purchase_only'] = $request->boolean('first_purchase_only');

            if ($isUpdate) {
                $coupon->update($validated);
                $response->message = 'Cupón actualizado exitosamente';
            } else {
                $coupon = Coupon::create($validated);
                $response->message = 'Cupón creado exitosamente';
            }

            $response->data = $coupon;
            
        } catch (\Exception $e) {
            $response->message = $e->getMessage();
            $response->status = 422;
        }        return \response($response->toArray(), $response->status);
    }






    public function validateCoupon(Request $request): HttpResponse|ResponseFactory
    {
        $response = new \SoDe\Extend\Response();
        
        try {
            $request->validate([
                'code' => 'required|string',
                'cart_total' => 'nullable|numeric|min:0',
                'category_ids' => 'nullable|array',
                'product_ids' => 'nullable|array',
            ]);

            $coupon = Coupon::where('code', strtoupper($request->code))->first();

            if (!$coupon) {
                $response->data = [
                    'valid' => false,
                    'message' => 'Cupón no encontrado'
                ];
                return \response($response->toArray(), $response->status);
            }

            $validation = $coupon->canBeUsedBy(
                auth()->id(),
                $request->get('cart_total', 0),
                $request->get('category_ids', []),
                $request->get('product_ids', [])
            );

            if ($validation['valid']) {
                $discount = $coupon->calculateDiscount($request->get('cart_total', 0));
                $response->data = [
                    'valid' => true,
                    'message' => $validation['message'],
                    'coupon' => $coupon,
                    'discount' => $discount
                ];
            } else {
                $response->data = $validation;
            }
            
        } catch (\Exception $e) {
            $response->message = $e->getMessage();
            $response->status = 422;
        }        return \response($response->toArray(), $response->status);
    }

    public function generateCode(): HttpResponse|ResponseFactory
    {
        $response = new \SoDe\Extend\Response();
        
        try {
            $code = $this->generateCouponCode();
            $response->data = ['code' => $code];
            
        } catch (\Exception $e) {
            dump($e->getMessage());
            $response->message = $e->getMessage();
            $response->status = 422;
        }

        return \response($response->toArray(), $response->status);
    }

    private function generateCouponCode($length = 8)
    {
        do {
            $code = strtoupper(Str::random($length));
        } while (Coupon::where('code', $code)->exists());

        return $code;
    }

    
}
