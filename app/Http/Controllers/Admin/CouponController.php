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
        return $model::query();
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
        }

        return \response($response->toArray(), $response->status);
    }    
    
      public function generateCode(): HttpResponse|ResponseFactory
    {
        try {
            $code = $this->generateCouponCode();
            
            return \response([
                'status' => 200,
                'message' => 'Código generado exitosamente',
                'data' => ['code' => $code]
            ], 200);
            
        } catch (\Exception $e) {            
            return \response([
                'status' => 422,
                'message' => $e->getMessage(),
                'data' => null
            ], 422);
        }
    }

    private function generateCouponCode($length = 8)
    {
        do {
            $code = strtoupper(Str::random($length));
        } while (Coupon::where('code', $code)->exists());

        return $code;
    }
}
