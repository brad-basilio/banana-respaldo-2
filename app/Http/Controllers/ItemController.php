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
use Illuminate\Routing\ResponseFactory;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use App\Models\dxDataGrid;
use App\Http\Classes\dxResponse;

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

            $product->load(['variants']);

            $uniqueVariants = $product->variants
                ->groupBy('color')
                ->map(function ($group) {
                    return $group->first(); 
                })
                ->values(); 

            $product->setRelation('variants', $uniqueVariants);


            // if ($limite > 0) {
            //     $product->load(['variants' => function ($query) use ($limite) {
            //         $query->limit($limite);
            //     }]);
            // }else{
            //     $product->load(['variants']);
            // }



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

    public function getColorsItems(Request $request)
    {
        $response = new Response();

        try {
            $limite = $request->limit ?? 0;
            
            // Obtener el producto principal por slug
            $product = Item::with(['category', 'brand', 'images', 'specifications'])
                ->where('slug', $request->slug)
                ->firstOrFail();

            // Obtener todas las variantes incluyendo el producto actual
            $allVariants = Item::where('name', $product->name)
                ->select(['id', 'slug', 'name', 'color', 'texture', 'image', 'final_price'])
                ->get();

            // Agrupar por color y quedarse con la primera de cada grupo
            $uniqueVariants = $allVariants
                ->groupBy('color')
                ->map(function ($group) {
                    return $group->first(); 
                })
                ->values(); 

            $product->setRelation('variants', $uniqueVariants);

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

    public function getSizesItems(Request $request)
    {
        $response = new Response();

        try {
          
            // Obtener el producto principal por slug
            $product = Item::with(['category', 'brand', 'images', 'specifications'])
            ->where('slug', $request->slug)
            ->firstOrFail();

            // Obtener las variantes (productos con el mismo nombre pero diferente ID)
            $sizes = Item::where('name', $product->name)
                ->where('color', $product->color)
                ->where('visible', true)
                ->where('status', true)
                ->whereNotNull('size')
                ->orderBy('size')
                ->get();

            // Agregar las variantes al producto principal
            // $product->sizes = $sizes;

            $response->status = 200;
            $response->message = 'Tamaños obtenidos correctamente';
            $response->data = $sizes;
        } catch (\Throwable $th) {
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
        //dump('[STEP 1] setPaginationInstance INICIO', $request->all());
        //dump('[STEP 2] Antes de armar query base');
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
        //dump('[STEP 3] Query base armada');

        // Solo aplica agrupación para la página específica
        //dump('[STEP 4] Antes de join agrupador');
        $query->join(
            DB::raw('(SELECT MIN(id) as min_id FROM items GROUP BY name) as grouped'),
            function ($join) {
                $join->on('items.id', '=', 'grouped.min_id');
            }
        );
        //dump('[STEP 5] Después de join agrupador');

        // Ordenar primero por mayor coincidencia entre el nombre de la categoría y el nombre del producto (singular/plural)
        //dump('[STEP 6] Antes de filtro y orden de categoría');
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
                //dump('[STEP 7A] No category_id, pero hay categorySlug', $categorySlug);
                $cat = Category::where('slug', $categorySlug)->first();
                if ($cat) {
                    $categoryName = $cat->name;
                    //dump('[STEP 8A] Nombre de categoría encontrado por slug', $categoryName);
                    $categoryNameLower = strtolower($categoryName);
                    $categoryRoot = rtrim($categoryNameLower, 's');
                    //dump('[STEP 10A] categoryNameLower y root', $categoryNameLower, $categoryRoot);
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
                    //dump('[STEP 13A] Query final', $query->toSql(), $query->getBindings());
                }
            }
        } else {
            //dump('[STEP 7] Hay categorías seleccionadas', $selectedCategories);
            // Obtener el nombre de la categoría seleccionada (solo la primera si hay varias)
            $categoryName = null;
            if (is_array($selectedCategories) && count($selectedCategories) > 0) {
                $categoryId = $selectedCategories[0];
                // Puede venir como id o slug, intentamos ambos
                $cat = Category::where('id', $categoryId)->orWhere('slug', $categoryId)->first();
                //dump('[STEP 8] Buscando categoría por id o slug', $categoryId, $cat);
                if ($cat) {
                    $categoryName = $cat->name;
                }
            }
            if ($categoryName) {
                //dump('[STEP 9] Nombre de categoría encontrado', $categoryName);
                $categoryNameLower = strtolower($categoryName);
                $categoryRoot = rtrim($categoryNameLower, 's');
                //dump('[STEP 10] categoryNameLower y root', $categoryNameLower, $categoryRoot);
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
                //dump('[STEP 13] Query final', $query->toSql(), $query->getBindings());
            }
        }
        //dump('[STEP 14] setPaginationInstance FIN');


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
            $selectedSubcategories = $request->input('subcategory_id', []);
            $selectedCollections = $request->input('collection_id', []);
            $selectedTags = []; // Inicializar array para tags seleccionados

            // Extraer filtros del filtro complejo si no hay filtros directos
            if ((empty($selectedBrands) && empty($selectedCategories) && empty($selectedSubcategories) && empty($selectedCollections)) && $request->filter) {
                $filter = $request->filter;
                if (is_array($filter)) {
                    foreach ($filter as $f1) {
                        if (is_array($f1)) {
                            // Manejar tanto formato plano como anidado
                            foreach ($f1 as $f2) {
                                if (is_array($f2) && count($f2) >= 3) {
                                    // Manejar tanto brand.id como brand.slug
                                    if (($f2[0] === 'brand.slug' || $f2[0] === 'brand.id') && $f2[1] === '=') {
                                        $selectedBrands[] = $f2[2];
                                    } elseif (($f2[0] === 'category.slug' || $f2[0] === 'category.id') && $f2[1] === '=') {
                                        $selectedCategories[] = $f2[2];
                                    } elseif (($f2[0] === 'subcategory.slug' || $f2[0] === 'subcategory.id') && $f2[1] === '=') {
                                        $selectedSubcategories[] = $f2[2];
                                    } elseif (($f2[0] === 'collection.slug' || $f2[0] === 'collection.id') && $f2[1] === '=') {
                                        $selectedCollections[] = $f2[2];
                                    } elseif ($f2[0] === 'item_tag.tag_id' && $f2[1] === '=') {
                                        $selectedTags[] = $f2[2];
                                    }
                                }
                            }
                            // También manejar formato plano directo
                            if (count($f1) >= 3) {
                                // Manejar tanto brand.id como brand.slug
                                if (($f1[0] === 'brand.slug' || $f1[0] === 'brand.id') && $f1[1] === '=') {
                                    $selectedBrands[] = $f1[2];
                                } elseif (($f1[0] === 'category.slug' || $f1[0] === 'category.id') && $f1[1] === '=') {
                                    $selectedCategories[] = $f1[2];
                                } elseif (($f1[0] === 'subcategory.slug' || $f1[0] === 'subcategory.id') && $f1[1] === '=') {
                                    $selectedSubcategories[] = $f1[2];
                                } elseif (($f1[0] === 'collection.slug' || $f1[0] === 'collection.id') && $f1[1] === '=') {
                                    $selectedCollections[] = $f1[2];
                                } elseif ($f1[0] === 'item_tag.tag_id' && $f1[1] === '=') {
                                    $selectedTags[] = $f1[2];
                                }
                            }
                        }
                    }
                }
            }

            // Variables para manejar la lógica de subcategoría seleccionada
            $selectedSubcategoryInfo = null;
            $parentCategoryId = null;
            
            // Si hay subcategoría seleccionada, obtener información de la categoría padre
            if (!empty($selectedSubcategories)) {
                $subcategorySlug = $selectedSubcategories[0]; // Tomar la primera subcategoría
                
                // Buscar la subcategoría por slug o ID
                if ($subcategorySlug) {
                    $selectedSubcategoryInfo = SubCategory::find($subcategorySlug);
                } else {
                    $selectedSubcategoryInfo = SubCategory::where('slug', $subcategorySlug)->first();
                }
                
                if ($selectedSubcategoryInfo && $selectedSubcategoryInfo->category_id) {
                    $parentCategoryId = $selectedSubcategoryInfo->category_id;
                }
            }

            // IMPORTANTE: Usar siempre originalBuilder para los filtros, nunca builder con paginación
            $i4collection = clone $originalBuilder;
            $i4category = clone $originalBuilder;
            $i4subcategory = clone $originalBuilder;
            $i4brand = clone $originalBuilder;
            $i4tag = clone $originalBuilder;
            
            // PADRES: aplicar filtros cruzados para mejor UX
            $collections = in_array('collection_id', $filterSequence)
                ? Item::getForeign($originalBuilder, Collection::class, 'collection_id')
                : Item::getForeign($i4collection, Collection::class, 'collection_id');

            // BRANDS: Filtrar marcas según el contexto
            if (!empty($selectedTags)) {
                // FILTRADO DINÁMICO POR TAGS: Solo mostrar marcas de productos que tienen el tag seleccionado
                $brandBuilder = clone $originalBuilder;
                $brandBuilder->whereIn('item_tag.tag_id', $selectedTags);
                $brands = Item::getForeign($brandBuilder, Brand::class, 'brand_id');
            } elseif ($parentCategoryId && !in_array('brand_id', $filterSequence)) {
                // Si hay subcategoría seleccionada, filtrar marcas por la categoría padre
                $brandBuilder = clone $originalBuilder;
                Log::info('Filtrando marcas por categoría padre de subcategoría', ['parent_category_id' => $parentCategoryId]);
                
                $brandBuilder->whereIn('items.category_id', [$parentCategoryId]);
                
                // Debug: Ver la query SQL que se está generando
                Log::info('Query SQL para marcas filtradas por categoría padre', [
                    'sql' => $brandBuilder->toSql(),
                    'bindings' => $brandBuilder->getBindings()
                ]);
                
                // Debug: Contar items antes del getForeign
                $itemCount = $brandBuilder->count();
                Log::info('Items encontrados en categoría padre', ['count' => $itemCount]);
                
                $brands = Item::getForeign($brandBuilder, Brand::class, 'brand_id');
                Log::info('Marcas encontradas para categoría padre', [
                    'brands_count' => $brands->count(),
                    'brands_data' => $brands->toArray()
                ]);
            } elseif (!empty($selectedCategories) && !in_array('brand_id', $filterSequence)) {
                // Si hay categorías seleccionadas directamente, filtrar marcas por esas categorías
                $brandBuilder = clone $originalBuilder;
                Log::info('Filtrando marcas por categorías seleccionadas', ['categories' => $selectedCategories]);
                
                if (!empty($selectedCategories)) {
                    Log::info('CategoryIds para filtrar marcas', ['categoryIds' => $selectedCategories]);
                    $brandBuilder->whereIn('items.category_id', $selectedCategories);
                    
                    // Debug: Ver la query SQL que se está generando
                    Log::info('Query SQL para marcas filtradas', [
                        'sql' => $brandBuilder->toSql(),
                        'bindings' => $brandBuilder->getBindings()
                    ]);
                    
                    // Debug: Contar items antes del getForeign
                    $itemCount = $brandBuilder->count();
                    Log::info('Items encontrados con esas categorías', ['count' => $itemCount]);
                }
                
                $brands = Item::getForeign($brandBuilder, Brand::class, 'brand_id');
                Log::info('Marcas encontradas después del filtro', [
                    'brands_count' => $brands->count(),
                    'brands_data' => $brands->toArray()
                ]);
            } else {
                Log::info('No se filtran marcas - usando query original', [
                    'selectedCategories_empty' => empty($selectedCategories),
                    'brand_id_in_sequence' => in_array('brand_id', $filterSequence),
                    'filterSequence' => $filterSequence,
                    'parentCategoryId' => $parentCategoryId
                ]);
                $brands = in_array('brand_id', $filterSequence)
                    ? Item::getForeign($originalBuilder, Brand::class, 'brand_id')
                    : Item::getForeign($i4brand, Brand::class, 'brand_id');
            }

            // CATEGORIAS: lógica mejorada con filtros cruzados
            if (!empty($selectedTags)) {
                // FILTRADO DINÁMICO POR TAGS: Solo mostrar categorías de productos que tienen el tag seleccionado
                $catBuilder = clone $originalBuilder;
                $catBuilder->whereIn('item_tag.tag_id', $selectedTags);
                $categories = Item::getForeign($catBuilder, Category::class, 'category_id');
            } elseif ($parentCategoryId) {
                // Si hay una subcategoría seleccionada, solo mostrar la categoría padre
                $parentCategory = Category::where('id', $parentCategoryId)
                    ->where('status', true)
                    ->where('visible', true)
                    ->first();
                $categories = $parentCategory ? collect([$parentCategory]) : collect([]);
            } elseif (!empty($selectedBrands) && !in_array('category_id', $filterSequence)) {
                // Si hay marcas seleccionadas pero no categorías en secuencia, filtrar categorías por marcas
                $catBuilder = clone $originalBuilder;
                
                $brandIds = [];
                foreach ($selectedBrands as $brandValue) {
                    if (is_numeric($brandValue)) {
                        $brandIds[] = $brandValue;
                    } else {
                        $brand = Brand::where('slug', $brandValue)->first();
                        if ($brand) {
                            $brandIds[] = $brand->id;
                        }
                    }
                }
                if (!empty($brandIds)) {
                    $catBuilder->whereIn('brand_id', $brandIds);
                }
                
                $categories = Item::getForeign($catBuilder, Category::class, 'category_id');
            } else {
                // Lógica normal - todas las categorías disponibles
                $categories = in_array('category_id', $filterSequence)
                    ? Item::getForeign($originalBuilder, Category::class, 'category_id')
                    : Item::getForeign($i4category, Category::class, 'category_id');
            }

            // SUBCATEGORIAS: lógica mejorada con filtros cruzados
            if (!empty($selectedTags)) {
                // FILTRADO DINÁMICO POR TAGS: Solo mostrar subcategorías de productos que tienen el tag seleccionado
                $subcatBuilder = clone $originalBuilder;
                $subcatBuilder->whereIn('item_tag.tag_id', $selectedTags);
                $subcategories = Item::getForeign($subcatBuilder, SubCategory::class, 'subcategory_id');
            } elseif ($parentCategoryId) {
                // Si hay una subcategoría seleccionada, mostrar todas las subcategorías de la categoría padre
                $subcatBuilder = clone $originalBuilder;
                
                // Obtener todas las subcategorías de la categoría padre
                $siblingSubcategoryIds = SubCategory::where('category_id', $parentCategoryId)
                    ->where('status', true)
                    ->where('visible', true)
                    ->pluck('id')
                    ->toArray();
                
                if (!empty($siblingSubcategoryIds)) {
                    $subcatBuilder->whereIn('subcategory_id', $siblingSubcategoryIds);
                    $subcategories = Item::getForeign($subcatBuilder, SubCategory::class, 'subcategory_id');
                } else {
                    $subcategories = collect([]);
                }
            } elseif (in_array('subcategory_id', $filterSequence) || !empty($selectedBrands) || !empty($selectedCategories)) {
                // Filtrar subcategorías cuando hay otros filtros activos
                $subcatBuilder = clone $originalBuilder;
                
                // Aplicar filtro de marcas si existe
                if (!empty($selectedBrands)) {
                    $brandIds = [];
                    foreach ($selectedBrands as $brandValue) {
                        if (is_numeric($brandValue)) {
                            $brandIds[] = $brandValue;
                        } else {
                            $brand = Brand::where('slug', $brandValue)->first();
                            if ($brand) {
                                $brandIds[] = $brand->id;
                            }
                        }
                    }
                    if (!empty($brandIds)) {
                        $subcatBuilder->whereIn('brand_id', $brandIds);
                    }
                }
                
                // Aplicar filtro de categorías si existe
                if (!empty($selectedCategories)) {
                    $categoryIds = [];
                    foreach ($selectedCategories as $categoryValue) {
                        if (is_numeric($categoryValue)) {
                            $categoryIds[] = $categoryValue;
                        } else {
                            $category = Category::where('slug', $categoryValue)->first();
                            if ($category) {
                                $categoryIds[] = $category->id;
                            }
                        }
                    }
                    if (!empty($categoryIds)) {
                        $subcatBuilder->whereIn('category_id', $categoryIds);
                    }
                }
                
                // Aplicar filtro de colecciones si existe
                if (!empty($selectedCollections)) {
                    $collectionIds = [];
                    foreach ($selectedCollections as $collectionValue) {
                        if (is_numeric($collectionValue)) {
                            $collectionIds[] = $collectionValue;
                        } else {
                            $collection = Collection::where('slug', $collectionValue)->first();
                            if ($collection) {
                                $collectionIds[] = $collection->id;
                            }
                        }
                    }
                    if (!empty($collectionIds)) {
                        $subcatBuilder->whereIn('collection_id', $collectionIds);
                    }
                }
                
                $subcategories = Item::getForeign($subcatBuilder, SubCategory::class, 'subcategory_id');
            } else {
                $subcategories = Item::getForeign($i4subcategory, SubCategory::class, 'subcategory_id');
            }
           
            // 5. TAGS: usar originalBuilder (independientes por ahora)
            $tags = Item::getForeignMany($originalBuilder, ItemTag::class, Tag::class);
            
            return [
                'priceRanges' => $ranges,
                'collections' => $collections,
                'categories' => $categories,
                'subcategories' => $subcategories,
                'brands' => $brands,
                'tags' => $tags
            ];
        } catch (\Throwable $th) {
            // //dump($th->getMessage());
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
        ////dump($request->all());
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

            ////dump($combos);

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
            ////dump($result);
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

            ////dump($combos);

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

            ////dump($result);

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
        ////dump($request->all());
        $product = Item::findOrFail($request->id); // Asegúrate de que el modelo sea el correcto
        if (!$product) {
            return response()->json(['error' => 'Producto no encontrado'], 404);
        }
        $product->increment('views'); // Incrementa en 1
        return response()->json(['success' => true, 'views' => $product->views]);
    }

    public function relationsItems(Request $request): HttpResponse | ResponseFactory
    {
        ////dump($request->all());
        $response = new Response();
        try {
            // Validar el ID del producto
            $request->validate([
                'id' => 'required',
            ]);

            // Obtener el producto principal
            $product = Item::findOrFail($request->id);
            ////dump($product);
            // Obtener productos de la misma categoría (excluyendo el producto principal)
            $relatedItems = Item::where('category_id', $product->category_id)
                ->where('id', '!=', $product->id) // Excluir el producto actual
                ->with(['category', 'brand']) // Cargar relaciones necesarias
                ->take(10) // Limitar a 10 productos
                ->get();
            ////dump($relatedItems);

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
    
    /**
     * Agregar scope para productos más vendidos (mediante joins con sale_details)
     */
    public function scopeBestSellers($query, $limit = null)
    {
        $query = $query->select(['items.*', DB::raw('COALESCE(SUM(sale_details.quantity), 0) as total_sold')])
            ->leftJoin('sale_details', 'items.id', '=', 'sale_details.item_id')
            ->leftJoin('sales', function($join) {
                $join->on('sale_details.sale_id', '=', 'sales.id')
                     ->where('sales.payment_status', '=', 'pagado'); // Solo ventas confirmadas
            })
            ->groupBy('items.id')
            ->orderBy('total_sold', 'DESC');
            
        if ($limit) {
            $query->limit($limit);
        }
        
        return $query;
    }
    
    /**
     * Scope para productos con mejor descuento 
     */
    public function scopeBestDiscounts($query, $limit = null)
    {
        $query = $query->where('discount_percent', '>', 0)
            ->orderBy('discount_percent', 'DESC');
            
        if ($limit) {
            $query->limit($limit);
        }
        
        return $query;
    }
    
    /**
     * Scope para productos más vistos
     */
    public function scopeMostViewed($query, $limit = null)
    {
        $query = $query->where('views', '>', 0)
            ->orderBy('views', 'DESC');
            
        if ($limit) {
            $query->limit($limit);
        }
        
        return $query;
    }
    
    /**
     * Get most sold products
     */
    public function mostSold(Request $request)
    {
        $response = new Response();
        try {
            $limit = $request->input('limit', 10);
            
            $products = Item::select(['items.*', DB::raw('COALESCE(SUM(sale_details.quantity), 0) as total_sold')])
                ->leftJoin('sale_details', 'items.id', '=', 'sale_details.item_id')
                ->leftJoin('sales', function($join) {
                    $join->on('sale_details.sale_id', '=', 'sales.id')
                         ->where('sales.payment_status', '=', 'pagado');
                })
                ->where('items.status', true)
                ->where('items.visible', true)
                ->groupBy('items.id')
                ->having('total_sold', '>', 0)
                ->orderBy('total_sold', 'DESC')
                ->limit($limit)
                ->get();

            $response->status = 200;
            $response->message = 'Productos más vendidos obtenidos correctamente';
            $response->data = $products;
        } catch (\Throwable $th) {
            $response->status = 400;
            $response->message = $th->getMessage();
        }

        return response($response->toArray(), $response->status);
    }
    
    /**
     * Get most viewed products
     */
    public function mostViewed(Request $request)
    {
        $response = new Response();
        try {
            $limit = $request->input('limit', 10);
            
            $products = Item::where('status', true)
                ->where('visible', true)
                ->where('views', '>', 0)
                ->orderBy('views', 'DESC')
                ->limit($limit)
                ->get();

            $response->status = 200;
            $response->message = 'Productos más visitados obtenidos correctamente';
            $response->data = $products;
        } catch (\Throwable $th) {
            $response->status = 400;
            $response->message = $th->getMessage();
        }

        return response($response->toArray(), $response->status);
    }
    
    /**
     * Get products with best discounts
     */
    public function bestDiscounts(Request $request)
    {
        $response = new Response();
        try {
            $limit = $request->input('limit', 10);
            
            $products = Item::where('status', true)
                ->where('visible', true)
                ->where('discount_percent', '>', 0)
                ->orderBy('discount_percent', 'DESC')
                ->limit($limit)
                ->get();

            $response->status = 200;
            $response->message = 'Productos con mejores descuentos obtenidos correctamente';
            $response->data = $products;
        } catch (\Throwable $th) {
            $response->status = 400;
            $response->message = $th->getMessage();
        }        return response($response->toArray(), $response->status);
    }

    /**
     * Override paginate to handle special sorting for products
     */
    public function paginate(Request $request): HttpResponse|ResponseFactory
    {
        $response = new dxResponse();
        try {
            $withRelations = $request->has('with') ? explode(',', $request->with) : [];
            $instance = $this->setPaginationInstance($request, $this->model)->with($withRelations);
            $originalInstance = clone $instance;

            if ($request->group != null) {
                [$grouping] = $request->group;
                $selector = $grouping['selector'];
                if ($this->prefix4filter && !str_contains($selector, '.')) {
                    $selector = $this->prefix4filter . '.' . $selector;
                }
                $instance = $instance->select([
                    DB::raw("{$selector} AS 'key'")
                ])->groupBy($selector);
            }

            if (Auth::check()) {
                $table = $this->prefix4filter ? $this->prefix4filter : (new $this->model)->getTable();
                if (Schema::hasColumn($table, 'status')) {
                    $instance->whereNotNull($this->prefix4filter ? $this->prefix4filter . '.status' : 'status');
                }
            }

            if ($request->filter) {
                $instance->where(function ($query) use ($request) {
                    dxDataGrid::filter($query, $request->filter ?? [], false, $this->prefix4filter);
                });
            }

            // Custom filter handling for tags
            if ($request->tag_id) {
                $tagIds = is_array($request->tag_id) ? $request->tag_id : [$request->tag_id];
                $instance->whereIn('items.id', function($query) use ($tagIds) {
                    $query->select('item_id')
                          ->from('item_tags')
                          ->whereIn('tag_id', $tagIds);
                });
            }

            // CUSTOM SORTING LOGIC FOR PRODUCTS
            if ($request->group == null) {
                if ($request->sort != null) {
                    foreach ($request->sort as $sorting) {
                        $selector = $sorting['selector'];
                        $desc = $sorting['desc'] ? 'DESC' : 'ASC';
                        
                        switch ($selector) {
                            case 'most_sold':
                                // Para productos más vendidos, necesitamos hacer JOIN con sale_details y sales
                                $instance = $instance->leftJoin('sale_details as sd', 'items.id', '=', 'sd.item_id')
                                    ->leftJoin('sales as s', function($join) {
                                        $join->on('sd.sale_id', '=', 's.id')
                                             ->where('s.payment_status', '=', 'pagado');
                                    })
                                    ->selectRaw('items.*, COALESCE(SUM(sd.quantity), 0) as total_sold')
                                    ->groupBy([
                                        'items.id', 'items.slug', 'items.name', 'items.summary', 'items.description',
                                        'items.price', 'items.discount', 'items.final_price', 'items.discount_percent',
                                        'items.banner', 'items.image', 'items.category_id', 'items.subcategory_id',
                                        'items.brand_id', 'items.is_new', 'items.offering', 'items.recommended',
                                        'items.featured', 'items.visible', 'items.status', 'items.created_at',
                                        'items.updated_at', 'items.sku', 'items.stock', 'items.url', 'items.views',
                                        'items.collection_id', 'items.color', 'items.texture'
                                    ])
                                    ->orderBy('total_sold', $desc);
                                break;
                                
                            case 'best_discount':
                                // Para mejores descuentos, mostrar solo productos con descuento
                                $instance = $instance->where('items.discount_percent', '>', 0)
                                    ->orderBy('items.discount_percent', $desc);
                                break;
                                
                            case 'most_viewed':
                            case 'views':
                                // Para más visitados, ordenar por views
                                $instance = $instance->orderBy('items.views', $desc);
                                break;
                                
                            case 'discount_percent':
                                // Ordenar por porcentaje de descuento
                                $instance = $instance->orderBy('items.discount_percent', $desc);
                                break;
                                
                            case 'offering':
                                // Productos en oferta (con descuento > 0) primero
                                $instance = $instance->orderByRaw('CASE WHEN items.discount_percent > 0 THEN 0 ELSE 1 END ASC')
                                    ->orderBy('items.discount_percent', 'DESC');
                                break;
                                
                            case 'is_new':
                                // Productos nuevos primero
                                $instance = $instance->orderByRaw('CASE WHEN items.is_new = 1 THEN 0 ELSE 1 END ASC')
                                    ->orderBy('items.created_at', 'DESC');
                                break;
                                
                            case 'featured':
                                // Productos destacados primero
                                $instance = $instance->orderByRaw('CASE WHEN items.featured = 1 THEN 0 ELSE 1 END ASC')
                                    ->orderBy('items.created_at', 'DESC');
                                break;
                                
                            case 'recommended':
                                // Productos recomendados primero
                                $instance = $instance->orderByRaw('CASE WHEN items.recommended = 1 THEN 0 ELSE 1 END ASC')
                                    ->orderBy('items.created_at', 'DESC');
                                break;
                                
                            default:
                                // Ordenamiento estándar
                                if ($this->prefix4filter && !str_contains($selector, '.')) {
                                    $selector = $this->prefix4filter . '.' . $selector;
                                }
                                $instance = $instance->orderBy($selector, $desc);
                                break;
                        }
                        
                        // Solo aplicamos el primer criterio de ordenación para evitar conflictos
                        break;
                    }
                } else {
                    $instance->orderBy($this->prefix4filter ? $this->prefix4filter . '.id' : 'id', 'ASC');
                }
            }

            $totalCount = 0;
            if ($request->requireTotalCount) {
                $instance4count = clone $instance;
                $instance4count->getQuery()->groups = null;
                if ($request->group != null) {
                    $selector = $request->group[0]['selector'];
                    if ($this->prefix4filter && !str_contains($selector, '.')) {
                        $selector = $this->prefix4filter . '.' . $selector;
                    }
                    $totalCount = $instance4count->distinct()->count(DB::raw($selector));
                } else {
                    if ($this->prefix4filter) {
                        $totalCount = $instance4count->distinct()->count($this->prefix4filter . '.id');
                    } else {
                        $totalCount = $instance4count->distinct()->count('id');
                    }
                }
            }

            $jpas = $request->isLoadingAll
                ? $instance->get()
                : $instance->skip($request->skip ?? 0)->take($request->take ?? 10)->get();

            $response->status = 200;
            $response->message = 'Operación correcta';
            $response->data = $jpas;
            $response->summary = $this->setPaginationSummary($request, $instance, $originalInstance);
            $response->totalCount = $totalCount;

        } catch (\Throwable $th) {
            $response->message = $th->getMessage() . ' Ln.' . $th->getLine();
        } finally {
            return response($response->toArray(), $response->status);
        }
    }

    /**
     * Convert slugs to IDs for filters
     */
    public function convertSlugsToIds(Request $request)
    {
        $response = new Response();
        try {
            $result = [];
            
            // Convert category slugs to IDs
           
            if ($request->has('category_slugs') && !empty($request->category_slugs)) {
                $categorySlugs = is_array($request->category_slugs) ? $request->category_slugs : explode(',', $request->category_slugs);
                $categoryIds = Category::whereIn('slug', $categorySlugs)->pluck('id')->toArray();
                $result['category_ids'] = $categoryIds;
            }
            
            // Convert brand slugs to IDs
            if ($request->has('brand_slugs') && !empty($request->brand_slugs)) {
                $brandSlugs = is_array($request->brand_slugs) ? $request->brand_slugs : explode(',', $request->brand_slugs);
                $brandIds = Brand::whereIn('slug', $brandSlugs)->pluck('id')->toArray();
                $result['brand_ids'] = $brandIds;
            }
            
            // Convert subcategory slugs to IDs
            if ($request->has('subcategory_slugs') && !empty($request->subcategory_slugs)) {
           
                $subcategorySlugs = is_array($request->subcategory_slugs) ? $request->subcategory_slugs : explode(',', $request->subcategory_slugs);
            
                $subcategoryIds = SubCategory::whereIn('slug', $subcategorySlugs)->pluck('id')->toArray();
              
                $result['subcategory_ids'] = $subcategoryIds; // Devolver el array completo, no solo el primer elemento
            }
            
            // Convert collection slugs to IDs
            if ($request->has('collection_slugs') && !empty($request->collection_slugs)) {
                $collectionSlugs = is_array($request->collection_slugs) ? $request->collection_slugs : explode(',', $request->collection_slugs);
                $collectionIds = Collection::whereIn('slug', $collectionSlugs)->pluck('id')->toArray();
                $result['collection_ids'] = $collectionIds;
            }
            
            $response->status = 200;
            $response->message = 'Slugs convertidos correctamente';
            $response->data = $result;
        } catch (\Throwable $th) {
            $response->status = 400;
            $response->message = $th->getMessage();
        }
        
        return response($response->toArray(), $response->status);
    }

    /**
     * Get tags that have visible and active products
     */
    public function getTags()
    {
        $response = new Response();

        try {
            $tags = DB::table('tags')
                ->join('item_tags', 'tags.id', '=', 'item_tags.tag_id')
                ->join('items', 'item_tags.item_id', '=', 'items.id')
                ->where('tags.status', true)
                ->where('tags.visible', true)
                ->where('items.status', true)
                ->where('items.visible', true)
                // Solo tags activos: permanentes (sin fechas) o promocionales activos
                ->where(function($query) {
                    $query->where('tags.promotional_status', 'permanent')
                          ->orWhere('tags.promotional_status', 'active');
                })
                ->select(
                    'tags.id', 
                    'tags.name', 
                    'tags.description',
                    'tags.icon',
                    'tags.background_color',
                    'tags.text_color',
                    'tags.image',
                    'tags.promotional_status',
                    'tags.start_date',
                    'tags.end_date',
                    DB::raw('COUNT(items.id) as items_count')
                )
                ->groupBy(
                    'tags.id', 
                    'tags.name', 
                    'tags.description',
                    'tags.icon',
                    'tags.background_color',
                    'tags.text_color',
                    'tags.image',
                    'tags.promotional_status',
                    'tags.start_date',
                    'tags.end_date'
                )
                ->having('items_count', '>', 0)
                ->orderBy('tags.promotional_status', 'desc') // Promocionales primero (active viene antes que permanent alfabéticamente)
                ->orderBy('tags.name')
                ->get();

            $response->status = 200;
            $response->message = 'Tags activos obtenidos correctamente';
            $response->data = $tags;

        } catch (\Throwable $th) {
            $response->status = 400;
            $response->message = $th->getMessage() . ' Ln.' . $th->getLine();
        } finally {
            return response($response->toArray(), $response->status);
        }
    }
}
