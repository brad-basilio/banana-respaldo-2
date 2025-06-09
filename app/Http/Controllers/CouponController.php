<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Sale;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Routing\ResponseFactory;
use SoDe\Extend\Response;

class CouponController extends BasicController
{
    public $model = Coupon::class;

    static function verify($couponStr, $amount, $email)
    {
        $coupon = $couponStr;
        $coupon = Coupon::select()
            ->where('name', $coupon)
            ->where(function ($query) {
                $query->whereNull('date_begin')
                    ->orWhere('date_begin', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('date_end')
                    ->orWhere('date_end', '>=', now());
            })
            ->where('sale_amount', '<=', $amount)
            ->where(function ($query) {
                $query->whereNull('stock')
                    ->orWhere('stock', '>', 0);
            })
            ->where('status', true)
            ->first();
        if (!$coupon) return [false, 'Cupón inválido. Intente con uno distinto'];

        if ($coupon->one_time_use) {
            $sale = Sale::where('email', $email)->first();
            if ($sale) return [false, 'Este cupón no puede ser usado mas de una vez'];
        }

        return [true, $coupon];
    }

    public function save(Request $request): HttpResponse|ResponseFactory
    {
        $response = Response::simpleTryCatch(function () use ($request) {
            [$status, $coupon] = self::verify(
                $request->input('coupon'),
                $request->input('amount'),
                $request->input('email')
            );
            if (!$status) throw new Exception($coupon);
            return $coupon;
        });
        return \response($response->toArray(), $response->status);
    }

    public function isFirst(Request $request)
    {
        $response = Response::simpleTryCatch(function () use ($request) {
            $email = $request->input('email');
            $saleExists = Sale::where('email', $email)->exists();
            if ($saleExists) throw new Exception('Ya existe una venta con este correo');
            $coupon = Coupon::find('3731a0e9-921f-4b25-8bdb-f887cba960e5');
            if (!$coupon) throw new Exception('El cupón de primera compra ha sido removido');
            return $coupon;
        });
        return response($response->toArray(), $response->status);
    }
}
