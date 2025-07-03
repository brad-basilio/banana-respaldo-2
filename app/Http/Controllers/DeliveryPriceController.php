<?php

namespace App\Http\Controllers;

use App\Http\Classes\EmailConfig;
use App\Http\Services\ReCaptchaService;
use App\Models\Constant;
use App\Models\DeliveryPrice;
use App\Models\ModelHasRoles;
use App\Models\User;
use App\Models\Person;
use App\Models\PreUser;
use App\Models\SpecialtiesByUser;
use App\Models\Specialty;
use App\Models\TypeDelivery;
use App\Providers\RouteServiceProvider;
use Exception;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\File;
use Inertia\Inertia;
use SoDe\Extend\Crypto;
use SoDe\Extend\JSON;
use SoDe\Extend\Response;
use SoDe\Extend\Trace;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Str;

class DeliveryPriceController extends BasicController
{


    public function getDeliveryPrice(Request $request): HttpResponse|ResponseFactory|RedirectResponse
    {
        $response = Response::simpleTryCatch(function (Response $response) use ($request) {


            $validated = $request->validate([
                'ubigeo' => 'required|string', // Asumiendo nuevo parámetro desde el front
                'cart_total' => 'nullable|numeric' // Total del carrito para calcular envío gratuito
            ]);

            $ubigeo = $validated['ubigeo'];
            $cartTotal = $validated['cart_total'] ?? 0;



            if (!$ubigeo) {
                $response->status = 400;
                $response->message = 'Ubigeo no encontrado';
            
                return;
            }
  
            // 1. Buscar el precio de envío
            $deliveryPrice = DeliveryPrice::with(['type'])
                ->where('ubigeo', $ubigeo)
                ->firstOrFail();

            // 2. Valida Cobertura
            if (!$deliveryPrice) {
                $response->status = 400;
                $response->message = 'No hay cobertura para esta ubicación';
              //dump($deliveryPrice);
                return;
            }
          //  dump($deliveryPrice);
            
            // Obtener el mínimo para envío gratuito desde generals
            $freeShippingThreshold = \App\Models\General::where('correlative', 'shipping_free')->first();
            $minFreeShipping = $freeShippingThreshold ? floatval($freeShippingThreshold->description) : 0;
            
            // Debug logs
            Log::info('DeliveryPrice Debug:', [
                'ubigeo' => $ubigeo,
                'cart_total' => $cartTotal,
                'free_shipping_record' => $freeShippingThreshold,
                'min_free_shipping' => $minFreeShipping,
                'delivery_price_is_free' => $deliveryPrice->is_free
            ]);
            
            // Verificar si aplica envío gratuito por monto del carrito
            $qualifiesForFreeShipping = $minFreeShipping > 0 && $cartTotal >= $minFreeShipping;
            
            // Debug logs adicionales
            Log::info('Free Shipping Validation:', [
                'min_free_shipping' => $minFreeShipping,
                'cart_total' => $cartTotal,
                'qualifies_for_free_shipping' => $qualifiesForFreeShipping,
                'comparison' => $cartTotal . ' >= ' . $minFreeShipping . ' = ' . ($cartTotal >= $minFreeShipping ? 'true' : 'false')
            ]);
            
            // 3. Estructurar la respuesta
            $result = [
                'is_free' => $deliveryPrice->is_free,
                'is_agency'=>$deliveryPrice->is_agency,
                'qualifies_free_shipping' => $qualifiesForFreeShipping,
                'free_shipping_threshold' => $minFreeShipping,
                'cart_total' => $cartTotal,
                'standard' => [
                    'price' => $deliveryPrice->price, // Siempre usar el precio base inicialmente
                    'description' => $deliveryPrice->type->description ?? 'Entrega estándar',
                    'type' => $deliveryPrice->type->name,
                    'characteristics' => $deliveryPrice->type->characteristics,
                ]
            ];

            // 4. Para ubicaciones con is_free=true, lógica condicional
            if ($deliveryPrice->is_free) {
                $expressType = TypeDelivery::where('slug', 'delivery-express')->first();
                
                if ($qualifiesForFreeShipping) {
                    // Si califica por monto: Gratis + Express
                    $result['standard']['price'] = 0;
                    $result['standard']['description'] = 'Envío gratuito por compra mayor a S/ ' . $minFreeShipping;
                    
                    Log::info('Setting FREE shipping - qualifies for free shipping', [
                        'cart_total' => $cartTotal,
                        'threshold' => $minFreeShipping,
                        'standard_price' => 0
                    ]);
                } else {
                    // Si no califica por monto: Standard (con precio normal) + Express
                    $fallbackPrice = $deliveryPrice->price;
                    
                    // Si el precio base es 0 pero tiene express_price, usar la mitad del express como fallback
                    if ($fallbackPrice == 0 && $deliveryPrice->express_price > 0) {
                        $fallbackPrice = round($deliveryPrice->express_price * 0.6, 2); // 60% del express
                        Log::info('Using fallback price calculation', [
                            'original_price' => $deliveryPrice->price,
                            'express_price' => $deliveryPrice->express_price,
                            'calculated_fallback' => $fallbackPrice
                        ]);
                    }
                    
                    // Usar el tipo "Delivery Normal" cuando no califica para envío gratis
                    $normalDeliveryType = TypeDelivery::where('slug', 'delivery-normal')->first();
                    
                    $result['standard']['price'] = $fallbackPrice;
                    if ($normalDeliveryType) {
                        $result['standard']['description'] = $normalDeliveryType->description;
                        $result['standard']['type'] = $normalDeliveryType->name;
                        $result['standard']['characteristics'] = $normalDeliveryType->characteristics;
                    }
                    
                    Log::info('Setting PAID shipping - does NOT qualify for free shipping', [
                        'cart_total' => $cartTotal,
                        'threshold' => $minFreeShipping,
                        'original_price' => $deliveryPrice->price,
                        'final_price' => $fallbackPrice,
                        'using_normal_delivery_type' => $normalDeliveryType ? $normalDeliveryType->name : 'not found'
                    ]);
                }
                
                // Siempre agregar express para ubicaciones is_free
                $result['express'] = [
                    'price' => $deliveryPrice->express_price,
                    'description' => $expressType->description ?? 'Entrega express',
                    'type' => $expressType->name,
                    'characteristics' => $expressType->characteristics,
                ];
            } else {
                // Para ubicaciones normales (no is_free), usar precio estándar
                if ($qualifiesForFreeShipping) {
                    // Si califica por monto global, hacer gratuito
                    $result['standard']['price'] = 0;
                    $result['standard']['description'] = 'Envío gratuito por compra mayor a S/ ' . $minFreeShipping;
                }
            }

            if ($deliveryPrice->is_agency) {
                $agencyType = TypeDelivery::where('slug', 'delivery-agencia')->first();

                $result['agency'] = [
                    'price' => $deliveryPrice->agency_price,
                    'description' => $agencyType->description ?? 'Entrega en Agencia',
                    'type' => $agencyType->name,
                    'characteristics' => $agencyType->characteristics,
                ];
            }

            // 5. Verificar si hay retiro en tienda disponible
            // Obtener directamente el TypeDelivery de retiro en tienda
            $storePickupType = TypeDelivery::where('slug', 'retiro-en-tienda')->first();

            if ($storePickupType) {
                $result['is_store_pickup'] = true;
                $result['store_pickup'] = [
                    'price' => 0,
                    'description' => $storePickupType->description,
                    'type' => $storePickupType->name,
                    'characteristics' => $storePickupType->characteristics ?? ['Sin costo de envío', 'Horarios flexibles', 'Atención personalizada'],
                ];
            } else {
                $result['is_store_pickup'] = false;
            }
            //dump($result);
            $response->data = $result;
            $response->status = 200;
            $response->message = 'Precios obtenidos correctamente';
        }, function ($e) {
           Log::error('Error en getDeliveryPrice: ' . $e->getMessage());
         //  dump('Error en getDeliveryPrice: ' . $e->getMessage());
        });

        return response($response->toArray(), $response->status);
    }

