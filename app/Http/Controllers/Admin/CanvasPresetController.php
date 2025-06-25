<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BasicController;
use App\Models\CanvasPreset;
use Illuminate\Http\Request;

class CanvasPresetController extends BasicController
{
    public $model = CanvasPreset::class;
    public $reactView = 'Admin/Presets';
    
    /**
     * Set properties to be passed to the React view
     *
     * @param Request $request
     * @return array
     */
    public function setReactViewProperties(Request $request)
    {
        return [
            'presetTypes' => CanvasPreset::getTypes()
        ];
    }
    
    /**
     * Obtiene la lista de tipos de preset
     */
    public function getTypes()
    {
        return response()->json([
            'success' => true,
            'data' => CanvasPreset::getTypes()
        ]);
    }

    /**
     * Override the delete method to prevent deletion if the preset is in use
     */
    public function delete(Request $request, $id)
    {
        $item = $this->model::findOrFail($id);
        
        // Check if there are any items using this preset
        if ($item->items()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar el preset porque está siendo utilizado por uno o más productos.'
            ], 422);
        }
        
        // If not in use, proceed with deletion using parent method
        return parent::delete($request, $id);
    }
}