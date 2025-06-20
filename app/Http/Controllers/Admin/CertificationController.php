<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BasicController;
use App\Models\Certification;
use App\Models\WebDetail;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CertificationController extends BasicController
{
    public $model = Certification::class;
    public $reactView = 'Admin/Certification';
    public $imageFields = ['image'];

    public function setReactViewProperties(Request $request)
    {
        $details = WebDetail::where('page', 'values')->get();
        return [
            'details' => $details,
        ];
    }
}
