<?php

namespace App\Http\Controllers;

use App\Jobs\SendSaleEmail;
use App\Jobs\SendSaleWhatsApp;
use App\Models\CulqiCharge;
use App\Models\CulqiSubscription;
use App\Models\Sale;
use App\Models\Subscription;
use App\Models\User;
use Culqi\Culqi;
use Error;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use SoDe\Extend\Crypto;
use SoDe\Extend\Fetch;
use SoDe\Extend\JSON;
use SoDe\Extend\Math;
use SoDe\Extend\Response;
use Illuminate\Support\Str;
use SoDe\Extend\Text;
use SoDe\Extend\Trace;

class CulqiController extends Controller
{
  private $culqi = null;
  private $url = null;

  public function __construct()
  {
    $this->culqi = new Culqi(['api_key' => env('CULQI_PRIVATE_KEY')]);
    $this->url = env('CULQI_API');
  }

  public function order(Request $request)
  {
    $response = Response::simpleTryCatch(function () use ($request) {

      [$status, $sale] = SaleController::create($request->sale, $request->details);

      if (!$status) throw new Exception($sale['error']);

      // if ($sale->renewal_id) $this->createPlan($sale);

      $amount = $sale['amount'];

      if (isset($sale['delivery'])) $amount += $sale['delivery'];
      if (isset($sale['bundle_discount'])) $amount -= $sale['bundle_discount'];
      if (isset($sale['renewal_discount'])) $amount -= $sale['renewal_discount'];
      if (isset($sale['coupon_discount'])) $amount -= $sale['coupon_discount'];
      if (isset($sale['promotion_discount'])) $amount -= $sale['promotion_discount'];

      $amount = Math::round($amount * 10) / 10;

      $config = [
        "amount" => Math::ceil(($amount * 100)),
        "currency_code" => 'PEN',
        "description" => "Compra en " . env('APP_NAME'),
        "order_number" => '#' . env('APP_CORRELATIVE') . '-' . $sale['code'],
        "client_details" => array(
          "first_name" =>  $sale['name'],
          "last_name" => $sale['lastname'],
          "email" => $sale['email'],
          "phone_number" => $sale['phone'],
        ),
        "expiration_date" => time() + (24 * 60 * 60), // produccion
        // "expiration_date" => time() + (60), // desarrollo
        "confirm" => false
      ];

      $order = $this->culqi->Orders->create($config);

      if (gettype($order) == 'string') {
        $res = JSON::parse((string) $order);
        Sale::where('id', $sale['id'])->delete();
        throw new Exception($res['user_message']);
      }
      return \array_merge((array) $order, [
        'amount' => $amount,
        'delivery' => $sale['delivery'],
      ]);
    });

    return response($response->toArray(), $response->status);
  }

  public function token(Request $request)
  {
    $order_number = \str_replace('#' . env('APP_CORRELATIVE') . '-', '', $request->order);
    $sale = Sale::with(['renewal'])->where('code', $order_number)->first();

    $response = Response::simpleTryCatch(function () use ($request, $sale) {

      if ($sale->renewal_id) {
        $cq_cus_id = $this->createClient();
        $cq_crd_id = $this->createCard($cq_cus_id, $request->token['id']);
        $cq_pln_id = $this->createPlan($sale);
        $cq_sxn_id = $this->subscribe($cq_crd_id, $cq_pln_id, $sale);

        CulqiSubscription::create([
          'renewal_id' => $sale->renewal_id,
          'user_id' => Auth::user()->id,
          'cq_crd_id' => $cq_crd_id,
          'cq_pln_id' => $cq_pln_id,
          'cq_sxn_id' => $cq_sxn_id,
          'sale_id' => $sale->id,
          'already_paid' => false,
          'current_payment' => 0,
          'total_payments' => $sale->renewal->months,
        ]);
      } else {
        $this->createCharge($request->token, $sale);
        $sale->status_id = '312f9a91-d3f2-4672-a6bf-678967616cac';
        $sale->save();

        try {
          Subscription::updateOrCreate(['description' => $sale->email], ['made_order' => true]);
        } catch (\Throwable $th) {
        }

        SendSaleWhatsApp::dispatchAfterResponse($sale);
        SendSaleEmail::dispatchAfterResponse($sale);
      }
    }, function () use ($sale) {
      $sale->update(['status_id' => 'd3a77651-15df-4fdc-a3db-91d6a8f4247c']);
    });
    return response($response->toArray(), $response->status);
  }

