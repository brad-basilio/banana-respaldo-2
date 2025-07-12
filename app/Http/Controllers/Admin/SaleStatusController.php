<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BasicController;
use App\Models\SaleStatus;
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
}
