<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BasicController;
use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Category;
use App\Models\Item;
use App\Models\User;
use Illuminate\Http\Request;
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
    }    public function validateCoupon(Request $request)
    {
        try {
            $request->validate([
                'code' => 'required|string',
                'cart_total' => 'nullable|numeric|min:0',
                'category_ids' => 'nullable|array',
                'product_ids' => 'nullable|array',
            ]);

            $coupon = Coupon::where('code', strtoupper($request->code))->first();

            if (!$coupon) {
                return response()->json([
                    'status' => 422,
                    'message' => 'Cupón no encontrado',
                    'data' => [
                        'valid' => false,
                        'message' => 'Cupón no encontrado'
                    ]
                ], 422);
            }

            $validation = $coupon->canBeUsedBy(
                auth()->id(),
                $request->get('cart_total', 0),
                $request->get('category_ids', []),
                $request->get('product_ids', [])
            );

            if ($validation['valid']) {
                $discount = $coupon->calculateDiscount($request->get('cart_total', 0));
                return response()->json([
                    'status' => 200,
                    'message' => 'Cupón válido',
                    'data' => [
                        'valid' => true,
                        'message' => $validation['message'],
                        'coupon' => $coupon,
                        'discount' => $discount
                    ]
                ], 200);
            } else {
                return response()->json([
                    'status' => 422,
                    'message' => $validation['message'],
                    'data' => $validation
                ], 422);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 422,
                'message' => 'Datos de entrada inválidos',
                'data' => [
                    'valid' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $e->errors()
                ]
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => 'Error interno del servidor',
                'data' => [
                    'valid' => false,
                    'message' => $e->getMessage()
                ]
            ], 500);
        }
    }
      public function generateCode()
    {
        try {
            $code = $this->generateCouponCode();
            
            return response()->json([
                'status' => 200,
                'message' => 'Código generado exitosamente',
                'data' => ['code' => $code]
            ], 200);
            
        } catch (\Exception $e) {            
            return response()->json([
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
