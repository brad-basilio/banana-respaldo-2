// Definimos los layouts con estilos avanzados y tendencias modernas para álbumes de fotos
export const layouts = [
    // LAYOUTS ARTÍSTICOS/COLLAGE
    {
        id: "dynamic-l-shape",
        name: "Forma L Dinámica",
        description: "Disposición en L con cuatro imágenes",
        category: "collage",
        template: "grid-cols-12 grid-rows-12",
        cells: 5,
        style: {
            gap: "14px",
            padding: "16px"
        },
        cellStyles: {
            0: "col-span-7 col-start-1 row-span-7 row-start-1 rounded-lg overflow-hidden shadow-lg",
            1: "col-span-5 col-start-8 row-span-4 row-start-1 rounded-lg overflow-hidden shadow-lg",
            2: "col-span-5 col-start-8 row-span-4 row-start-5 rounded-lg overflow-hidden shadow-lg",
            3: "col-span-7 col-start-1 row-span-5 row-start-8 rounded-lg overflow-hidden shadow-lg",
            4: "col-span-5 col-start-8 row-span-4 row-start-9 rounded-lg overflow-hidden shadow-lg"
        },
        maskCategories: [
            {
                name: "Moderno",
                masks: ["none", "soft-edge"]
            }
        ]
    },
   
    {
        id: "quad-mosaic",
        name: "Mosaico Cuádruple",
        description: "Cuatro imágenes en mosaico dinámico",
        category: "collage",
        template: "grid-cols-12 grid-rows-12",
        cells: 4,
        style: {
            gap: "12px",
            padding: "16px"
        },
        cellStyles: {
            0: "col-span-8 col-start-1 row-span-6 row-start-1 rounded-lg overflow-hidden shadow-lg",
            1: "col-span-4 col-start-9 row-span-12 row-start-1 rounded-lg overflow-hidden shadow-lg",
            2: "col-span-4 col-start-1 row-span-6 row-start-7 rounded-lg overflow-hidden shadow-lg",
            3: "col-span-4 col-start-5 row-span-6 row-start-7 rounded-lg overflow-hidden shadow-lg"
        },
        maskCategories: [
            {
                name: "Mosaico",
                masks: ["none", "soft-edge"]
            }
        ]
    },

    {
        id: "panoramic-split",
        name: "Split Panorámico",
        description: "Combinación de panorámica y cuadrados",
        category: "collage",
        template: "grid-cols-12 grid-rows-12",
        cells: 4,
        style: {
            gap: "16px",
            padding: "16px"
        },
        cellStyles: {
            0: "col-span-12 col-start-1 row-span-6 row-start-1 rounded-lg overflow-hidden shadow-lg",
            1: "col-span-4 col-start-1 row-span-6 row-start-7 rounded-lg overflow-hidden shadow-lg",
            2: "col-span-4 col-start-5 row-span-6 row-start-7 rounded-lg overflow-hidden shadow-lg",
            3: "col-span-4 col-start-9 row-span-6 row-start-7 rounded-lg overflow-hidden shadow-lg"
        },
        maskCategories: [
            {
                name: "Panorámico",
                masks: ["none", "soft-edge"]
            }
        ]
    },
    // LAYOUTS ARTÍSTICOS/COLLAGE
    
   
    {
        id: "trio-feature",
        name: "Trío con Destacado",
        description: "Tres imágenes con una destacada en la parte inferior",
        category: "collage",
        template: "grid-cols-12 grid-rows-12",
        cells: 3,
        style: {
            gap: "12px",
            padding: "16px"
        },
        cellStyles: {
            0: "col-span-6 col-start-1 row-span-6 row-start-1 rounded-lg overflow-hidden shadow-lg",
            1: "col-span-6 col-start-7 row-span-6 row-start-1 rounded-lg overflow-hidden shadow-lg",
            2: "col-span-12 col-start-1 row-span-6 row-start-7 rounded-lg overflow-hidden shadow-lg"
        },
        maskCategories: [
            {
                name: "Moderno",
                masks: ["none", "soft-edge"]
            }
        ]
    },
    {
        id: "collage-gallery",
        name: "Galería Mixta",
        description: "Layout con cinco imágenes en disposición dinámica",
        category: "collage",
        template: "grid-cols-12 grid-rows-12",
        cells: 5,
        style: {
            gap: "12px",
            padding: "16px"
        },
        cellStyles: {
            0: "col-span-4 col-start-1 row-span-4 row-start-1 rounded-lg overflow-hidden shadow-lg",
            1: "col-span-4 col-start-1 row-span-8 row-start-5 rounded-lg overflow-hidden shadow-lg",
            2: "col-span-4 col-start-5 row-span-8 row-start-1 rounded-lg overflow-hidden shadow-lg",
            3: "col-span-4 col-start-9 row-span-8 row-start-1 rounded-lg overflow-hidden shadow-lg",
            4: "col-span-8 col-start-5 row-span-4 row-start-9 rounded-lg overflow-hidden shadow-lg"
        },
        maskCategories: [
            {
                name: "Galería",
                masks: ["none", "soft-edge"]
            }
        ]
    },
    {
        id: "artistic-duo-offset",
        name: "Artístico - Dúo Escalonado",
        description: "Dos imágenes con disposición escalonada y dinámica",
        category: "artistic",
        template: "grid-cols-12 grid-rows-6",
        cells: 2,
        style: {
            gap: "16px",
            padding: "24px"
        },
        cellStyles: {
            0: "col-span-7 col-start-1 row-span-4 row-start-1 rounded-xl overflow-hidden shadow-lg transform hover:scale-102 transition-all", 
            1: "col-span-7 col-start-6 row-span-4 row-start-3 rounded-xl overflow-hidden shadow-lg transform hover:scale-102 transition-all"
        },
        maskCategories: [
            {
                name: "Artístico",
                masks: ["none", "soft-edge", "artistic-border"]
            }
        ]
    },
   
    // LAYOUTS BÁSICOS PARA COMPATIBILIDAD
    {
        id: "layout-1",
        name: "Básico - Una Celda",
        description: "Layout básico con una sola celda que ocupa toda la página",
        category: "basic",
        template: "grid-cols-1 grid-rows-1",
        cells: 1,
        style: {
            gap: "0px",
            padding: "0px"
        },
        cellStyles: {
            0: "rounded-lg overflow-hidden shadow-lg"
        },
        maskCategories: [
            {
                name: "Básico",
                masks: ["none", "rounded", "soft-rounded"]
            }
        ]
    },
    {
        id: "layout-2",
        name: "Básico - Dos Celdas",
        description: "Layout básico con dos celdas horizontales",
        category: "basic",
        template: "grid-cols-2 grid-rows-1",
        cells: 2,
        style: {
            gap: "16px",
            padding: "16px"
        },
        cellStyles: {
            0: "rounded-lg overflow-hidden shadow-lg",
            1: "rounded-lg overflow-hidden shadow-lg"
        },
        maskCategories: [
            {
                name: "Básico",
                masks: ["none", "rounded", "soft-rounded"]
            }
        ]
    },
    {
        id: "layout-3",
        name: "Básico - Tres Celdas",
        description: "Layout básico con tres celdas",
        category: "basic",
        template: "grid-cols-3 grid-rows-1",
        cells: 3,
        style: {
            gap: "12px",
            padding: "16px"
        },
        cellStyles: {
            0: "rounded-lg overflow-hidden shadow-lg",
            1: "rounded-lg overflow-hidden shadow-lg",
            2: "rounded-lg overflow-hidden shadow-lg"
        },
        maskCategories: [
            {
                name: "Básico",
                masks: ["none", "rounded", "soft-rounded"]
            }
        ]
    },
    {
        id: "layout-4",
        name: "Básico - Cuatro Celdas",
        description: "Layout básico con cuatro celdas en cuadrícula",
        category: "basic",
        template: "grid-cols-2 grid-rows-2",
        cells: 4,
        style: {
            gap: "12px",
            padding: "16px"
        },
        cellStyles: {
            0: "rounded-lg overflow-hidden shadow-lg",
            1: "rounded-lg overflow-hidden shadow-lg",
            2: "rounded-lg overflow-hidden shadow-lg",
            3: "rounded-lg overflow-hidden shadow-lg"
        },
        maskCategories: [
            {
                name: "Básico",
                masks: ["none", "rounded", "soft-rounded"]
            }
        ]
    },

    // LAYOUTS HERO/DESTACADOS
  


    // LAYOUTS MAGAZINE/EDITORIAL
    {
        id: "magazine-asymmetric",
        name: "Magazine - Asimétrico",
        description: "Layout editorial con jerarquía visual moderna",
        category: "editorial",
        template: "grid-cols-5 grid-rows-3 gap-2",
        cells: 4,
        style: {
            gap: "6px"
        },
        cellStyles: {
            0: "col-span-3 row-span-2 rounded-lg overflow-hidden shadow-lg", // Principal
            1: "col-span-2 row-span-1 rounded-md overflow-hidden shadow-md", // Secundaria
            2: "col-span-2 row-span-1 rounded-md overflow-hidden shadow-md", // Terciaria
            3: "col-span-5 row-span-1 rounded-md overflow-hidden shadow-sm"  // Inferior
        },
        maskCategories: [
            {
                name: "Editorial",
                masks: ["none", "magazine-crop", "editorial-frame", "soft-vignette"]
            },
            {
                name: "Moderno",
                masks: ["geometric-crop", "minimal-frame", "clean-border"]
            }
        ]
    },
    {
        id: "magazine-grid",
        name: "Magazine - Grid Moderno",
        description: "Grid uniforme con espaciado editorial elegante",
        category: "editorial",
        template: "grid-cols-3 grid-rows-2 gap-3",
        cells: 6,
        style: {
            gap: "8px",
            padding: "4px"
        },
        cellStyles: {
            0: "rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow",
            1: "rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow",
            2: "rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow",
            3: "rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow",
            4: "rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow",
            5: "rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
        },
        maskCategories: [
            {
                name: "Uniformes",
                masks: ["none", "rounded", "soft-rounded", "minimal-frame"]
            }
        ]
    },


    // LAYOUTS MINIMALISTA
    {
        id: "minimal-duo",
        name: "Minimal - Dúo Elegante",
        description: "Dos imágenes con mucho espacio blanco",
        category: "minimal",
        template: "grid-cols-1 grid-rows-2 gap-8",
        cells: 2,
        style: {
            gap: "32px",
            padding: "24px"
        },
        cellStyles: {
            0: "rounded-xl overflow-hidden shadow-2xl",
            1: "rounded-xl overflow-hidden shadow-2xl"
        },
        maskCategories: [
            {
                name: "Limpio",
                masks: ["none", "clean-border", "minimal-frame", "soft-shadow"]
            }
        ]
    },
  

   

    // LAYOUTS CLÁSICOS MEJORADOS
  
    {
        id: "classic-portrait",
        name: "Clásico - Retrato Elegante",
        description: "Layout perfecto para retratos y fotos verticales",
        category: "classic",
        template: "grid-cols-3 grid-rows-2 gap-3",
        cells: 3,
        style: {
            gap: "10px"
        },
        cellStyles: {
            0: "col-span-2 row-span-2 rounded-2xl overflow-hidden shadow-2xl", // Principal
            1: "col-span-1 row-span-1 rounded-lg overflow-hidden shadow-lg",   // Secundaria 1
            2: "col-span-1 row-span-1 rounded-lg overflow-hidden shadow-lg"    // Secundaria 2
        },
        maskCategories: [
            {
                name: "Retrato",
                masks: ["none", "portrait-frame", "elegant-oval", "classic-border"]
            }
        ]
    }
];
