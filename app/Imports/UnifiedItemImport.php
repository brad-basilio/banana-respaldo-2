<?php

namespace App\Imports;

use App\Models\Item;
use App\Models\Category;
use App\Models\SubCategory;
use App\Models\Collection;
use App\Models\Brand;
use App\Models\ItemSpecification;
use App\Models\ItemImage;
use Exception;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Validators\Failure;
use Illuminate\Support\Str;
use SoDe\Extend\Crypto;
use Throwable;
use Illuminate\Support\Facades\Log;

class UnifiedItemImport implements ToModel, WithHeadingRow, SkipsOnError, SkipsOnFailure
{
    use \Maatwebsite\Excel\Concerns\Importable;
    
    private $errors = [];
    private $fieldMappings = [];
    private $truncateMode = true;

    /**
     * Constructor con configuración flexible
     * 
     * @param array $options Opciones de configuración:
     *   - truncate: bool - Si debe limpiar las tablas (default: true)
     *   - fieldMappings: array - Mapeo de campos alternativos
     */
    public function __construct(array $options = [])
    {
        $this->truncateMode = $options['truncate'] ?? true;
        $this->fieldMappings = $options['fieldMappings'] ?? $this->getDefaultFieldMappings();
        
        if ($this->truncateMode) {
            $this->truncateTables();
        }
    }

    /**
     * Configuración de mapeo de campos por defecto
     * Permite usar diferentes nombres de columnas para el mismo campo
     */
    private function getDefaultFieldMappings(): array
    {
        return [
            'collection' => ['collection', 'colleccion', 'coleccion'],
            'categoria' => ['categoria', 'category'],
            'summary' => ['summary', 'resumen', 'descripcion_corta'],
            'subcategoria' => ['subcategoria', 'subcategory', 'sub_categoria'],
            'marca' => ['marca', 'brand'],
            'sku' => ['sku', 'codigo', 'code'],
            'nombre_producto' => ['nombre_de_producto', 'nombre_producto', 'name', 'producto'],
            'descripcion' => ['descripcion', 'description'],
            'precio' => ['precio', 'price'],
            'descuento' => ['descuento', 'discount', 'precio_descuento'],
            'stock' => ['stock', 'cantidad', 'inventory'],
            'color' => ['color', 'colour'],
            'talla' => ['size', 'talla', 'size_talla'],
            'agrupador' => ['agrupador'],
            'especificaciones_principales' => [
                'especificaciones_principales_separadas_por_comas',
                'especificaciones_principales',
                'specs_principales'
            ],
            'especificaciones_generales' => [
                'especificaciones_generales_separado_por_comas_y_dos_puntos',
                'especificaciones_generales',
                'specs_generales'
            ],
            'especificaciones_tecnicas' => [
                'especificaciones_tecnicas_separado_por_slash_para_filas_y_dos_puntos_para_columnas',
                'especificaciones_tecnicas',
                'specs_tecnicas'
            ],
            'especificaciones_iconos' => [
                'especificaciones_iconos_separado_por_comas',
                'especificaciones_iconos',
                'specs_iconos'
            ]
        ];
    }

