<?php

namespace App\Http\Controllers;

use App\Http\Classes\EmailConfig;
use App\Jobs\SendSaleEmail;
use App\Jobs\SendSaleWhatsApp;
use App\Models\Sale;
use App\Models\Bundle;
use App\Models\DeliveryPrice;
use App\Models\Item;
use App\Models\Renewal;
use App\Models\SaleDetail;
use App\Models\User;
use App\Models\General;
use App\Notifications\PurchaseSummaryNotification;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use SoDe\Extend\JSON;
use SoDe\Extend\Trace;
use SoDe\Extend\Math;
use SoDe\Extend\Response;

class SaleController extends BasicController
{
    public $model = Sale::class;
    public $imageFields = ['payment_proof'];

    static function create(array $sale, array $details): array
    {
        try {
            $itemsJpa = Item::whereIn('id', array_map(fn($item) => $item['id'], $details))->get();

            $itemsJpa2Proccess = [];

            foreach ($details as $detail) {
                $itemJpa = clone $itemsJpa->firstWhere('id', $detail['id']);
                $itemJpa->final_price = $itemJpa->discount != 0
                    ? $itemJpa->discount
                    : $itemJpa->price;
                $itemJpa->quantity = $detail['quantity'];
                $itemJpa->colors = $detail['colors'];
                $itemJpa->user_formula_id = $detail['formula_id'];
                $itemsJpa2Proccess[] = $itemJpa;
            }

            $saleJpa = new Sale();

            // Sale info
            $saleJpa->code = Trace::getId();
            $saleJpa->user_formula_id = $sale['user_formula_id'];
            $saleJpa->user_id = Auth::check() ? Auth::user()->id : null;
            $saleJpa->name = $sale['name'];
            $saleJpa->lastname = $sale['lastname'];
            $saleJpa->email = $sale['email'];
            $saleJpa->phone = $sale['phone'];
            $saleJpa->status_id = 'f13fa605-72dd-4729-beaa-ee14c9bbc47b';
            $saleJpa->billing_type = $sale['billing_type'];
            $saleJpa->billing_number = $sale['billing_number'];

            // Address info
            $saleJpa->country = $sale['country'];
            $saleJpa->department = $sale['department'];
            $saleJpa->province = $sale['province'];
            $saleJpa->district = $sale['district'];
            $saleJpa->zip_code = $sale['zip_code'];
            $saleJpa->address = $sale['address'];
            $saleJpa->number = $sale['number'];
            $saleJpa->reference = $sale['reference'];
            $saleJpa->comment = $sale['comment'];

            if (Auth::check()) {
                $userJpa = User::find(Auth::user()->id);
                $userJpa->phone = $sale['phone'];
                $userJpa->country = $sale['country'];
                $userJpa->department = $sale['department'];
                $userJpa->province = $sale['province'];
                $userJpa->district = $sale['district'];
                $userJpa->zip_code = $sale['zip_code'];
                $userJpa->address = $sale['address'];
                $userJpa->address_number = $sale['number'];
                $userJpa->address_reference = $sale['reference'];
                $userJpa->dni = $sale['document'];
                $userJpa->save();
            }

            // Sale Header
            $totalPrice = array_sum(array_map(
                fn($item) => $item['final_price'] * $item['quantity'],
                // $itemsJpa->toArray()
                $itemsJpa2Proccess
            ));

            // $totalItems = array_sum(array_map(fn($item) => $item['quantity'], $itemsJpa->toArray()));
            $totalItems = array_sum(array_map(fn($item) => $item['quantity'], $itemsJpa2Proccess));

            $bundleJpa = Bundle::where('status', true)
                ->whereRaw("
                    CASE 
                        WHEN comparator = '<' THEN ? < items_quantity
                        WHEN comparator = '>' THEN ? > items_quantity 
                        ELSE ? = items_quantity
                    END
                ", [$totalItems, $totalItems, $totalItems])
                ->orderBy('percentage', 'desc')
                ->first();

            $bundle = 0;
            if ($bundleJpa) {
                $saleJpa->bundle_id = $bundleJpa->id;
                $bundle = $totalPrice * $bundleJpa->percentage;
                $saleJpa->bundle_discount = $bundle;
            }

            $renewalJpa = Renewal::find($sale['renewal_id'] ?? null);
            $renewal = 0;
            if ($renewalJpa) {
                $saleJpa->renewal_id = $renewalJpa->id;
                $renewal = ($totalPrice - $bundle) * $renewalJpa->percentage;
                $saleJpa->renewal_discount = $renewal;
            }

            if (isset($sale['coupon']) && $sale['coupon']) {
                [$couponStatus, $couponJpa] = CouponController::verify(
                    $sale['coupon'],
                    $totalPrice,
                    $sale['email']
                );

                if (!$couponStatus) throw new Exception($couponJpa);

                $saleJpa->coupon_id = $couponJpa->id;
                if ($couponJpa->type == 'percentage') {
                    $saleJpa->coupon_discount = ($totalPrice - $bundle - $renewal) * ($couponJpa->amount / 100);
                } else {
                    $saleJpa->coupon_discount = $couponJpa->amount;
                }
            }

            $saleJpa->amount = Math::round($totalPrice * 10) / 10;
            $saleJpa->delivery = 0; // Agregar lógica si es que se tiene precio por envío
            $saleJpa->save();

            $detailsJpa = array();
            foreach ($itemsJpa2Proccess as $itemJpa) {
                $detailJpa = new SaleDetail();
                $detailJpa->sale_id = $saleJpa->id;
                $detailJpa->item_id = $itemJpa->id;
                $detailJpa->name = $itemJpa->name;
                $detailJpa->price = $itemJpa->final_price;
                $detailJpa->quantity = $itemJpa->quantity;
                $detailJpa->colors = $itemJpa->colors;
                $detailJpa->user_formula_id = $itemJpa->user_formula_id;
                $detailJpa->save();

                $detailsJpa[] = $detailJpa->toArray();
            }

            $saleToReturn = Sale::with(['renewal', 'details'])->find($saleJpa->id);

            return [true, $saleToReturn];
        } catch (\Throwable $th) {
            return [false, [
                'error' => $th->getMessage(),
                'file' => $th->getFile(),
                'line' => $th->getLine()
            ]];
        }
    }

    public function beforeSave(Request $request)
    {
        $body = $request->all();

        // Primero calculamos el total temporal para verificar el envío gratuito
        // Inicio de calculo de envio gratuito 
        $tempTotal = 0;
        $details = json_decode($request->details, true);
        $montocupon = 0;

        foreach ($details as $item) {
            $itemJpa = Item::find($item['id']);
            if ($itemJpa) {
                $tempTotal += $itemJpa->final_price * $item['quantity'];
            }
        }

        if ($request->coupon_id != 'null' && $request->coupon_discount > 0) {
            $montocupon = $request->coupon_discount ?? 0;
            $tempTotal -= $montocupon;
        } else {
            $body['coupon_id'] = null;
            $body['coupon_discount'] = 0;
        }

        $freeShippingThreshold = General::where('correlative', 'shipping_free')->first();
        $minFreeShipping = $freeShippingThreshold ? (float)$freeShippingThreshold->description : 0;
        $deliveryPrice = $request->delivery;

        if ($minFreeShipping > 0 && $tempTotal >= $minFreeShipping) {
            $deliveryPrice = 0;
        }
        // Fin de calculo de envio gratuito 

        $delivery = DeliveryPrice::query()
            ->where('ubigeo', $body['ubigeo'])
            ->first();

        //$body['delivery'] = $delivery?->price ?? 0;
        $body['delivery'] = $deliveryPrice ?? $delivery?->price;
        // $body['department'] = $delivery?->data['departamento'] ?? null;
        // $body['province'] = $delivery?->data['provincia'] ?? null;
        // $body['district'] = $delivery?->data['distrito'] ?? null;
        $body['ubigeo'] = $delivery?->ubigeo ?? null;
        $body['code'] = Trace::getId();
        // $body['status_id'] = 'f13fa605-72dd-4729-beaa-ee14c9bbc47b';
        // $body['status_id'] = 'e13a417d-a2f0-4f5f-93d8-462d57f13d3c';
        $body['status_id'] = 'bd60fc99-c0c0-463d-b738-1c72d7b085f5';
        $body['user_id'] = Auth::id();

        if (Auth::check()) {
            $userJpa = User::find(Auth::user()->id);
            $userJpa->phone = $request->phone;
            $userJpa->dni = $request->document;
            $userJpa->country = $request->country;
            $userJpa->department = $request->department;
            $userJpa->province = $request->province;
            $userJpa->district = $request->district;
            $userJpa->ubigeo = $request->ubigeo;
            $userJpa->address = $request->address;
            $userJpa->reference = $request->reference;
            $userJpa->number = $request->number;
            $userJpa->save();
        }

        return $body;
    }

    public function afterSave(Request $request, object $jpa, ?bool $isNew)
    {
        $totalPrice = 0;
        $details = JSON::parse($request->details);
        foreach ($details as $item) {
            $itemJpa = Item::find($item['id']);
            SaleDetail::create([
                'colors' => $itemJpa->color,
                'sale_id' => $jpa->id,
                'item_id' => $itemJpa->id,
                'name' => $itemJpa->name,
                'price' => $itemJpa->final_price,
                'quantity' => $item['quantity'],
                'image' => $itemJpa->image,
            ]);
            $totalPrice += $itemJpa->final_price * $item['quantity'];
        }

        if ($request->coupon_id != 'null' && $request->coupon_discount > 0) {
            $totalPrice -= $request->coupon_discount ?? 0;
        }

        $jpa->amount = $totalPrice;
        $jpa->save();

        $saleJpa = Sale::with('details')->find($jpa->id);
        $saleJpa->notify(new PurchaseSummaryNotification($saleJpa, $saleJpa->details));

        return $jpa;
    }

    public function notify(Request $request)
    {
        $response = Response::simpleTryCatch(function () use ($request) {
            $sale = Sale::where('code', $request->code)->first();
            if (!$request->code) throw new Exception('No existe la venta');
            // SendSaleWhatsApp::dispatchAfterResponse($sale, true, false);
            // SendSaleEmail::dispatchAfterResponse($sale, true, false);
        });
        return response($response->toArray(), $response->status);
    }
}
