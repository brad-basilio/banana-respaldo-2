<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BasicController;
use App\Models\Sale;
use App\Models\SaleStatus;
use App\Notifications\OrderStatusChangedNotification;
use Illuminate\Http\Request;

class SaleController extends BasicController
{
    public $model = Sale::class;
    public $reactView = 'Admin/Sales';
    public $with4get = ['status', 'details', 'store'];

    public function setReactViewProperties(Request $request)
    {
        return [
            'statuses' => SaleStatus::all(),
        ];
    }

    public function setPaginationInstance(Request $request, string $model)
    {
        return $model::with(['status', 'store']);
    }

    public function afterSave(Request $request, object $jpa, ?bool $isNew)
    {
        $saleJpa = Sale::with($this->with4get)->find($jpa->id);

        // Notificar al cliente sobre el cambio de estado
        if ($saleJpa && $saleJpa->email && $saleJpa->status) {
            $saleJpa->notify(new OrderStatusChangedNotification($saleJpa));
        }

        return $saleJpa;
    }
}
