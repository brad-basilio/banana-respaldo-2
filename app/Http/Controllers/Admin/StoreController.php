<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BasicController;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Routing\ResponseFactory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use SoDe\Extend\Response;
use Exception;
use Illuminate\Support\Facades\File;
use SoDe\Extend\JSON;

class StoreController extends BasicController
{
    public $model = Store::class;
    public $reactView = 'Admin/Stores';
    public $imageFields = ['image'];
    public $prefix4filter = 'stores';

      public function setReactViewProperties(Request $request)
    {
        $ubigeo = JSON::parse(File::get('../storage/app/utils/ubigeo.json'));
        return [
            'ubigeo' => $ubigeo
        ];
    }

    private function getUbigeos()
    {
        try {
            $ubigeoPath = public_path('ubigeo.json');
            if (file_exists($ubigeoPath)) {
                $ubigeoContent = file_get_contents($ubigeoPath);
                return json_decode($ubigeoContent, true) ?: [];
            }
        } catch (Exception $e) {
            Log::error('Error loading ubigeos: ' . $e->getMessage());
        }
        return [];
    }

    public function beforeSave(Request $request)
    {
        $data = $request->only([
            'name', 'address', 'phone', 'email', 'description',
            'ubigeo', 'latitude', 'longitude', 'manager', 'capacity', 'type'
        ]);

        $data['status'] = $request->boolean('status', true);
        
        // Parse business hours if provided
        if ($request->has('business_hours')) {
            $businessHours = $request->input('business_hours');
            if (is_string($businessHours)) {
                $data['business_hours'] = json_decode($businessHours, true);
            } else {
                $data['business_hours'] = $businessHours;
            }
        }

        return $data;
    }

    // Método para obtener tiendas por ubigeo (para el checkout)
    public function getByUbigeo(string $ubigeo)
    {
        $response = Response::simpleTryCatch(function () use ($ubigeo) {
            $stores = Store::active()
                ->byUbigeo($ubigeo)
                ->select([
                    'id', 'name', 'address', 'phone', 'email', 'image',
                    'latitude', 'longitude', 'business_hours', 'manager', 'description', 'type'
                ])
                ->get();

            return $stores;
        });
        
        return response($response->toArray(), $response->status);
    }

    // Método para obtener todas las tiendas activas (para API pública)
    public function getActiveStores()
    {
        $response = Response::simpleTryCatch(function () {
            $stores = Store::active()
                ->select([
                    'id', 'name', 'address', 'phone', 'email', 'image',
                    'latitude', 'longitude', 'business_hours', 'manager', 'description', 'ubigeo', 'type', 'status'
                ])
                ->get();

            return $stores;
        });
        
        return response($response->toArray(), $response->status);
    }

    // Método para obtener información de una tienda específica
    public function show(string $id)
    {
        $response = Response::simpleTryCatch(function () use ($id) {
            $store = Store::findOrFail($id);
            return $store;
        });
        
        return response($response->toArray(), $response->status);
    }

    public function media(Request $request, string $uuid)
    {
        try {
            $snake_case = 'stores';
            if (strpos($uuid, '.') !== false) {
                $route = "images/{$snake_case}/{$uuid}";
            } else {
                $route = "images/{$snake_case}/{$uuid}.img";
            }
            $content = Storage::get($route);
            if (!$content) throw new Exception('Imagen no encontrada');
            return response($content, 200, [
                'Content-Type' => 'application/octet-stream'
            ]);
        } catch (\Throwable $th) {
            $content = Storage::get('utils/cover-404.svg');
            $status = 200;
            if ($this->throwMediaError) return null;
            return response($content, $status, [
                'Content-Type' => 'image/svg+xml'
            ]);
        }
    }
}
