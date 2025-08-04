<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BasicController;
use App\Models\SaleStatus;
use App\Models\SaleStatusTrace;
use App\Models\User;
use Illuminate\Http\Request;
use SoDe\Extend\File;
use SoDe\Extend\JSON;

class SaleStatusController extends BasicController
{
    public $model = SaleStatus::class;
    public $reactView = 'Admin/Statuses';

    public function setReactViewProperties(Request $request)
    {
        $icons = JSON::parse(File::get('../storage/app/utils/icons-mdi.json'));
        return [
            'icons' => $icons
        ];
    }

    public function bySale($saleId)
    {
        try {
            $statusTraces = SaleStatusTrace::where('sale_id', $saleId)
                ->orderBy('created_at', 'desc')
                ->get();

            $result = [];
            foreach ($statusTraces as $trace) {
                $status = SaleStatus::find($trace->status_id);
                $user = User::find($trace->user_id);
                
                $result[] = [
                    'id' => $trace->id,
                    'status_id' => $trace->status_id,
                    'name' => $status ? $status->name : 'Estado desconocido',
                    'color' => $status ? $status->color : '#333',
                    'icon' => $status ? $status->icon : 'mdi mdi-circle',
                    'user_name' => $user ? $user->name : 'Sistema',
                    'user_lastname' => $user ? $user->lastname : '',
                    'created_at' => $trace->created_at
                ];
            }

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener historial de estados: ' . $e->getMessage()], 500);
        }
    }
}