    /**
     * Truncar tablas de forma segura
     */
    private function truncateTables(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Orden de truncate respetando dependencias
        ItemImage::truncate();
        ItemSpecification::truncate();
        Item::truncate();
        SubCategory::truncate();
        Collection::truncate();
        // Category::truncate();
        Brand::truncate();
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    /**
     * Obtener valor de campo usando mapeos alternativos
     */
    private function getFieldValue(array $row, string $fieldKey, $default = null)
    {
        $possibleKeys = $this->fieldMappings[$fieldKey] ?? [$fieldKey];
        
        foreach ($possibleKeys as $key) {
            if (array_key_exists($key, $row) && !is_null($row[$key]) && trim(strval($row[$key])) !== '') {
                return trim(strval($row[$key]));
            }
        }
        
        return $default;
    }

    /**
     * Verificar si existe al menos uno de los campos mapeados
     */
    private function hasField(array $row, string $fieldKey): bool
    {
        $possibleKeys = $this->fieldMappings[$fieldKey] ?? [$fieldKey];
        
        foreach ($possibleKeys as $key) {
            if (array_key_exists($key, $row) && !is_null($row[$key]) && trim(strval($row[$key])) !== '') {
                return true;
            }
        }
        
        return false;
    }

    public function model(array $row)
    {
        try {
            // Verificar si la fila está vacía
            if ($this->isRowEmpty($row)) {
                return null;
            }

            // Obtener datos básicos del producto
            $sku = $this->getFieldValue($row, 'sku');
            $nombreProducto = $this->getFieldValue($row, 'nombre_producto');
            
            if (!$sku || !$nombreProducto) {
                throw new Exception("SKU y nombre del producto son requeridos");
            }

            // 1️⃣ Crear/obtener categoría (requerida)
            $categoria = $this->getFieldValue($row, 'categoria');
            if (!$categoria) {
                throw new Exception("La categoría es requerida");
            }
            
            $category = Category::firstOrCreate(
                ['name' => $categoria],
                ['slug' => Str::slug($categoria)]
            );

            // 2️⃣ Crear/obtener subcategoría (opcional)
            $subCategory = null;
            if ($this->hasField($row, 'subcategoria')) {
                $subcategoria = $this->getFieldValue($row, 'subcategoria');
                if ($subcategoria) {
                    $subCategorySlug = Str::slug($subcategoria);
                    $slugExists = SubCategory::where('slug', $subCategorySlug)->exists();
                    if ($slugExists) {
                        $subCategorySlug = $subCategorySlug . '-' . Crypto::short();
                    }
                    
                    $subCategory = SubCategory::firstOrCreate(
                        ['name' => $subcategoria, 'category_id' => $category->id],
                        ['slug' => $subCategorySlug]
                    );
                }
            }

            // 3️⃣ Crear/obtener colección (opcional)
            $collection = null;
            if ($this->hasField($row, 'collection')) {
                $collectionName = $this->getFieldValue($row, 'collection');
                if ($collectionName) {
                    $collection = Collection::firstOrCreate(
                        ['name' => $collectionName],
                        ['slug' => Str::slug($collectionName)]
                    );
                }
            }

            // 4️⃣ Crear/obtener marca (opcional)
            $brand = null;
            if ($this->hasField($row, 'marca')) {
                $marca = $this->getFieldValue($row, 'marca');
                if ($marca) {
                    $brand = Brand::firstOrCreate(
                        ['name' => $marca],
                        ['slug' => Str::slug($marca)]
                    );
                }
            }

            // 5️⃣ Generar slug único para el producto
            $slug = $this->generateUniqueSlug($nombreProducto, $this->getFieldValue($row, 'color'), $this->getFieldValue($row, 'talla'));

            // 6️⃣ Preparar datos del precio
            $precio = $this->getNumericValue($row, 'precio');
            $descuento = $this->getNumericValue($row, 'descuento');
            $finalPrice = $this->calculateFinalPrice($precio, $descuento);
            $discountPercent = $this->calculateDiscountPercent($precio, $descuento);

            // 7️⃣ Crear el producto
            $itemData = [
                'sku' => $sku,
                'grouper' => $this->getFieldValue($row, 'agrupador', ''),
                'name' => $nombreProducto,
                'description' => $this->getFieldValue($row, 'descripcion', ''),
                'summary' => $this->getFieldValue($row, 'summary', ''),
                'price' => $precio ?? 0,
                'discount' => $descuento,
                'final_price' => $finalPrice,
                'discount_percent' => $discountPercent,
                'category_id' => $category->id,
                'subcategory_id' => $subCategory ? $subCategory->id : null,
                'collection_id' => $collection ? $collection->id : null,
                'brand_id' => $brand ? $brand->id : null,
                'image' => $this->getMainImage($row, 'sku'),
                'slug' => $slug,
                'stock' => $this->getNumericValue($row, 'stock', 10),
                'pdf' => $this->getPdfFile($sku),
            ];

            // Agregar campos opcionales si existen
            if ($this->hasField($row, 'color')) {
                $itemData['color'] = $this->getFieldValue($row, 'color');
            }

            if ($this->hasField($row, 'talla')) {
                $itemData['talla'] = $this->getFieldValue($row, 'talla');
            }

            $item = Item::create($itemData);

            if ($item) {
                // 8️⃣ Guardar especificaciones si existen
                $this->saveSpecificationsIfExists($item, $row);
                
                // 9️⃣ Guardar imágenes de galería
                $this->saveGalleryImages($item, $row, 'sku');
            } else {
                throw new Exception("No se pudo crear el producto con SKU: {$sku}");
            }

            return $item;

        } catch (\Exception $e) {
            $errorMessage = sprintf(
                "Error al procesar fila con SKU '%s': %s (Línea: %s, Archivo: %s)",
                $this->getFieldValue($row, 'sku', 'sin SKU'),
                $e->getMessage(),
                $e->getLine(),
                basename($e->getFile())
            );
            
            $this->addError($errorMessage);
            
            // Log detallado para debugging
            Log::error($errorMessage, [
                'row_data' => $row,
                'trace' => $e->getTraceAsString()
            ]);
            
            return null;
        }
    }

    /**
     * Obtener valor numérico de un campo
     */
    private function getNumericValue(array $row, string $fieldKey, $default = null)
    {
        $value = $this->getFieldValue($row, $fieldKey);
        
        if (is_null($value) || $value === '') {
            return $default;
        }
        
        // Limpiar el valor (remover espacios, comas, etc.)
        $cleanValue = preg_replace('/[^\d.-]/', '', $value);
        
        return is_numeric($cleanValue) ? (float)$cleanValue : $default;
    }

    /**
     * Calcular precio final
     */
    private function calculateFinalPrice($precio, $descuento): float
    {
        if ($descuento && $descuento > 0 && $descuento < $precio) {
            return $descuento;
        }
        
        return $precio ?? 0;
    }

    /**
     * Calcular porcentaje de descuento
     */
    private function calculateDiscountPercent($precio, $descuento): int
    {
        if ($descuento && $descuento > 0 && $precio && $precio > 0 && $descuento < $precio) {
            return round((100 - ($descuento / $precio) * 100));
        }
        
        return 0;
    }

    /**
     * Generar slug único para el producto
     */
    private function generateUniqueSlug(string $nombre, ?string $color = null, ?string $talla = null): string
    {
        $baseSlug = Str::slug($nombre . ($color ? '-' . $color : '') . '-' . ($talla ? '-' . $talla : ''));
        $slug = $baseSlug;
        
        $counter = 1;
        while (Item::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . ($counter > 1 ? $counter : Crypto::short());
            $counter++;
        }
        
        return $slug;
    }

    /**
     * Guardar especificaciones si existen en la fila
     */
    private function saveSpecificationsIfExists(Item $item, array $row): void
    {
        // Especificaciones principales
        if ($this->hasField($row, 'especificaciones_principales')) {
            $specs = $this->getFieldValue($row, 'especificaciones_principales');
            $this->saveSpecifications($item, $specs, 'principal');
        }

        // Especificaciones generales
        if ($this->hasField($row, 'especificaciones_generales')) {
            $specs = $this->getFieldValue($row, 'especificaciones_generales');
            $this->saveSpecifications($item, $specs, 'general');
        }

        // Especificaciones técnicas
        if ($this->hasField($row, 'especificaciones_tecnicas')) {
            $specs = $this->getFieldValue($row, 'especificaciones_tecnicas');
            $this->saveSpecificationsTecnicas($item, $specs, 'tecnica');
        }

        // Especificaciones con iconos
        if ($this->hasField($row, 'especificaciones_iconos')) {
            $specs = $this->getFieldValue($row, 'especificaciones_iconos');
            $this->saveSpecificationsIcon($item, $specs, 'icono');
        }
    }

    /**
     * Guardar especificaciones principales y generales
     */
    private function saveSpecifications(Item $item, ?string $specs, string $type): void
    {
        if (empty($specs) || !is_string($specs)) {
            return;
        }

        $specsArray = explode(',', $specs);
        foreach ($specsArray as $spec) {
            $spec = trim($spec);
            if (empty($spec)) {
                continue;
            }
            
            if ($type === 'principal') {
                ItemSpecification::create([
                    'item_id' => $item->id,
                    'type' => $type,
                    'title' => $spec,
                    'description' => $spec,
                ]);
            } else {
                $parts = explode(':', $spec, 2);
                if (count($parts) == 2) {
                    $title = trim($parts[0]);
                    $description = trim($parts[1]);
                    ItemSpecification::create([
                        'item_id' => $item->id,
                        'type' => $type,
                        'title' => $title,
                        'description' => $description,
                    ]);
                }
            }
        }
    }

    /**
     * Guardar especificaciones técnicas (formato especial)
     */
    private function saveSpecificationsTecnicas(Item $item, ?string $specs, string $type): void
    {
        if (empty($specs)) {
            return;
        }
        
        // Formato: "titulo1,descripcion1/titulo2,descripcion2"
        $rows = explode('/', $specs);
        foreach ($rows as $row) {
            $parts = explode(':', $row, 2);
            if (count($parts) == 2) {
                $title = trim($parts[0]);
                $description = trim($parts[1]);
            } else {
                // Intentar con coma como separador
                $parts = explode(',', $row, 2);
                if (count($parts) == 2) {
                    $title = trim($parts[0]);
                    $description = trim($parts[1]);
                } else {
                    continue;
                }
            }
            
            if (!empty($title) && !empty($description)) {
                ItemSpecification::create([
                    'item_id' => $item->id,
                    'type' => $type,
                    'title' => $title,
                    'description' => $description,
                ]);
            }
        }
    }


    private function saveSpecificationsIcon(Item $item, ?string $specs, string $type): void
    {
        if (empty($specs) || !is_string($specs)) {
            return;
        }

        $specsArray = explode(',', $specs);
        foreach ($specsArray as $spec) {
            $spec = trim($spec);
            if (empty($spec)) {
                continue;
            }
            
            if ($type === 'icono') {
                ItemSpecification::create([
                    'item_id' => $item->id,
                    'type' => $type,
                    'title' => '',
                    'description' => $spec,
                ]);
            } else {
                $parts = explode(':', $spec, 2);
                if (count($parts) == 2) {
                    $title = trim($parts[0]);
                    $description = trim($parts[1]);
                    ItemSpecification::create([
                        'item_id' => $item->id,
                        'type' => $type,
                        'title' => $title,
                        'description' => $description,
                    ]);
                }
            }
        }
    }

    /**
     * Obtener imagen principal del producto
     */

    private function getMainImage(array $row, string $format): ?string
    {
        if ($format === 'agrupador') {
            $codigoagrupador = $this->getFieldValue($row, 'agrupador');
            $color = $this->getFieldValue($row, 'color');
            $images = $this->getColorNumberImages($codigoagrupador, $color);
        } else {
            $sku = $this->getFieldValue($row, 'sku');
            $images = $this->getSkuBasedImages($sku);
        }
        
        return $images[0] ?? null;
    }

    // private function getMainImage(string $sku): ?string
    // {
    //     $extensions = ['png', 'jpg', 'jpeg', 'webp'];
        
    //     // Buscar imagen principal (sku.ext)
    //     foreach ($extensions as $ext) {
    //         $path = "images/item/{$sku}.{$ext}";
    //         if (Storage::exists($path)) {
    //             return "{$sku}.{$ext}";
    //         }
    //     }

    //     // Buscar imagen con índice (sku_1.ext)
    //     foreach ($extensions as $ext) {
    //         $path = "images/item/{$sku}_1.{$ext}";
    //         if (Storage::exists($path)) {
    //             return "{$sku}_1.{$ext}";
    //         }
    //     }
        
    //     return null;
    // }

    

    /**
     * Guardar imágenes de galería
     */
    private function saveGalleryImages(Item $item, array $row, string $format): void
    {
        if ($format === 'agrupador') {
            $codigoagrupador = $this->getFieldValue($row, 'agrupador');
            $color = $this->getFieldValue($row, 'color');
            
            if (!$codigoagrupador || !$color) {
                $item->update(['visible' => false]);
                return;
            }
            
            $this->saveColorNumberImages($item, $codigoagrupador, $color);
        } else {
            $sku = $this->getFieldValue($row, 'sku');
            $this->saveSkuBasedImages($item, $sku);
        }
    }

    // Método para formato codigoagrupador_color_numero
    private function saveColorNumberImages(Item $item, string $codigoagrupador, string $color): void
    {
        $images = $this->getColorNumberImages($codigoagrupador, $color);
        
        if (empty($images)) {
            $item->update(['visible' => false]);
            return;
        }

        $item->update(['image' => $images[0]]);

        if (count($images) > 1) {
            foreach (array_slice($images, 1) as $image) {
                ItemImage::create([
                    'item_id' => $item->id,
                    'url' => $image,
                ]);
            }
        }
    }

    
    private function saveSkuBasedImages(Item $item, string $sku): void
    {
        $images = $this->getSkuBasedImages($sku);
        
        if (empty($images)) {
            $item->update(['visible' => false]);
            return;
        }

        $item->update(['image' => $images[0]]);

        if (count($images) > 1) {
            foreach (array_slice($images, 1) as $image) {
                ItemImage::create([
                    'item_id' => $item->id,
                    'url' => $image,
                ]);
            }
        }
    }

    /**
     * Obtener imágenes basadas en el formato codigoagrupador_color_numero
     */
    private function getColorNumberImages(string $codigoagrupador, string $color): array
    {
        $images = [];
        $basePath = "images/item/";
        $extensions = ['jpg', 'jpeg', 'png', 'webp'];
        
        // Imagen principal: codigoagrupador_color.ext
        $mainImageName = "{$codigoagrupador}_{$color}";
        foreach ($extensions as $ext) {
            if (Storage::exists("{$basePath}{$mainImageName}.{$ext}")) {
                $images[] = "{$mainImageName}.{$ext}";
                break;
            }
        }

        // Imágenes de galería: codigoagrupador_color_1.ext, etc.
        $i = 1;
        while (true) {
            $found = false;
            $galleryImageName = "{$codigoagrupador}_{$color}_{$i}";
            
            foreach ($extensions as $ext) {
                if (Storage::exists("{$basePath}{$galleryImageName}.{$ext}")) {
                    $images[] = "{$galleryImageName}.{$ext}";
                    $found = true;
                    break;
                }
            }
            
            if (!$found) break;
            $i++;
        }

        return $images;
    }

    /**
     * Obtener imágenes basadas en SKU
     */
    private function getSkuBasedImages(string $sku): array
    {
        $images = [];
        $basePath = "images/item/";
        $extensions = ['jpg', 'jpeg', 'png', 'webp'];
        
        // Imagen principal: sku.ext
        foreach ($extensions as $ext) {
            if (Storage::exists("{$basePath}{$sku}.{$ext}")) {
                $images[] = "{$sku}.{$ext}";
                break;
            }
        }

        // Imágenes de galería: sku_1.ext, etc.
        $i = 1;
        while (true) {
            $found = false;
            $galleryImageName = "{$sku}_{$i}";
            
            foreach ($extensions as $ext) {
                if (Storage::exists("{$basePath}{$galleryImageName}.{$ext}")) {
                    $images[] = "{$galleryImageName}.{$ext}";
                    $found = true;
                    break;
                }
            }
            
            if (!$found) break;
            $i++;
        }

        return $images;
    }
    

    // private function saveGalleryImages(Item $item, string $sku): void
    // {
    //     $extensions = ['png', 'jpg', 'jpeg', 'webp'];
        
    //     // Primero verificar si existe la imagen principal (sku.extension)
    //     $hasMainImage = false;
    //     foreach ($extensions as $ext) {
    //         if (Storage::exists("images/item/{$sku}.{$ext}")) {
    //             $hasMainImage = true;
    //             break;
    //         }
    //     }
        
    //     // Determinar el índice inicial
    //     $startIndex = $hasMainImage ? 1 : 2;
    //     $index = $startIndex;
        
    //     while (true) {
    //         $found = false;
            
    //         // Probar ambos formatos: _01 y _1
    //         $formats = [
    //             sprintf("_%02d", $index), // Formato _01, _02, etc.
    //             "_".$index                // Formato _1, _2, etc.
    //         ];
            
    //         foreach ($formats as $suffix) {
    //             foreach ($extensions as $ext) {
    //                 $filename = "{$sku}{$suffix}.{$ext}";
    //                 $path = "images/item/{$filename}";
                    
    //                 if (Storage::exists($path)) {
    //                     ItemImage::create([
    //                         'item_id' => $item->id,
    //                         'url' => $filename,
    //                     ]);
    //                     $found = true;
    //                     break 2; // Salir de ambos foreachs
    //                 }
    //             }
    //         }

    //         if (!$found) {
    //             break;
    //         }
    //         $index++;
    //     }
    // }
    

    // private function saveGalleryImages(Item $item, string $sku): void
    // {
    //     $extensions = ['png', 'jpg', 'jpeg', 'webp'];
    //     $index = 2; // Empezar desde _2 ya que _1 puede ser la imagen principal

    //     while (true) {
    //         $found = false;
            
    //         foreach ($extensions as $ext) {
    //             $filename = "{$sku}_{$index}.{$ext}";
    //             $path = "images/item/{$filename}";
                
    //             if (Storage::exists($path)) {
    //                 ItemImage::create([
    //                     'item_id' => $item->id,
    //                     'url' => $filename,
    //                 ]);
    //                 $found = true;
    //                 break;
    //             }
    //         }

    //         if (!$found) {
    //             break;
    //         }
    //         $index++;
    //     }
    // }

    /**
     * Verificar si una fila está vacía
     */
    private function isRowEmpty(array $row): bool
    {
        // Si no hay SKU, la fila está vacía
        if (!$this->hasField($row, 'sku')) {
            return true;
        }

        // Verificar si todas las columnas están vacías
        foreach ($row as $value) {
            if (!is_null($value) && trim(strval($value)) !== '') {
                return false;
            }
        }

        return true;
    }

    /**
     * Manejo de errores
     */
    public function onError(Throwable $e)
    {
        $this->addError("Error general: " . $e->getMessage());
    }

    public function onFailure(Failure ...$failures)
    {
        foreach ($failures as $failure) {
            $this->addError(sprintf(
                "Fila %d, Columna '%s': %s",
                $failure->row(),
                $failure->attribute(),
                implode(', ', $failure->errors())
            ));
        }
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    private function addError(string $message): void
    {
        $this->errors[] = $message;
    }

    /**
     * Configurar mapeos de campos personalizados
     */
    public function setFieldMappings(array $mappings): self
    {
        $this->fieldMappings = array_merge($this->fieldMappings, $mappings);
        return $this;
    }

    /**
     * Obtener mapeos de campos actuales
     */
    public function getFieldMappings(): array
    {
        return $this->fieldMappings;
    }

    /**
     * Obtener archivo PDF del producto basado en el SKU
     */
    private function getPdfFile(string $sku): ?string
    {
        $path = "images/item/{$sku}.pdf";
        
        if (Storage::exists($path)) {
            return "{$sku}.pdf";
        }
        
        return null;
    }
}
