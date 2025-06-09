<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BasicController;
use App\Models\Indicator;
use App\Models\ItemFeature;
use App\Models\ItemSpecification;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class ItemSpecificationController extends BasicController
{
    public $model = ItemSpecification::class;
    public function setReactViewProperties(Request $request)
    {
        return [];
    }

    public function saveSpecifications(object $jpa, array $specifications)
    {   

        $existingIds = collect($specifications)
            ->pluck('id')
            ->filter() // Elimina valores null/empty
            ->toArray();
        
        ItemSpecification::where('item_id', $jpa->id)
            ->whereNotIn('id', $existingIds)
            ->delete();

            
        foreach ($specifications as $spec) {
            ItemSpecification::updateOrCreate(
                [
                    'id' => Arr::get($spec, 'id'), // Busca por ID si existe
                    'item_id' => $jpa->id
                ],
                [
                    'type' => Arr::get($spec, 'type'),
                    'title' => Arr::get($spec, 'title'),
                    'description' => Arr::get($spec, 'description')
                ]
            );
        }
    }
}
