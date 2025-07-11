<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BasicController;
use App\Models\Partner;
use App\Models\WebDetail;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PartnerController extends BasicController
{
    public $model = Partner::class;
    public $reactView = 'Admin/Partner';
    public $imageFields = ['image'];

    public function setReactViewProperties(Request $request)
    {
        $details = WebDetail::where('page', 'values')->get();
        return [
            'details' => $details,
        ];
    }
}
