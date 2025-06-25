<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Collection;
use App\Models\Combo;
use App\Models\Item;
use App\Models\ItemTag;
use App\Models\SubCategory;
use App\Models\Tag;
use App\Models\WebDetail;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use SoDe\Extend\Response;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\RedirectResponse;

use Illuminate\Http\Response as HttpResponse;

class ItemController extends BasicController
{
    public $model = Item::class;
    public $reactView = 'Courses';
    public $reactRootView = 'public';
    public $prefix4filter = 'items';

    public function variationsItems(Request $request)
    {
        $response = new Response();


        try {

            $limite = $request->limit ?? 0;
            // Obtener el producto principal por slug
            $product = Item::with(['category', 'brand', 'images', 'specifications'])
                ->where('slug', $request->slug)
                ->firstOrFail();

            if ($limite > 0) {
                $product->load(['variants' => function ($query) use ($limite) {
                    $query->limit($limite);
                }]);
            }else{
                $product->load(['variants']);
            }
            // Obtener las variantes (productos con el mismo nombre pero diferente ID)
            // $variants = Item::where('name', $product->name)
            //     ->where('id', '!=', $product->id)
            //     ->get(['id', 'slug', 'color', 'texture', 'image', 'final_price']);

            // Agregar las variantes al producto principal
            // $product->variants = $variants;
            $response->status = 200;
            $response->message = 'Producto obtenido correctamente';
            $response->data = $product;
        } catch (\Throwable $th) {
            dd($th->getMessage());
            $response->status = 404;
            $response->message = 'Producto no encontrado';
        }

        return response($response->toArray(), $response->status);
    }


    public function setReactViewProperties(Request $request)
    {
        $categories = Category::select([
            DB::raw('DISTINCT(categories.id)'),
            'categories.name'
        ])
            ->join('items', 'items.category_id', 'categories.id')
            ->where('categories.status', true)
            ->where('categories.visible', true)
            ->where('items.status', true)
            ->where('items.visible', true)
            ->get();
        $details = WebDetail::where('page', 'courses')->get();
        return [
            'categories' => $categories,
            'details' => $details
        ];
    }
    /*aqui agregar el codigo*/