  private function createCharge($token, $sale): void
  {
    // Validate required sale data
    if (
      !$sale->amount || !$sale->code || !$sale->email || !$sale->address ||
      !$sale->name || !$sale->lastname || !$sale->phone
    ) {
      throw new Exception('Missing required sale information');
    }

    // Validate token data
    if (!isset($token['id'])) {
      throw new Exception('Invalid token information');
    }

    $amount = $sale->amount;
    if (isset($sale->delivery)) $amount += $sale->delivery;
    if (isset($sale->bundle_discount)) $amount -= $sale->bundle_discount;
    if (isset($sale->renewal_discount)) $amount -= $sale->renewal_discount;
    if (isset($sale->coupon_discount)) $amount -= $sale->coupon_discount;

    // Validate final amount
    if ($amount <= 0) {
      throw new Exception('Invalid sale amount');
    }

    $amount = Math::round($amount * 10) / 10;

    $config = [
      "amount" => Math::ceil(($amount * 100)),
      "capture" => true,
      "currency_code" => "PEN",
      "order_number" => '#' . env('APP_CORRELATIVE') . '-' . $sale->code,
      "description" => "Compra en " . env('APP_NAME'),
      "email" => $token['email'] ?? $sale->email,
      "installments" => 0,
      "antifraud_details" => [
        "address" => $sale->address,
        "address_city" => $sale->district ?? 'Lima',
        "country_code" => "PE",
        "first_name" => $sale->name,
        "last_name" => $sale->lastname,
        "phone_number" => $sale->phone,
      ],
      "source_id" => $token['id']
    ];

    $charge = $this->culqi->Charges->create($config);

    if (gettype($charge) == 'string') {
      $res = JSON::parse((string) $charge);
      throw new Exception($res['user_message']);
    }

    // Validate charge response
    if (!isset($charge->id)) {
      throw new Exception('Failed to create charge');
    }
  }

  private function createClient(): string
  {
    $user = Auth::user();

    $resGet = new Fetch($this->url . '/customers?email=' . $user->email, [
      'headers' => ['Authorization' => 'Bearer ' . \env('CULQI_PRIVATE_KEY')]
    ]);

    if (!$resGet->ok) throw new Exception('Ocurrio un error al consultar clientes en Culqi');

    $dataGet = $resGet->json();

    if (count($dataGet['data']) > 0) {
      $cq_cus_id = $dataGet['data'][0]['id'];
      User::where('id', $user->id)->update(['cq_cus_id' => $cq_cus_id]);
      return $cq_cus_id;
    }

    $res = new Fetch($this->url . '/customers', [
      'method' => 'POST',
      'headers' => [
        'Content-Type' => 'application/json',
        'Authorization' => 'Bearer ' . \env('CULQI_PRIVATE_KEY')
      ],
      'body' => [
        "first_name" => $user->name,
        "last_name" => $user->lastname,
        "email" => $user->email,
        "address" => $user->address . ' ' . $user->address_number,
        "address_city" => $user->district ?? $user->province,
        "country_code" => "PE",
        "phone_number" => $user->phone
      ]
    ]);

    if (!$res->ok) throw new Exception('Ocurrio un error al crear el cliente en Culqi');
    $data = $res->json();
    User::where('id', $user->id)
      ->update(['cq_cus_id' => $data['id']]);
    return $data['id'];
  }

