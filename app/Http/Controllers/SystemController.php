<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use App\Models\General;
use App\Models\Post;
use App\Models\Aboutus;
use App\Models\Setting;
use App\Models\System;
use App\Models\SystemColor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use SoDe\Extend\Crypto;
use SoDe\Extend\File;
use SoDe\Extend\JSON;
use Illuminate\Support\Facades\Schema;
use SoDe\Extend\Array2;

class SystemController extends BasicController
{
    public $model = System::class;
    public $reactView = 'System';
    public $reactRootView = 'public';

    public function setReactViewProperties(Request $request)
    {
        $path = $request->server('REQUEST_URI') ?? '/';
        $pages = JSON::parse(File::get(storage_path('app/pages.json')));
        $components = JSON::parse(File::get(storage_path('app/components.json')));

        $props = [
            'pages' => $pages,
            'systems' => [],
            'params' => []
        ];

        $fonts = [
            'title' => [
                'name' => Setting::get('title-font-name'),
                'url' => Setting::get('title-font-url'),
                'source' => Setting::get('title-font-source')
            ],
            'paragraph' => [
                'name' => Setting::get('paragraph-font-name'),
                'url' => Setting::get('paragraph-font-url'),
                'source' => Setting::get('paragraph-font-source')
            ]
        ];

        if ($path === '/base-template') {
            $props['systems'] = System::whereNull('page_id')->get();
            $props['page'] = ['name' => 'Template base'];
            $this->reactData = $props['page'];
            $this->reactData['colors'] = SystemColor::all();
            $generals = [];
            foreach ($props['systems'] as $system) {
                if ($system->component == 'content') continue;
                $parent = collect($components)->firstWhere('id', $system->component);
                $component = collect($parent['options'])->firstWhere('id', $system->value);
                if (isset($component['generals'])) {
                    $generals = array_merge($generals, $component['generals']);
                }
            }
            $props['generals'] = General::whereIn('correlative', $generals)->get();
            $this->reactData['fonts'] = $fonts;
            return $props;
        }

        $page = collect($pages)->filter(function ($item) use ($path) {
            $path2check = isset($item['pseudo_path']) && $item['pseudo_path'] ?  $item['pseudo_path'] : $item['path'];
            return strpos($path, $path2check) === 0; // Filtra las páginas que comienzan con el path
        })->sortByDesc(function ($item) {
            return strlen($item['pseudo_path'] ?? $item['path']);
        })->first();

        if (!$page) {
            abort(404);
        }

        $page['using'] = $page['using'] ?? [];

        $props['page'] = $page;
        $this->reactData = $page;
        $this->reactData['colors'] = SystemColor::all();

        // Fuentes if exists
        $this->reactData['fonts'] = $fonts;

        $systems = [];
        if (isset($page['extends_base']) && $page['extends_base']) {
            $systems = System::whereNull('page_id')->orWhere('page_id', $page['id'])->get();
        } else {
            $systems = System::where('page_id', $page['id'])->get();
        }

        $generals = [];
        $jsons = [];
        foreach ($systems as $key => $system) {
            if ($system->component == 'content') continue;
            $parent = collect($components)->firstWhere('id', $system->component);
            $component = collect($parent['options'])->firstWhere('id', $system->value);
            if (isset($component['using'])) {
                $using = 'App\\Models\\' . $component['using']['model'];
                $query = $using::select($component['using']['fields'] ?? ['*']);

                if (isset($component['using']['with'])) {
                    $query->with($component['using']['with']);
                }

                if ($system->filters) {
                    foreach ($system->filters as $field) {
                        if (in_array($field, ['ignoreVisibility', 'ignoreStatus'])) continue;
                        if ($field === 'views') {
                            // Ordenar por vistas de manera descendente
                            $query->orderBy('views', 'desc');
                        } elseif ($field === 'mas_vendidos') {
                            // Ordenar por cantidad de ventas (más vendidos)
                            $query->leftJoin('sale_details', 'sale_details.item_id', '=', 'items.id')
                                  ->leftJoin('sales', 'sales.id', '=', 'sale_details.sale_id')
                                  ->whereNotNull('sales.status_id') // Solo ventas que tienen estado
                                  ->selectRaw('items.*, COALESCE(SUM(sale_details.quantity), 0) as total_vendido')
                                  ->groupBy('items.id')
                                  ->orderBy('total_vendido', 'desc');
                        } else {
                            // Aplicar filtro booleano para otros campos
                            $query->where($field, true);
                        }
                    }
                }

                if ($system->filters_method) {
                    $method = $system->filters_method;
                    $methodValues = $system->filters_method_values;
                    $relation = $query->getModel()->$method();
                    $foreignKey = $relation->getLocalKeyName();
                    $query->whereIn($foreignKey, $methodValues);
                }


                if (isset($component['using']['limit'])) {
                    $query->limit($component['using']['limit']);
                }

                // aquí filtrar visible & status
                $table = (new $using)->getTable();
                if (Schema::hasColumn($table, 'visible') && !Array2::find($system->filters ?? [], fn($x) => $x == 'ignoreVisibility')) {
                    $query->where('visible', true);
                }
                if (Schema::hasColumn($table, 'status') && !Array2::find($system->filters ?? [], fn($x) => $x == 'ignoreStatus')) {
                    $query->where('status', true);
                }

                // MODIFICACIÓN PARA MANEJAR VARIANTES DE COLOR:
                // Si es el modelo Item, agrupar por nombre y tomar solo un representante
                
                // if ($component['using']['model'] === 'Item') {
                //     $query->selectRaw('items.*')
                //         ->join(
                //             DB::raw('(SELECT MIN(id) as min_id FROM items GROUP BY name) as grouped'),
                //             function ($join) {
                //                 $join->on('items.id', '=', 'grouped.min_id');
                //             }
                //         );
                // }


                $shortID = Crypto::short();
                $system->itemsId = $shortID;
                $props['systemItems'][$shortID] = $query->get();
            }

            if (isset($component['json'])) {
                foreach ($component['json'] as $key => $value) {
                    if (isset($jsons[$key])) continue;
                    $jsons[$key] = JSON::parse(File::get($value));
                }
            }

            if (isset($component['generals'])) {
                $generals = array_merge($generals, $component['generals']);
            }
        }

        $props['systems'] = $systems;
        $props['jsons'] = $jsons;
        $props['params'] = $request->route() ? $request->route()->parameters() : [];
        $props['filteredData'] = [];
        $props['generals'] = General::whereIn('correlative', $generals)->get();
        $props['contacts'] = General::where('status', true)->get();
        $props['faqs'] = Faq::where('status', true)->get();
        // Procesar el campo 'using'
        foreach ($page['using'] as $key => $using) {
            $model = $using['model'] ?? null;
            $field = $using['field'] ?? null;
            $value = $request->$key ?? null;
            $relations = $using['relations'] ?? [];

            if ($model && $field && $value) {
                // Cargar un registro específico
                $class = 'App\\Models\\' . $model;
                $result = $class::with($relations)
                    ->where($field, $value)
                    ->first();
                $props['filteredData'][$model] = $result;
            } elseif ($model) {
                // Cargar todos los registros
                $class = 'App\\Models\\' . $model;
                $query = $class::select($using['fields'] ?? ['*']);
                
                $table = (new $class)->getTable();
                
                if (Schema::hasColumn($table, 'visible')) {
                    $query->where('visible', true);
                }

                if (Schema::hasColumn($table, 'status')) {
                    $query->where('status', true);
                }
                
                if (isset($using['relations'])) {
                    $query->with($using['relations']);
                }
                $props['filteredData'][$key] = $query->get();
            } elseif (isset($using['static'])) {
                // Datos estáticos
                $props['filteredData'][$key] = $using['static'];
            }
        }
      
        $props['headerPosts'] = Post::with('category')->where('status', true)->latest()->take(3)->get();
        $props['postsLatest'] = Post::with('category')->where('status', true)->latest()->take(6)->get();
        $props['textstatic'] = Aboutus::where('visible', true)->where('status', true)->get();

        return $props;
    }
}