    public function setPaginationInstance(Request $request, string $model)
    {
        dump('[STEP 1] setPaginationInstance INICIO', $request->all());
        dump('[STEP 2] Antes de armar query base');
        $query = $model::select(['items.*'])
            ->with(['collection', 'category', 'subcategory', 'brand', 'tags'])
            ->leftJoin('collections AS collection', 'collection.id', 'items.collection_id')
            ->leftJoin('categories AS category', 'category.id', 'items.category_id')
            ->leftJoin('sub_categories AS subcategory', 'subcategory.id', 'items.subcategory_id')
            ->leftJoin('brands AS brand', 'brand.id', 'items.brand_id')
            ->leftJoin('item_tags AS item_tag', 'item_tag.item_id', 'items.id')
            ->where('items.status', true)
            ->where('items.visible', true)
            ->where(function ($query) {
                $query->where('collection.status', true)
                    ->orWhereNull('collection.id');
            })
            ->where(function ($query) {
                $query->where('collection.visible', true)
                    ->orWhereNull('collection.id');
            })
            ->where(function ($query) {
                $query->where('category.status', true)
                    ->orWhereNull('category.id');
            })
            ->where(function ($query) {
                $query->where('category.visible', true)
                    ->orWhereNull('category.id');
            })
            ->where(function ($query) {
                $query->where('subcategory.status', true)
                    ->orWhereNull('subcategory.id');
            })
            ->where(function ($query) {
                $query->where('subcategory.visible', true)
                    ->orWhereNull('subcategory.id');
            })
            ->where(function ($query) {
                $query->where('brand.status', true)
                    ->orWhereNull('brand.id');
            })
            ->where(function ($query) {
                $query->where('brand.visible', true)
                    ->orWhereNull('brand.id');
            });
        dump('[STEP 3] Query base armada');

        // Solo aplica agrupación para la página específica
        dump('[STEP 4] Antes de join agrupador');
        $query->join(
            DB::raw('(SELECT MIN(id) as min_id FROM items GROUP BY name) as grouped'),
            function ($join) {
                $join->on('items.id', '=', 'grouped.min_id');
            }
        );
        dump('[STEP 5] Después de join agrupador');

        // Ordenar primero por mayor coincidencia entre el nombre de la categoría y el nombre del producto (singular/plural)
        dump('[STEP 6] Antes de filtro y orden de categoría');
        $selectedCategories = $request->input('category_id', []);
        $categorySlug = null;
        // Si no hay category_id pero sí hay filtro por category.slug, usarlo
        if (empty($selectedCategories)) {
            // Buscar en el filtro si hay category o category.slug (soporta array de arrays tipo DevExtreme)
            $filter = $request->input('filter', []);
            // Extraer slug de cualquier formato (asociativo o array de arrays)
            if (is_array($filter)) {
                // Caso DevExtreme: array de arrays de condiciones
                foreach ($filter as $f1) {
                    if (is_array($f1)) {
                        foreach ($f1 as $f2) {
                            if (is_array($f2) && count($f2) === 3) {
                                if ($f2[0] === 'category.slug' && ($f2[1] === '=' || $f2[1] === '==')) {
                                    $categorySlug = $f2[2];
                                } elseif ($f2[0] === 'category' && ($f2[1] === '=' || $f2[1] === '==')) {
                                    $categorySlug = $f2[2];
                                }
                            }
                        }
                    }
                }
            }
            // Fallback: asociativo plano
            if (!$categorySlug && isset($filter['category'])) {
                $categorySlug = $filter['category'];
            } elseif (!$categorySlug && isset($filter['category.slug'])) {
                $categorySlug = $filter['category.slug'];
            }
            if ($categorySlug) {
                dump('[STEP 7A] No category_id, pero hay categorySlug', $categorySlug);
                $cat = Category::where('slug', $categorySlug)->first();
                if ($cat) {
                    $categoryName = $cat->name;
                    dump('[STEP 8A] Nombre de categoría encontrado por slug', $categoryName);
                    $categoryNameLower = strtolower($categoryName);
                    $categoryRoot = rtrim($categoryNameLower, 's');
                    dump('[STEP 10A] categoryNameLower y root', $categoryNameLower, $categoryRoot);
                    // NO filtrar, solo ordenar por coincidencia de nombre
                    // CASE prioritization:
                    $query->orderByRaw('
                        CASE
                            WHEN LOWER(items.name) LIKE ? THEN 1
                            WHEN LOWER(items.name) REGEXP ? THEN 2
                            WHEN LOWER(items.name) LIKE ? OR LOWER(items.name) LIKE ? THEN 3
                            ELSE 4
                        END
                    ', [
                        $categoryNameLower . '%',
                        '\\b' . $categoryRoot . '(s)?\\b',
                        '%' . $categoryNameLower . '%',
                        '%' . $categoryRoot . '%',
                    ]);
                    $query->orderByRaw('(category.name = ?) DESC', [$categoryName]);
                    dump('[STEP 13A] Query final', $query->toSql(), $query->getBindings());
                }
            }
        } else {
            dump('[STEP 7] Hay categorías seleccionadas', $selectedCategories);
            // Obtener el nombre de la categoría seleccionada (solo la primera si hay varias)
            $categoryName = null;
            if (is_array($selectedCategories) && count($selectedCategories) > 0) {
                $categoryId = $selectedCategories[0];
                // Puede venir como id o slug, intentamos ambos
                $cat = Category::where('id', $categoryId)->orWhere('slug', $categoryId)->first();
                dump('[STEP 8] Buscando categoría por id o slug', $categoryId, $cat);
                if ($cat) {
                    $categoryName = $cat->name;
                }
            }
            if ($categoryName) {
                dump('[STEP 9] Nombre de categoría encontrado', $categoryName);
                $categoryNameLower = strtolower($categoryName);
                $categoryRoot = rtrim($categoryNameLower, 's');
                dump('[STEP 10] categoryNameLower y root', $categoryNameLower, $categoryRoot);
                // NO filtrar, solo ordenar por coincidencia de nombre
                // CASE prioritization:
                $query->orderByRaw('
                    CASE
                        WHEN LOWER(items.name) LIKE ? THEN 1
                        WHEN LOWER(items.name) REGEXP ? THEN 2
                        WHEN LOWER(items.name) LIKE ? OR LOWER(items.name) LIKE ? THEN 3
                        ELSE 4
                    END
                ', [
                    $categoryNameLower . '%',
                    '\\b' . $categoryRoot . '(s)?\\b',
                    '%' . $categoryNameLower . '%',
                    '%' . $categoryRoot . '%',
                ]);
                $query->orderByRaw('(category.name = ?) DESC', [$categoryName]);
                dump('[STEP 13] Query final', $query->toSql(), $query->getBindings());
            }
        }
        dump('[STEP 14] setPaginationInstance FIN');


        return $query;
    }

    public function setPaginationSummary(Request $request, Builder $builder, Builder $originalBuilder)
    {
        /* $minPrice = Item::min('price');
        $maxPrice = Item::max('price');
        $rangeSize = 50;  // Define el tamaño del rango

        // Calcular rangos de precio
        $ranges = [];
        for ($i = $minPrice; $i <= $maxPrice; $i += $rangeSize) {
            $ranges[] = [
                'min' => $i,
                'max' => $i + $rangeSize - 1
            ];
        }*/

        try {
            //code...
            // IMPORTANTE: Usar originalBuilder para rangos de precio, no builder con paginación
            $i4price = clone $originalBuilder;
            $minPrice = $i4price->min('final_price');
            $maxPrice = $i4price->max('final_price') ?? 0;
            $rangeSize = round($maxPrice / 6); // Define el tamaño del rango

            // Calcular rangos de precio
            // $countQuery = clone $builder;
            $countQuery = clone $originalBuilder;
            $countQuery->getQuery()->limit = null;
            $countQuery->getQuery()->offset = null;
            $totalItems = $countQuery->count();
            $ranges = [];
            if ($totalItems > 10 && $maxPrice >= 6) {
                for ($i = $minPrice; $i <= $maxPrice; $i += $rangeSize) {
                    $ranges[] = [
                        'min' => $i,
                        'max' => $i + $rangeSize - 1
                    ];
                }
            }
            $filterSequence = $request->input('filterSequence', []);
            $selectedBrands = $request->input('brand_id', []);
            $selectedCategories = $request->input('category_id', []);
            $selectedCollections = $request->input('collection_id', []);
            // $mainFilter = $request->filterSequence[0] ?? null;

            // IMPORTANTE: Usar siempre originalBuilder para los filtros, nunca builder con paginación
            $i4collection = clone $originalBuilder;
            $i4category = clone $originalBuilder;
            $i4subcategory = clone $originalBuilder;
            $i4brand = clone $originalBuilder;
            $i4tag = clone $originalBuilder;
            
            // PADRES: nunca se filtran entre sí, siempre usan el builder original
            $collections = in_array('collection_id', $filterSequence)
                ? Item::getForeign($originalBuilder, Collection::class, 'collection_id')
                : Item::getForeign($i4collection, Collection::class, 'collection_id');

            $brands = in_array('brand_id', $filterSequence)
                ? Item::getForeign($originalBuilder, Brand::class, 'brand_id')
                : Item::getForeign($i4brand, Brand::class, 'brand_id');

            // CATEGORIAS: si hay marcas seleccionadas, filtrar categorías por esas marcas, SIEMPRE, aunque category_id esté en filterSequence
            if (!empty($selectedBrands)) {
                // Si hay marcas seleccionadas, solo mostrar categorías que tengan productos de esas marcas
                $catBuilder = clone $originalBuilder;
                $catBuilder->whereIn('brand_id', $selectedBrands);
                $categories = Item::getForeign($catBuilder, Category::class, 'category_id');
            } else {
                // Si NO hay marcas seleccionadas, usar la lógica del filterSequence
                $categories = in_array('category_id', $filterSequence)
                    ? Item::getForeign($originalBuilder, Category::class, 'category_id')
                    : Item::getForeign($i4category, Category::class, 'category_id');
            }

            // HIJO: subcategoría sí se filtra por los padres activos
            if (in_array('subcategory_id', $filterSequence)) {
                $subcatBuilder = clone $originalBuilder;
                if (!empty($selectedBrands)) {
                    $subcatBuilder->whereIn('brand_id', $selectedBrands);
                }
                if (!empty($selectedCategories)) {
                    $subcatBuilder->whereIn('category_id', $selectedCategories);
                }
                if (!empty($selectedCollections)) {
                    $subcatBuilder->whereIn('collection_id', $selectedCollections);
                }
                $subcategories = Item::getForeign($subcatBuilder, SubCategory::class, 'subcategory_id');
            } else {
                $subcategories = Item::getForeign($i4subcategory, SubCategory::class, 'subcategory_id');
            }
           
            $tags = Item::getForeignMany($i4tag, ItemTag::class, Tag::class);
            return [
                'priceRanges' => $ranges,
                'collections' => $collections,
                'categories' => $categories,
                'subcategories' => $subcategories,
                'brands' => $brands,
                'tags' => $tags
            ];
        } catch (\Throwable $th) {
            // dump($th->getMessage());
            return [];
        }
    }

    public function verifyStock(Request $request)
    {
        $response = Response::simpleTryCatch(function () use ($request) {
            return Item::select(['id', 'price', 'discount', 'name'])
                ->whereIn('id', $request->all())
                ->get();
        });
        return response($response->toArray(), $response->status);
    }
    public function verifyCombo2(Request $request)
    {
        //dump($request->all());
        try {
            // Validar la solicitud
            $validated = $request->validate([
                'id' => 'required', // Asegúrate de que el producto exista
            ]);

            // Buscar combos donde el producto sea el principal
            $combos = Combo::whereHas('items', function ($query) use ($validated) {
                $query->where('item_id', $validated['id'])
                    ->where('is_main_item', true);
            })->with(['items' => function ($query) {
                $query->orderBy('is_main_item', 'desc'); // Ordenar para que el principal aparezca primero
            }])->get();

            //dump($combos);

            // Verificar si hay combos
            if ($combos->isEmpty()) {
                return response()->json([
                    'status' => false,
                    'message' => 'El producto no es un producto principal en ningún combo.',
                ], 404);
            }

            // Formatear los datos de respuesta
            $result = $combos->map(function ($combo) {
                return [
                    'combo_id' => $combo->id,
                    'combo_name' => $combo->name,
                    'main_product' => $combo->items->firstWhere('pivot.is_main_item', true),
                    'associated_items' => $combo->items->filter(function ($item) {
                        return !$item->pivot->is_main_item;
                    }),
                ];
            });
            //dump($result);
            return response()->json([
                'status' => true,
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function verifyCombo(Request $request): HttpResponse | ResponseFactory
    {
        $response = new Response();
        try {
            // Validar el correo electrónico
            $request->validate([
                'id' => 'required',
            ]);

            // Buscar al usuario por correo electrónico
            // Buscar combos donde el producto sea el principal
            $combos = Combo::whereHas('items', function ($query) use ($request) {
                $query->where('item_id', $request->id)
                    ->where('is_main_item', true);
            })->with([
                'items' => function ($query) {
                    $query->orderBy('is_main_item', 'desc'); // Ordenar para que el principal aparezca primero
                },
                'items.category', // Incluir la categoría del item
                'items.brand'     // Incluir la marca del item
            ])->get();

            //dump($combos);

            // Verificar si hay combos
            if ($combos->isEmpty()) {
                $response->status = 400;
                $response->message = 'No productos relacionados';
            }

            // Formatear los datos de respuesta
            $result = $combos->map(function ($combo) {
                return [
                    'combo_id' => $combo->id,
                    'combo_name' => $combo->name,
                    'main_product' => $combo->items->firstWhere('pivot.is_main_item', true),
                    'associated_items' => $combo->items->filter(function ($item) {
                        return !$item->pivot->is_main_item;
                    }),
                ];
            });

            //dump($result);

            // Respuesta exitosa
            $response->status = 200;
            $response->message = 'Se ha enviado un enlace para restablecer tu contraseña.';
            $response->data = $result;
        } catch (\Throwable $th) {
            $response->status = 400;
            $response->message = $th->getMessage();
        } finally {
            return response(
                $response->toArray(),
                $response->status
            );
        }
    }
    public function updateViews(Request $request)
    {
        //dump($request->all());
        $product = Item::findOrFail($request->id); // Asegúrate de que el modelo sea el correcto
        if (!$product) {
            return response()->json(['error' => 'Producto no encontrado'], 404);
        }
        $product->increment('views'); // Incrementa en 1
        return response()->json(['success' => true, 'views' => $product->views]);
    }

    public function relationsItems(Request $request): HttpResponse | ResponseFactory
    {
        //dump($request->all());
        $response = new Response();
        try {
            // Validar el ID del producto
            $request->validate([
                'id' => 'required',
            ]);

            // Obtener el producto principal
            $product = Item::findOrFail($request->id);
            //dump($product);
            // Obtener productos de la misma categoría (excluyendo el producto principal)
            $relatedItems = Item::where('category_id', $product->category_id)
                ->where('id', '!=', $product->id) // Excluir el producto actual
                ->with(['category', 'brand']) // Cargar relaciones necesarias
                ->take(10) // Limitar a 10 productos
                ->get();
            //dump($relatedItems);

            // Verificar si hay productos relacionados
            if ($relatedItems->isEmpty()) {
                $response->status = 400;
                $response->message = 'No hay productos relacionados.';
                return response($response->toArray(), $response->status);
            }

            // Formatear la respuesta
            $response->status = 200;
            $response->message = 'Productos relacionados encontrados.';
            $response->data = $relatedItems;
        } catch (\Throwable $th) {
            $response->status = 400;
            $response->message = $th->getMessage();
        } finally {
            return response($response->toArray(), $response->status);
        }
    }

    public function searchProduct(Request $request)
    {
        try {
        
            $query = $request->input('query');

            $resultados = Item::select('items.*')
              ->where('items.status', 1)
              ->where('items.visible', 1)
              ->where('items.name', 'like', "%$query%")
              ->whereIn('items.id', function ($subquery) {
                $subquery->select(DB::raw('MIN(id)'))
                  ->from('items')
                  ->where('items.visible', 1)
                  ->groupBy('name');
              })
              ->join('categories', 'categories.id', 'items.category_id')
              ->where('categories.status', 1)
              ->where('categories.visible', 1)
              ->get();
        
            return response()->json([
                'status' => true,
                'data' => $resultados,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
