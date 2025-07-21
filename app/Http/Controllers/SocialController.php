<?php

namespace App\Http\Controllers;

use App\Models\Social;
use App\Http\Requests\StoreSocialRequest;
use App\Http\Requests\UpdateSocialRequest;

class SocialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Obtener socials activos para mostrar públicamente
     */
    public function getActiveSocials()
    {
        try {
            $socials = Social::where('status', true)
                           ->where('visible', true)
                           ->orderBy('name', 'asc')
                           ->get();
            return response()->json($socials);
        } catch (\Exception $e) {
            return response()->json([], 500);
        }
    }

    
}