    /* public function getPrices(Request $request): HttpResponse|ResponseFactory|RedirectResponse
    {
        $response = Response::simpleTryCatch(function (Response $response) use ($request) {

            $result = DeliveryPrice::with(['type'])
                ->get();

            $response->data = $result;
            $response->status = 200;
            $response->message = 'Precios obtenidos correctamente';
        }, function ($e) {
            \Log::error('Error en getDeliveryPrice: ' . $e->getMessage());
        });

        return response($response->toArray(), $response->status);
    }

    public function getDeliveryPrice(Request $request)
    {
        $response = new Response();


        try {
            $validated = $request->validate(['ubigeo' => 'required']);
            $ubigeo = $validated['ubigeo'];



            $deliveryPrice = DeliveryPrice::with(['type'])
                ->where('ubigeo', $ubigeo)
                ->first();




            if (!$deliveryPrice) {
                throw new Exception('No hay cobertura');
            }

            $result = $this->structureResponse($deliveryPrice);

            $response->data = $result;
            $response->status = 200;
        } catch (Exception $e) {
            $response->status = 404;
            $response->message = $e->getMessage();
        }

        return response()->json($response);
    }

    private function structureResponse(DeliveryPrice $deliveryPrice): array
    {
        $base = [
            'is_free' => $deliveryPrice->is_free,
            'standard' => [
                'price' => $deliveryPrice->is_free ? 0 : $deliveryPrice->price,
                'description' => $deliveryPrice->type->description,
                'type' => $deliveryPrice->type->name,
                'characteristics' => $deliveryPrice->type->characteristics,
            ]
        ];

        if ($deliveryPrice->is_free && $deliveryPrice->expressType) {
            $base['express'] = [
                'price' => $deliveryPrice->express_price,
                'description' => $deliveryPrice->expressType->description,
                'type' => $deliveryPrice->expressType->name,
                'characteristics' => $deliveryPrice->expressType->characteristics,
            ];
        }

        return $base;
    }*/



    public function search(Request $request)
    {
        $search = $request->query('q');
        // dump($search);


        // Eliminar el dump() que rompe la respuesta JSON

        return collect(config('app.ubigeo'))
            ->filter(function ($item) use ($search) {

                $searchLower = Str::lower($search);

                // Verificar si el término de búsqueda está presente en el departamento, provincia o distrito en minúsclas

                return Str::contains(Str::lower($item['departamento']), $searchLower) ||
                    Str::contains(Str::lower($item['provincia']), $searchLower) ||
                    Str::contains(Str::lower($item['distrito']), $searchLower);
            })

            ->values()
            ->map(function ($item) {
                return [
                    'ieni' => $item['inei'],
                    'reniec' => $item['reniec'],
                    'departamento' => $item['departamento'],
                    'provincia' => $item['provincia'],
                    'distrito' => $item['distrito']
                ];
            });
    }
}
