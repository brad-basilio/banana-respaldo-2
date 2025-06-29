<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\BasicController;
use App\Models\CanvasProject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AlbumController extends BasicController
{
    public $reactView = 'Customer/Albums';
 
    public $model = CanvasProject::class;
   

    /**
     * Sobrescribe el método setPaginationInstance para filtrar solo los proyectos del usuario autenticado
     */
    public function setPaginationInstance(Request $request, string $model)
    {
        $user = Auth::user();

        // Filtrar solo los proyectos del usuario autenticado
        return $model::where('user_id', $user->id);
    }
}
