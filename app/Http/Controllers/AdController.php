<?php

namespace App\Http\Controllers;

use App\Models\Ad;
use Illuminate\Http\Request;

class AdController extends Controller
{
    /**
     * Obtener ads activos para mostrar públicamente
     */
    public function getActiveAds()
    {
        try {
            $ads = Ad::today();
            return response()->json($ads);
        } catch (\Exception $e) {
            return response()->json([], 500);
        }
    }
}
