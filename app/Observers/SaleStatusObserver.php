<?php

namespace App\Observers;

use App\Models\Sale;
use App\Models\SaleStatusTrace;
use App\Notifications\OrderStatusChangedNotification;
use Illuminate\Support\Facades\Auth;

class SaleStatusObserver
{
    public function created(Sale $sale)
    {
        SaleStatusTrace::create([
            'sale_id' => $sale->id,
            'status_id' => $sale->status_id,
            'user_id' => Auth::id() ?? null,
        ]);
    }

    // Registro de los cambios en el estado
    public function updating(Sale $sale)
    {
        if ($sale->isDirty('status_id')) {
            SaleStatusTrace::create([
                'sale_id' => $sale->id,
                'status_id' => $sale->status_id,
                'user_id' => Auth::id() ?? null,
            ]);
            $sale->notify(new OrderStatusChangedNotification($sale));
        }
    }
}
