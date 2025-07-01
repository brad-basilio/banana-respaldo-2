<?php

namespace App\Http\Controllers\Customer;

use App\Http\Classes\dxResponse;
use App\Http\Controllers\BasicController;
use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\SaleStatus;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Routing\ResponseFactory;
use Illuminate\Support\Facades\DB;

class SaleController extends BasicController
{
    public $model = Sale::class;
    public $reactView = 'Customer/Sales';
    public $with4get = ['status', 'details', 'store'];

    public function setReactViewProperties(Request $request)
    {
        return [
            'statuses' => SaleStatus::all(),
        ];
    }

    public function setPaginationInstance(Request $request, string $model)
    {
        $userId = Auth::user()->id;
        return $model::with(['status', 'store'])->where('user_id', $userId);
    }
}