  private function createCard($cq_cus_id, $token): string
  {
    $res = new Fetch($this->url . '/cards', [
      'method' => 'POST',
      'headers' => [
        'Content-Type' => 'application/json',
        'Authorization' => 'Bearer ' . \env('CULQI_PRIVATE_KEY')
      ],
      'body' => [
        "customer_id" => $cq_cus_id,
        "token_id" => $token,
        "validate" => true,
        "metadata" => [
          "marca_tarjeta" => "VISA"
        ]
      ]
    ]);
    if (!$res->ok) throw new Exception('Ocurrio un error al crear la tarjeta en Culqi');
    $data = $res->json();
    return $data['id'];
  }

  private function createPlan(Sale $sale)
  {
    if (!$sale->renewal_id) throw new Exception('No hay una suscripción vinculada a la venta');

    $name = Text::keep($sale->renewal->name
      . ' - ' . explode(' ', $sale->name)[0]
      . ' ' . explode(' ', $sale->lastname)[0]
      . ' ' . Crypto::short(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789- ');
    $normalAmount = $sale->amount - $sale->bundle_discount - $sale->renewal_discount;

    $amount = $normalAmount / $sale->renewal->months;

    $discount = $normalAmount - $sale->coupon_discount;

    $body = [
      "name" => $name,
      "short_name" => Str::slug($name),
      "description" => 'Plan ' . $name,
      "amount" => Math::ceil($amount * 100),
      "currency" => "PEN",
      "interval_unit_time" => 3,
      "interval_count" => 0
    ];

    if ($amount != $discount) {
      $body["initial_cycles"] = [
        "count" => 1, // Solo primer mes
        "has_initial_charge" => $discount != 0,
        "amount" => Math::ceil($discount * 100),
        "interval_unit_time" => 3
      ];
    } else {
      $body["initial_cycles"] = [
        "count" => 0, // Solo primer mes
        "has_initial_charge" => false,
        "amount" => 0,
        "interval_unit_time" => 3
      ];
    }

    $res = new Fetch($this->url . '/recurrent/plans/create', [
      'method' => 'POST',
      'headers' => [
        'Content-Type' => 'application/json',
        'Authorization' => 'Bearer ' . \env('CULQI_PRIVATE_KEY')
      ],
      'body' => $body
    ]);

    if (!$res->ok) throw new Exception('Ocurrio un error al crear el plan en Culqi');

    $data = $res->json();

    return $data['id'];
  }

  private function subscribe($cq_crd_id, $cq_pln_id, $sale)
  {
    $res = new Fetch($this->url . '/recurrent/subscriptions/create', [
      'method' => 'POST',
      'headers' => [
        'Content-Type' => 'application/json',
        'Authorization' => 'Bearer ' . \env('CULQI_PRIVATE_KEY')
      ],
      'body' => [
        "card_id" => $cq_crd_id,
        "plan_id" => $cq_pln_id,
        "tyc" => true,
        "metadata" => [
          'user_id' => Auth::user()->id,
          'sale_id' => $sale->id
        ]
      ]
    ]);

    if (!$res->ok) throw new Exception('Ocurrio un error al crear la subscripcion');
    $data = $res->json();
    return $data['id'];
  }

  public function webhook(Request $request)
  {
    $response = Response::simpleTryCatch(function () use ($request) {
      $data = JSON::parse($request->data);
      switch ($request->type) {
        case 'subscription.charge.succeeded':
          return $this->processSubscriptionCharge($request, $data);
          break;
        default:
          return $this->processOrder($request, $data);
          break;
      }
    });

    return response($response->toArray(), $response->status);
  }

  public function processSubscriptionCharge(Request $request, array $data)
  {
    $culqiSubscription = CulqiSubscription::where('cq_sxn_id', $data['subsId'])->first();

    if (!$culqiSubscription) throw new Exception('Esta subscripcion no esta registrada en ' . env('APP_NAME'));

    $cChrRes = new Fetch($this->url . '/charges/' . $data['chargeId'], [
      'headers' => [
        'Authorization' => 'Bearer ' . \env('CULQI_PRIVATE_KEY')
      ]
    ]);

    if (!$cChrRes->ok) throw new Exception('El cargo que intentas procesar no existe en Culqi');

    $chargeExists = CulqiCharge::where('culqi_id', $data['chargeId'])->exists();

    if ($chargeExists) return;

    $sale = Sale::with(['details'])->find($culqiSubscription->sale_id);

    if (!$sale) throw new Exception('La venta asociada a la suscripción no existe.');

    if (!$culqiSubscription->already_paid) {
      DB::beginTransaction();
      try {
        $sale->update(['status_id' => '312f9a91-d3f2-4672-a6bf-678967616cac']);
        $culqiSubscription->update(['already_paid' => true]);

        Subscription::updateOrCreate(['description' => $sale->email], ['made_order' => true]);

        DB::commit();

        SendSaleWhatsApp::dispatchAfterResponse($sale);
        SendSaleEmail::dispatchAfterResponse($sale);
      } catch (\Throwable $th) {
        DB::rollBack();
        throw $th;
      }
    } else {
      DB::beginTransaction();
      try {
        $cChrData = $cChrRes->json();

        $chargeJpa = new CulqiCharge();
        $chargeJpa->culqi_id = $data['chargeId'];
        $chargeJpa->amount = $cChrData['amount'] / 100;
        $chargeJpa->culqi_subscription_id = $culqiSubscription->id;
        $chargeJpa->save();

        $chargesCount = CulqiCharge::where('culqi_subscription_id', $culqiSubscription->id)
          ->whereNull('sale_id')
          ->count();

        if ($chargesCount < $culqiSubscription->total_payments) {
          DB::commit();
          return;
        }

        $newSale = $sale->replicate();
        $newSale->code = Trace::getId();
        $newSale->status_id = '312f9a91-d3f2-4672-a6bf-678967616cac';
        $newSale->coupon_id = null;
        $newSale->coupon_discount = 0;
        $newSale->save();

        CulqiCharge::where('culqi_subscription_id', $culqiSubscription->id)
          ->whereNull('sale_id')
          ->update(['sale_id' => $newSale->id]);

        $sale->details->each(function ($detail) use ($newSale) {
          $newSale->details()->create($detail->toArray());
        });

        Subscription::updateOrCreate(['description' => $newSale->email], ['made_order' => true]);

        DB::commit();

        SendSaleWhatsApp::dispatchAfterResponse($newSale);
        SendSaleEmail::dispatchAfterResponse($newSale);
      } catch (\Throwable $th) {
        DB::rollBack();
        throw $th;
      }
    }
  }

  public function processOrder(Request $request, array $data)
  {
    $res = new Fetch($this->url . '/orders/' . $data['id'], [
      'headers' => [
        'Authorization' => 'Bearer ' . \env('CULQI_PRIVATE_KEY')
      ]
    ]);

    if (!$res->ok) throw new Exception("Ocurrio un error al verificar la orden de pago");

    $data = $res->json();

    $code = str_replace('#' . env('APP_CORRELATIVE') . '-', '', $data['order_number']);

    if ($data['state'] == 'expired') {
      Sale::where('code', $code)
        ->where('status_id', 'f13fa605-72dd-4729-beaa-ee14c9bbc47b')
        ->update(['status_id' => 'd3a77651-15df-4fdc-a3db-91d6a8f4247c']);
      return;
    }

    if ($data['state'] != 'paid') return;

    $sale = Sale::where('code', $code)->first();
    $sale->status_id = '312f9a91-d3f2-4672-a6bf-678967616cac';
    $sale->save();

    try {
      Subscription::updateOrCreate(['description' => $sale->email], ['made_order' => true]);
    } catch (\Throwable $th) {
    }

    SendSaleWhatsApp::dispatchAfterResponse($sale);
    SendSaleEmail::dispatchAfterResponse($sale);
  }
}
