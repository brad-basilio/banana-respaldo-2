<?php

namespace App\Http\Controllers;

use App\Models\TypeDelivery;
use Illuminate\Http\Request;
use SoDe\Extend\Response;

class TypeDeliveryController extends BasicController
{
    public function getBySlug($slug)
    {
        $response = Response::simpleTryCatch(function (Response $response) use ($slug) {
            $typeDelivery = TypeDelivery::where('slug', $slug)->first();
            
            if (!$typeDelivery) {
                $response->status = 404;
                $response->message = 'Tipo de delivery no encontrado';
                return;
            }
            
            $response->data = $typeDelivery;
            $response->status = 200;
            $response->message = 'Tipo de delivery obtenido correctamente';
        });

        return response($response->toArray(), $response->status);
    }
}
