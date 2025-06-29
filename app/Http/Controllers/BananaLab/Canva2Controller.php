<?php

namespace App\Http\Controllers\BananaLab;

use App\Http\Controllers\BasicController;
use Illuminate\Http\Request;

class Canva2Controller extends BasicController
{
    public $reactView = 'BananaLab/Canva2';
    public $reactRootView = 'public';

    public function setReactViewProperties(Request $request)
    {
        return [
            // Aquí puedes agregar propiedades específicas si es necesario
        ];
    }
}
