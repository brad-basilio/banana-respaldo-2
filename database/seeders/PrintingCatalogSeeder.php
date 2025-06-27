<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Category;
use App\Models\SubCategory;
use App\Models\Item;
use App\Models\CanvasPreset;
use Illuminate\Support\Str;

class PrintingCatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Truncate tables in correct order to avoid foreign key constraints
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        Item::truncate();
        SubCategory::truncate();
        Category::truncate();
        CanvasPreset::truncate();
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Create Canvas Presets first
        $this->createCanvasPresets();
        
        // Create Categories
        $this->createCategories();
        
        // Create Subcategories
        $this->createSubcategories();
        
        // Create Items (Products)
        $this->createItems();
    }

    private function createCanvasPresets()
    {
        $presets = [
            // Photobook Presets
            [
                'name' => 'Photobook Cuadrado Metal 10x10 cm',
                'description' => 'Preset para photobook cuadrado con tapa de metal',
                'width' => 10.0,
                'height' => 10.0,
                'dpi' => 300,
                'pages' => 12,
                'background_color' => '#ffffff',
                'type' => 'photobook',
                'active' => true,
                'status' => '1',
                'extra_settings' => [
                    'binding' => 'metal',
                    'paper_type' => 'glossy',
                    'min_pages' => 12,
                    'max_pages' => 48
                ]
            ],
            [
                'name' => 'Photobook Cuadrado Madera 15x15 cm',
                'description' => 'Preset para photobook cuadrado con tapa de madera',
                'width' => 15.0,
                'height' => 15.0,
                'dpi' => 300,
                'pages' => 20,
                'background_color' => '#f5f5f0',
                'type' => 'photobook',
                'active' => true,
                'status' => '1',
                'extra_settings' => [
                    'binding' => 'wood',
                    'paper_type' => 'matte',
                    'min_pages' => 20,
                    'max_pages' => 60
                ]
            ],
            [
                'name' => 'Photobook A4 21x29 cm',
                'description' => 'Preset para photobook tamaño A4',
                'width' => 21.0,
                'height' => 29.0,
                'dpi' => 300,
                'pages' => 24,
                'background_color' => '#ffffff',
                'type' => 'photobook',
                'active' => true,
                'status' => '1',
                'extra_settings' => [
                    'binding' => 'hardcover',
                    'paper_type' => 'premium',
                    'min_pages' => 24,
                    'max_pages' => 100
                ]
            ],
            
            // Termo Presets
            [
                'name' => 'Termo Auto 19x8 cm',
                'description' => 'Preset para termo de auto',
                'width' => 19.0,
                'height' => 8.0,
                'dpi' => 300,
                'pages' => 1,
                'background_color' => '#ffffff',
                'type' => 'mug',
                'active' => true,
                'status' => '1',
                'extra_settings' => [
                    'material' => 'stainless_steel',
                    'capacity' => '450ml',
                    'print_area' => 'wrap_around'
                ]
            ],
            [
                'name' => 'Termo Digital 24x19 cm',
                'description' => 'Preset para termo digital',
                'width' => 24.0,
                'height' => 19.0,
                'dpi' => 300,
                'pages' => 1,
                'background_color' => '#ffffff',
                'type' => 'mug',
                'active' => true,
                'status' => '1',
                'extra_settings' => [
                    'material' => 'stainless_steel',
                    'capacity' => '500ml',
                    'print_area' => 'digital_display'
                ]
            ],
            
            // Llaveros Presets
            [
                'name' => 'Llavero Corazón 17x17 cm',
                'description' => 'Preset para llavero en forma de corazón',
                'width' => 17.0,
                'height' => 17.0,
                'dpi' => 300,
                'pages' => 1,
                'background_color' => '#ffffff',
                'type' => 'keychain',
                'active' => true,
                'status' => '1',
                'extra_settings' => [
                    'material' => 'acrylic',
                    'shape' => 'heart',
                    'thickness' => '3mm'
                ]
            ],
            [
                'name' => 'Llavero Cuadrado 20x20 cm',
                'description' => 'Preset para llavero cuadrado',
                'width' => 20.0,
                'height' => 20.0,
                'dpi' => 300,
                'pages' => 1,
                'background_color' => '#ffffff',
                'type' => 'keychain',
                'active' => true,
                'status' => '1',
                'extra_settings' => [
                    'material' => 'acrylic',
                    'shape' => 'square',
                    'thickness' => '3mm'
                ]
            ],
            
            // Puzzle Presets
            [
                'name' => 'Puzzle A5 14x21 cm',
                'description' => 'Preset para puzzle tamaño A5',
                'width' => 14.0,
                'height' => 21.0,
                'dpi' => 300,
                'pages' => 1,
                'background_color' => '#ffffff',
                'type' => 'puzzle',
                'active' => true,
                'status' => '1',
                'extra_settings' => [
                    'pieces' => 120,
                    'material' => 'cardboard',
                    'finish' => 'matte'
                ]
            ],
            [
                'name' => 'Puzzle A4 21x29 cm',
                'description' => 'Preset para puzzle tamaño A4',
                'width' => 21.0,
                'height' => 29.0,
                'dpi' => 300,
                'pages' => 1,
                'background_color' => '#ffffff',
                'type' => 'puzzle',
                'active' => true,
                'status' => '1',
                'extra_settings' => [
                    'pieces' => 200,
                    'material' => 'cardboard',
                    'finish' => 'matte'
                ]
            ],
            [
                'name' => 'Puzzle A3 30x40 cm',
                'description' => 'Preset para puzzle tamaño A3',
                'width' => 30.0,
                'height' => 40.0,
                'dpi' => 300,
                'pages' => 1,
                'background_color' => '#ffffff',
                'type' => 'puzzle',
                'active' => true,
                'status' => '1',
                'extra_settings' => [
                    'pieces' => 300,
                    'material' => 'cardboard',
                    'finish' => 'matte'
                ]
            ],
            
            // Magnético Presets
            [
                'name' => 'Imán 9x10 cm',
                'description' => 'Preset para imán pequeño',
                'width' => 9.0,
                'height' => 10.0,
                'dpi' => 300,
                'pages' => 1,
                'background_color' => '#ffffff',
                'type' => 'magnet',
                'active' => true,
                'status' => '1',
                'extra_settings' => [
                    'material' => 'flexible_magnet',
                    'thickness' => '0.7mm'
                ]
            ],
            [
                'name' => 'Imán 5x20 cm',
                'description' => 'Preset para imán rectangular',
                'width' => 5.0,
                'height' => 20.0,
                'dpi' => 300,
                'pages' => 1,
                'background_color' => '#ffffff',
                'type' => 'magnet',
                'active' => true,
                'status' => '1',
                'extra_settings' => [
                    'material' => 'flexible_magnet',
                    'thickness' => '0.7mm'
                ]
            ]
        ];

        foreach ($presets as $preset) {
            CanvasPreset::create($preset);
        }

        $this->command->info('Canvas Presets created successfully!');
    }

    private function createCategories()
    {
        $categories = [
            [
                'name' => 'Decoración',
                'slug' => 'decoracion',
                'description' => 'Productos decorativos personalizados para el hogar',
                'banner' => null,
                'image' => null,
                'featured' => true,
                'visible' => true,
                'status' => true,
            ],
            [
                'name' => 'Calendarios',
                'slug' => 'calendarios',
                'description' => 'Calendarios personalizados de diferentes tipos',
                'banner' => null,
                'image' => null,
                'featured' => true,
                'visible' => true,
                'status' => true,
            ],
            [
                'name' => 'Impresión Fotos',
                'slug' => 'impresion-fotos',
                'description' => 'Servicios de impresión de fotografías en diferentes formatos',
                'banner' => null,
                'image' => null,
                'featured' => true,
                'visible' => true,
                'status' => true,
            ],
            [
                'name' => 'Regalos',
                'slug' => 'regalos',
                'description' => 'Productos personalizados perfectos para regalar',
                'banner' => null,
                'image' => null,
                'featured' => true,
                'visible' => true,
                'status' => true,
            ],
            [
                'name' => 'Papelería',
                'slug' => 'papeleria',
                'description' => 'Productos de papelería personalizada',
                'banner' => null,
                'image' => null,
                'featured' => false,
                'visible' => true,
                'status' => true,
            ]
        ];

        foreach ($categories as $categoryData) {
            Category::create($categoryData);
        }

        $this->command->info('Categories created successfully!');
    }

    private function createSubcategories()
    {
        $decoracionId = Category::where('slug', 'decoracion')->first()->id;
        $regalosId = Category::where('slug', 'regalos')->first()->id;
        $impresionId = Category::where('slug', 'impresion-fotos')->first()->id;
        $papeleriaId = Category::where('slug', 'papeleria')->first()->id;

        $subcategories = [
            // Decoración
            [
                'category_id' => $decoracionId,
                'name' => 'Cuadro Metal',
                'slug' => 'cuadro-metal',
                'description' => 'Cuadros con marco de metal personalizados',
                'image' => null,
                'featured' => true,
                'visible' => true,
                'status' => true,
            ],
            [
                'category_id' => $decoracionId,
                'name' => 'Cuadro Madera',
                'slug' => 'cuadro-madera',
                'description' => 'Cuadros con marco de madera personalizados',
                'image' => null,
                'featured' => true,
                'visible' => true,
                'status' => true,
            ],
            
            // Regalos
            [
                'category_id' => $regalosId,
                'name' => 'Termo',
                'slug' => 'termo',
                'description' => 'Termos personalizados para diferentes usos',
                'image' => null,
                'featured' => true,
                'visible' => true,
                'status' => true,
            ],
            [
                'category_id' => $regalosId,
                'name' => 'Llaveros',
                'slug' => 'llaveros',
                'description' => 'Llaveros personalizados en diferentes formas',
                'image' => null,
                'featured' => true,
                'visible' => true,
                'status' => true,
            ],
            [
                'category_id' => $regalosId,
                'name' => 'Puzzle',
                'slug' => 'puzzle',
                'description' => 'Puzzles personalizados de diferentes tamaños',
                'image' => null,
                'featured' => true,
                'visible' => true,
                'status' => true,
            ],
            [
                'category_id' => $regalosId,
                'name' => 'Magnéticos',
                'slug' => 'magneticos',
                'description' => 'Imanes personalizados para refrigerador',
                'image' => null,
                'featured' => true,
                'visible' => true,
                'status' => true,
            ]
        ];

        foreach ($subcategories as $subcategoryData) {
            SubCategory::create($subcategoryData);
        }

        $this->command->info('Subcategories created successfully!');
    }

    private function createItems()
    {
        // Get subcategories
        $cuadroMetal = SubCategory::where('slug', 'cuadro-metal')->first();
        $cuadroMadera = SubCategory::where('slug', 'cuadro-madera')->first();
        $termo = SubCategory::where('slug', 'termo')->first();
        $llaveros = SubCategory::where('slug', 'llaveros')->first();
        $puzzle = SubCategory::where('slug', 'puzzle')->first();
        $magneticos = SubCategory::where('slug', 'magneticos')->first();

        // Get canvas presets
        $presets = CanvasPreset::all()->keyBy('name');

        $items = [
            // Photobooks - Cuadro Metal
            [
                'name' => 'Diseñalo tu Mismo',
                'slug' => 'photobook-disenalo-tu-mismo',
                'summary' => 'Photobook personalizable completamente por el usuario',
                'description' => 'Crea tu propio photobook con nuestro editor avanzado. Añade tus fotos favoritas y personaliza cada página.',
                'price' => 25.00,
                'discount' => 0,
                'final_price' => 25.00,
                'discount_percent' => 0,
                'category_id' => $cuadroMetal->category_id,
                'subcategory_id' => $cuadroMetal->id,
                'canvas_preset_id' => $presets['Photobook Cuadrado Metal 10x10 cm']->id,
                'pages' => 12,
                'is_new' => true,
                'offering' => false,
                'recommended' => true,
                'featured' => true,
                'visible' => true,
                'status' => true,
                'sku' => 'PB-DTM-001',
                'stock' => 100,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Photobook padres',
                'slug' => 'photobook-padres',
                'summary' => 'Photobook especial para padres con plantillas prediseñadas',
                'description' => 'Photobook con diseños especiales para celebrar a los padres. Incluye plantillas y marcos temáticos.',
                'price' => 30.00,
                'discount' => 5.00,
                'final_price' => 25.00,
                'discount_percent' => 17,
                'category_id' => $cuadroMetal->category_id,
                'subcategory_id' => $cuadroMetal->id,
                'canvas_preset_id' => $presets['Photobook Cuadrado Metal 10x10 cm']->id,
                'pages' => 12,
                'is_new' => false,
                'offering' => true,
                'recommended' => true,
                'featured' => true,
                'visible' => true,
                'status' => true,
                'sku' => 'PB-PAD-001',
                'stock' => 50,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Photobook abuelos',
                'slug' => 'photobook-abuelos',
                'summary' => 'Photobook especial para abuelos con diseños clásicos',
                'description' => 'Photobook con diseños elegantes y clásicos, perfecto para regalar a los abuelos.',
                'price' => 28.00,
                'discount' => 0,
                'final_price' => 28.00,
                'discount_percent' => 0,
                'category_id' => $cuadroMetal->category_id,
                'subcategory_id' => $cuadroMetal->id,
                'canvas_preset_id' => $presets['Photobook Cuadrado Metal 10x10 cm']->id,
                'pages' => 15,
                'is_new' => false,
                'offering' => false,
                'recommended' => true,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'PB-ABU-001',
                'stock' => 30,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Photobook mascotas',
                'slug' => 'photobook-mascotas',
                'summary' => 'Photobook dedicado a las mascotas queridas',
                'description' => 'Photobook especial para inmortalizar los mejores momentos con tu mascota.',
                'price' => 26.00,
                'discount' => 0,
                'final_price' => 26.00,
                'discount_percent' => 0,
                'category_id' => $cuadroMetal->category_id,
                'subcategory_id' => $cuadroMetal->id,
                'canvas_preset_id' => $presets['Photobook Cuadrado Metal 10x10 cm']->id,
                'pages' => 12,
                'is_new' => true,
                'offering' => false,
                'recommended' => false,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'PB-MAS-001',
                'stock' => 40,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Photobook matrimonio',
                'slug' => 'photobook-matrimonio',
                'summary' => 'Photobook elegante para bodas y matrimonios',
                'description' => 'Photobook con diseños románticos y elegantes, perfecto para conservar los recuerdos de tu boda.',
                'price' => 35.00,
                'discount' => 0,
                'final_price' => 35.00,
                'discount_percent' => 0,
                'category_id' => $cuadroMetal->category_id,
                'subcategory_id' => $cuadroMetal->id,
                'canvas_preset_id' => $presets['Photobook A4 21x29 cm']->id,
                'pages' => 21,
                'is_new' => false,
                'offering' => false,
                'recommended' => true,
                'featured' => true,
                'visible' => true,
                'status' => true,
                'sku' => 'PB-MAT-001',
                'stock' => 25,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Photobook enamorados',
                'slug' => 'photobook-enamorados',
                'summary' => 'Photobook romántico para parejas enamoradas',
                'description' => 'Photobook con diseños románticos para celebrar el amor en pareja.',
                'price' => 27.00,
                'discount' => 2.00,
                'final_price' => 25.00,
                'discount_percent' => 7,
                'category_id' => $cuadroMetal->category_id,
                'subcategory_id' => $cuadroMetal->id,
                'canvas_preset_id' => $presets['Photobook Cuadrado Madera 15x15 cm']->id,
                'pages' => 15,
                'is_new' => false,
                'offering' => true,
                'recommended' => false,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'PB-ENA-001',
                'stock' => 35,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Photobook quince años',
                'slug' => 'photobook-quince-anos',
                'summary' => 'Photobook especial para celebrar los 15 años',
                'description' => 'Photobook con diseños juveniles y elegantes para celebrar los quince años.',
                'price' => 32.00,
                'discount' => 0,
                'final_price' => 32.00,
                'discount_percent' => 0,
                'category_id' => $cuadroMetal->category_id,
                'subcategory_id' => $cuadroMetal->id,
                'canvas_preset_id' => $presets['Photobook A4 21x29 cm']->id,
                'pages' => 20,
                'is_new' => true,
                'offering' => false,
                'recommended' => false,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'PB-15A-001',
                'stock' => 20,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Photobook bautizo',
                'slug' => 'photobook-bautizo',
                'summary' => 'Photobook conmemorativo para bautizos',
                'description' => 'Photobook con diseños tiernos y religiosos para conservar los recuerdos del bautizo.',
                'price' => 29.00,
                'discount' => 0,
                'final_price' => 29.00,
                'discount_percent' => 0,
                'category_id' => $cuadroMetal->category_id,
                'subcategory_id' => $cuadroMetal->id,
                'canvas_preset_id' => $presets['Photobook Cuadrado Madera 15x15 cm']->id,
                'pages' => 12,
                'is_new' => false,
                'offering' => false,
                'recommended' => false,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'PB-BAU-001',
                'stock' => 30,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Cuentos infantiles',
                'slug' => 'cuentos-infantiles',
                'summary' => 'Photobook para crear cuentos personalizados para niños',
                'description' => 'Crea cuentos únicos con las fotos de tus hijos como protagonistas.',
                'price' => 24.00,
                'discount' => 0,
                'final_price' => 24.00,
                'discount_percent' => 0,
                'category_id' => $cuadroMetal->category_id,
                'subcategory_id' => $cuadroMetal->id,
                'canvas_preset_id' => $presets['Photobook Cuadrado Madera 15x15 cm']->id,
                'pages' => 10,
                'is_new' => true,
                'offering' => false,
                'recommended' => true,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'PB-CUE-001',
                'stock' => 50,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Anuarios Escolares',
                'slug' => 'anuarios-escolares',
                'summary' => 'Anuarios escolares personalizados en pack de 4 unidades',
                'description' => 'Pack de 4 anuarios escolares con diseños educativos y espacios para fotos grupales.',
                'price' => 45.00,
                'discount' => 5.00,
                'final_price' => 40.00,
                'discount_percent' => 11,
                'category_id' => $cuadroMetal->category_id,
                'subcategory_id' => $cuadroMetal->id,
                'canvas_preset_id' => $presets['Photobook A4 21x29 cm']->id,
                'pages' => 24,
                'is_new' => false,
                'offering' => true,
                'recommended' => true,
                'featured' => true,
                'visible' => true,
                'status' => true,
                'sku' => 'AN-ESC-004',
                'stock' => 15,
                'color' => null,
                'texture' => null
            ],

            // Tamaños de impresión
            [
                'name' => 'Impresión 21x30 cm',
                'slug' => 'impresion-21x30',
                'summary' => 'Impresión fotográfica tamaño 21x30 cm',
                'description' => 'Impresión de alta calidad en papel fotográfico tamaño 21x30 cm.',
                'price' => 8.00,
                'discount' => 0,
                'final_price' => 8.00,
                'discount_percent' => 0,
                'category_id' => $cuadroMetal->category_id,
                'subcategory_id' => $cuadroMetal->id,
                'canvas_preset_id' => null,
                'pages' => 1,
                'is_new' => false,
                'offering' => false,
                'recommended' => false,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'IMP-21X30',
                'stock' => 200,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Impresión 22x22 cm',
                'slug' => 'impresion-22x22',
                'summary' => 'Impresión fotográfica cuadrada 22x22 cm',
                'description' => 'Impresión cuadrada de alta calidad en papel fotográfico.',
                'price' => 6.50,
                'discount' => 0,
                'final_price' => 6.50,
                'discount_percent' => 0,
                'category_id' => $cuadroMetal->category_id,
                'subcategory_id' => $cuadroMetal->id,
                'canvas_preset_id' => null,
                'pages' => 1,
                'is_new' => false,
                'offering' => false,
                'recommended' => false,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'IMP-22X22',
                'stock' => 200,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Impresión 30x30 cm',
                'slug' => 'impresion-30x30',
                'summary' => 'Impresión fotográfica cuadrada grande 30x30 cm',
                'description' => 'Impresión cuadrada grande de alta calidad, perfecta para enmarcar.',
                'price' => 12.00,
                'discount' => 0,
                'final_price' => 12.00,
                'discount_percent' => 0,
                'category_id' => $cuadroMetal->category_id,
                'subcategory_id' => $cuadroMetal->id,
                'canvas_preset_id' => null,
                'pages' => 1,
                'is_new' => false,
                'offering' => false,
                'recommended' => false,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'IMP-30X30',
                'stock' => 150,
                'color' => null,
                'texture' => null
            ],

            // Investidura
            [
                'name' => 'Standard área impresión 24x19',
                'slug' => 'standard-area-impresion-24x19',
                'summary' => 'Área de impresión estándar para productos de investidura',
                'description' => 'Formato estándar para impresiones de investidura y ceremonias académicas.',
                'price' => 15.00,
                'discount' => 0,
                'final_price' => 15.00,
                'discount_percent' => 0,
                'category_id' => $cuadroMetal->category_id,
                'subcategory_id' => $cuadroMetal->id,
                'canvas_preset_id' => null,
                'pages' => 1,
                'is_new' => false,
                'offering' => false,
                'recommended' => false,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'STD-24X19',
                'stock' => 100,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Sport área impresión 24x19',
                'slug' => 'sport-area-impresion-24x19',
                'summary' => 'Área de impresión deportiva formato 24x19',
                'description' => 'Formato especializado para impresiones de eventos deportivos y competencias.',
                'price' => 15.00,
                'discount' => 0,
                'final_price' => 15.00,
                'discount_percent' => 0,
                'category_id' => $cuadroMetal->category_id,
                'subcategory_id' => $cuadroMetal->id,
                'canvas_preset_id' => null,
                'pages' => 1,
                'is_new' => false,
                'offering' => false,
                'recommended' => false,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'SPT-24X19',
                'stock' => 100,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Bamboo área impresión 24x19',
                'slug' => 'bamboo-area-impresion-24x19',
                'summary' => 'Área de impresión en material bamboo ecológico',
                'description' => 'Impresión ecológica en material de bamboo sostenible.',
                'price' => 18.00,
                'discount' => 0,
                'final_price' => 18.00,
                'discount_percent' => 0,
                'category_id' => $cuadroMetal->category_id,
                'subcategory_id' => $cuadroMetal->id,
                'canvas_preset_id' => null,
                'pages' => 1,
                'is_new' => true,
                'offering' => false,
                'recommended' => true,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'BAM-24X19',
                'stock' => 75,
                'color' => null,
                'texture' => null
            ],

            // Termos
            [
                'name' => 'Termo para auto área impresión 19x8 cm',
                'slug' => 'termo-auto-19x8',
                'summary' => 'Termo personalizado para automóvil',
                'description' => 'Termo térmico para auto con área de impresión personalizable.',
                'price' => 22.00,
                'discount' => 0,
                'final_price' => 22.00,
                'discount_percent' => 0,
                'category_id' => $termo->category_id,
                'subcategory_id' => $termo->id,
                'canvas_preset_id' => $presets['Termo Auto 19x8 cm']->id,
                'pages' => 1,
                'is_new' => false,
                'offering' => false,
                'recommended' => true,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'TER-AUTO-001',
                'stock' => 60,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Termo digital área impresión 24x19',
                'slug' => 'termo-digital-24x19',
                'summary' => 'Termo con display digital personalizable',
                'description' => 'Termo moderno con pantalla digital y área de impresión personalizable.',
                'price' => 35.00,
                'discount' => 0,
                'final_price' => 35.00,
                'discount_percent' => 0,
                'category_id' => $termo->category_id,
                'subcategory_id' => $termo->id,
                'canvas_preset_id' => $presets['Termo Digital 24x19 cm']->id,
                'pages' => 1,
                'is_new' => true,
                'offering' => false,
                'recommended' => true,
                'featured' => true,
                'visible' => true,
                'status' => true,
                'sku' => 'TER-DIG-001',
                'stock' => 40,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Termo taza tumbler área impresión 14.5x22cm',
                'slug' => 'termo-tumbler-14-5x22',
                'summary' => 'Taza termo tumbler para bebidas frías y calientes',
                'description' => 'Taza tumbler térmica con doble pared para mantener la temperatura.',
                'price' => 18.00,
                'discount' => 0,
                'final_price' => 18.00,
                'discount_percent' => 0,
                'category_id' => $termo->category_id,
                'subcategory_id' => $termo->id,
                'canvas_preset_id' => null,
                'pages' => 1,
                'is_new' => false,
                'offering' => false,
                'recommended' => false,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'TER-TUM-001',
                'stock' => 80,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Termo tumbler 20 oz área impresión 7x27 cm',
                'slug' => 'termo-tumbler-20oz-7x27',
                'summary' => 'Termo tumbler de 20 onzas con área de impresión alargada',
                'description' => 'Termo tumbler de gran capacidad con área de impresión vertical.',
                'price' => 20.00,
                'discount' => 0,
                'final_price' => 20.00,
                'discount_percent' => 0,
                'category_id' => $termo->category_id,
                'subcategory_id' => $termo->id,
                'canvas_preset_id' => null,
                'pages' => 1,
                'is_new' => false,
                'offering' => false,
                'recommended' => false,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'TER-20OZ-001',
                'stock' => 70,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Termo tumbler 40 oz área impresión 21x12 cm',
                'slug' => 'termo-tumbler-40oz-21x12',
                'summary' => 'Termo tumbler grande de 40 onzas',
                'description' => 'Termo tumbler de máxima capacidad para deportistas y uso intensivo.',
                'price' => 28.00,
                'discount' => 0,
                'final_price' => 28.00,
                'discount_percent' => 0,
                'category_id' => $termo->category_id,
                'subcategory_id' => $termo->id,
                'canvas_preset_id' => null,
                'pages' => 1,
                'is_new' => false,
                'offering' => false,
                'recommended' => true,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'TER-40OZ-001',
                'stock' => 50,
                'color' => null,
                'texture' => null
            ],

            // Posavasos
            [
                'name' => 'Neopreno',
                'slug' => 'posavaso-neopreno',
                'summary' => 'Posavasos de neopreno personalizable',
                'description' => 'Posavasos de neopreno resistente al agua con impresión personalizada.',
                'price' => 5.00,
                'discount' => 0,
                'final_price' => 5.00,
                'discount_percent' => 0,
                'category_id' => $magneticos->category_id,
                'subcategory_id' => $magneticos->id,
                'canvas_preset_id' => null,
                'pages' => 1,
                'is_new' => false,
                'offering' => false,
                'recommended' => false,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'POS-NEO-001',
                'stock' => 200,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'MDF',
                'slug' => 'posavaso-mdf',
                'summary' => 'Posavasos de MDF con acabado premium',
                'description' => 'Posavasos de madera MDF con impresión de alta calidad y acabado brillante.',
                'price' => 7.00,
                'discount' => 0,
                'final_price' => 7.00,
                'discount_percent' => 0,
                'category_id' => $magneticos->category_id,
                'subcategory_id' => $magneticos->id,
                'canvas_preset_id' => null,
                'pages' => 1,
                'is_new' => false,
                'offering' => false,
                'recommended' => false,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'POS-MDF-001',
                'stock' => 150,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Redondo área de impresión 10.36 diámetro',
                'slug' => 'posavaso-redondo-10-36',
                'summary' => 'Posavasos redondo de 10.36 cm de diámetro',
                'description' => 'Posavasos circular con área de impresión completa.',
                'price' => 6.00,
                'discount' => 0,
                'final_price' => 6.00,
                'discount_percent' => 0,
                'category_id' => $magneticos->category_id,
                'subcategory_id' => $magneticos->id,
                'canvas_preset_id' => null,
                'pages' => 1,
                'is_new' => false,
                'offering' => false,
                'recommended' => false,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'POS-RED-001',
                'stock' => 180,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Cuadrado área impresión 10x10 cm',
                'slug' => 'posavaso-cuadrado-10x10',
                'summary' => 'Posavasos cuadrado de 10x10 cm',
                'description' => 'Posavasos cuadrado con esquinas redondeadas y área de impresión completa.',
                'price' => 6.00,
                'discount' => 0,
                'final_price' => 6.00,
                'discount_percent' => 0,
                'category_id' => $magneticos->category_id,
                'subcategory_id' => $magneticos->id,
                'canvas_preset_id' => null,
                'pages' => 1,
                'is_new' => false,
                'offering' => false,
                'recommended' => false,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'POS-CUA-001',
                'stock' => 180,
                'color' => null,
                'texture' => null
            ],

            // Roto roca (Llaveros)
            [
                'name' => 'Corazón área impresión 17x17cm',
                'slug' => 'llavero-corazon-17x17',
                'summary' => 'Llavero en forma de corazón personalizable',
                'description' => 'Llavero acrílico transparente en forma de corazón con impresión personalizada.',
                'price' => 4.50,
                'discount' => 0,
                'final_price' => 4.50,
                'discount_percent' => 0,
                'category_id' => $llaveros->category_id,
                'subcategory_id' => $llaveros->id,
                'canvas_preset_id' => $presets['Llavero Corazón 17x17 cm']->id,
                'pages' => 1,
                'is_new' => false,
                'offering' => false,
                'recommended' => true,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'LLA-COR-001',
                'stock' => 300,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Rectangular área impresión 20x30 cm',
                'slug' => 'llavero-rectangular-20x30',
                'summary' => 'Llavero rectangular con área amplia de impresión',
                'description' => 'Llavero rectangular de tamaño generoso para diseños detallados.',
                'price' => 5.00,
                'discount' => 0,
                'final_price' => 5.00,
                'discount_percent' => 0,
                'category_id' => $llaveros->category_id,
                'subcategory_id' => $llaveros->id,
                'canvas_preset_id' => null,
                'pages' => 1,
                'is_new' => false,
                'offering' => false,
                'recommended' => false,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'LLA-REC-001',
                'stock' => 250,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Cuadrado área impresión 20x20 cm',
                'slug' => 'llavero-cuadrado-20x20',
                'summary' => 'Llavero cuadrado perfecto para fotos',
                'description' => 'Llavero cuadrado ideal para fotos familiares y diseños cuadrados.',
                'price' => 4.75,
                'discount' => 0,
                'final_price' => 4.75,
                'discount_percent' => 0,
                'category_id' => $llaveros->category_id,
                'subcategory_id' => $llaveros->id,
                'canvas_preset_id' => $presets['Llavero Cuadrado 20x20 cm']->id,
                'pages' => 1,
                'is_new' => false,
                'offering' => false,
                'recommended' => false,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'LLA-CUA-001',
                'stock' => 275,
                'color' => null,
                'texture' => null
            ],

            // Puzzle
            [
                'name' => 'A5 área impresión 14x21 cm',
                'slug' => 'puzzle-a5-14x21',
                'summary' => 'Puzzle personalizado tamaño A5',
                'description' => 'Puzzle de 120 piezas en formato A5, perfecto para regalos personalizados.',
                'price' => 16.00,
                'discount' => 0,
                'final_price' => 16.00,
                'discount_percent' => 0,
                'category_id' => $puzzle->category_id,
                'subcategory_id' => $puzzle->id,
                'canvas_preset_id' => $presets['Puzzle A5 14x21 cm']->id,
                'pages' => 1,
                'is_new' => false,
                'offering' => false,
                'recommended' => false,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'PUZ-A5-001',
                'stock' => 100,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'A4 área impresión 21x29 cm',
                'slug' => 'puzzle-a4-21x29',
                'summary' => 'Puzzle personalizado tamaño A4',
                'description' => 'Puzzle de 200 piezas en formato A4, ideal para fotos familiares.',
                'price' => 22.00,
                'discount' => 0,
                'final_price' => 22.00,
                'discount_percent' => 0,
                'category_id' => $puzzle->category_id,
                'subcategory_id' => $puzzle->id,
                'canvas_preset_id' => $presets['Puzzle A4 21x29 cm']->id,
                'pages' => 1,
                'is_new' => false,
                'offering' => false,
                'recommended' => true,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'PUZ-A4-001',
                'stock' => 80,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'A3 área impresión 30x40 cm',
                'slug' => 'puzzle-a3-30x40',
                'summary' => 'Puzzle personalizado tamaño A3',
                'description' => 'Puzzle de 300 piezas en formato A3, perfecto para diseños grandes y detallados.',
                'price' => 30.00,
                'discount' => 2.00,
                'final_price' => 28.00,
                'discount_percent' => 7,
                'category_id' => $puzzle->category_id,
                'subcategory_id' => $puzzle->id,
                'canvas_preset_id' => $presets['Puzzle A3 30x40 cm']->id,
                'pages' => 1,
                'is_new' => false,
                'offering' => true,
                'recommended' => true,
                'featured' => true,
                'visible' => true,
                'status' => true,
                'sku' => 'PUZ-A3-001',
                'stock' => 60,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Corazón área impresión 18x17 cm',
                'slug' => 'puzzle-corazon-18x17',
                'summary' => 'Puzzle en forma de corazón personalizable',
                'description' => 'Puzzle romántico en forma de corazón, perfecto para regalos de San Valentín.',
                'price' => 25.00,
                'discount' => 0,
                'final_price' => 25.00,
                'discount_percent' => 0,
                'category_id' => $puzzle->category_id,
                'subcategory_id' => $puzzle->id,
                'canvas_preset_id' => null,
                'pages' => 1,
                'is_new' => true,
                'offering' => false,
                'recommended' => true,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'PUZ-COR-001',
                'stock' => 70,
                'color' => null,
                'texture' => null
            ],

            // Magnéticos
            [
                'name' => 'Pack 12 unidades área impresión 9x10 cm',
                'slug' => 'iman-pack-12-9x10',
                'summary' => 'Pack de 12 imanes pequeños personalizables',
                'description' => 'Pack económico de 12 imanes pequeños para refrigerador con impresión personalizada.',
                'price' => 15.00,
                'discount' => 0,
                'final_price' => 15.00,
                'discount_percent' => 0,
                'category_id' => $magneticos->category_id,
                'subcategory_id' => $magneticos->id,
                'canvas_preset_id' => $presets['Imán 9x10 cm']->id,
                'pages' => 1,
                'is_new' => false,
                'offering' => false,
                'recommended' => false,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'IMA-12U-001',
                'stock' => 50,
                'color' => null,
                'texture' => null
            ],
            [
                'name' => 'Pack 10 unidades área impresión 5x20 cm',
                'slug' => 'iman-pack-10-5x20',
                'summary' => 'Pack de 10 imanes rectangulares alargados',
                'description' => 'Pack de 10 imanes rectangulares, ideales para frases y diseños horizontales.',
                'price' => 18.00,
                'discount' => 0,
                'final_price' => 18.00,
                'discount_percent' => 0,
                'category_id' => $magneticos->category_id,
                'subcategory_id' => $magneticos->id,
                'canvas_preset_id' => $presets['Imán 5x20 cm']->id,
                'pages' => 1,
                'is_new' => false,
                'offering' => false,
                'recommended' => false,
                'featured' => false,
                'visible' => true,
                'status' => true,
                'sku' => 'IMA-10U-001',
                'stock' => 40,
                'color' => null,
                'texture' => null
            ]
        ];

        foreach ($items as $itemData) {
            Item::create($itemData);
        }

        $this->command->info('Items created successfully!');
    }
}
