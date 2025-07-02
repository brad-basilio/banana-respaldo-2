import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CardHoverBtn from "../Products/Components/CardHoverBtn";
import { 
    ChevronDown, 
    ChevronLeft, 
    ChevronRight, 
    Filter, 
    Search, 
    Tag, 
    X, 
    Zap, 
    Sparkles, 
    Star,
    ShoppingBag,
    TrendingUp,
    CheckCircle2,
    Layers,
    Grid3X3,
    Sliders,
    Trash,
    List,
    ListFilter
} from "lucide-react";
import ItemsRest from "../../../Actions/ItemsRest";
import ArrayJoin from "../../../Utils/ArrayJoin";
import { Loading } from "../Components/Resources/Loading";
import { NoResults } from "../Components/Resources/NoResult";
import SelectForm from "./Components/SelectForm";
import { GET } from "sode-extend-react";

const itemsRest = new ItemsRest();

// Configuración de animaciones para todos los elementos del filtro
const filterAnimations = {
    container: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { duration: 0.3, ease: "easeOut" }
    },
    section: {
        initial: { opacity: 0, height: 0 },
        animate: { opacity: 1, height: "auto" },
        exit: { opacity: 0, height: 0 },
        transition: { duration: 0.3, ease: "easeInOut" }
    },
    item: {
        initial: { opacity: 0, x: -10 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 10 },
        transition: { duration: 0.2, ease: "easeOut" }
    },
    badge: {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0, opacity: 0 },
        transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    hover: { 
        scale: 1.02, 
        y: -2,
        transition: { duration: 0.2 }
    },
    tap: { 
        scale: 0.98,
        transition: { duration: 0.1 }
    },
    stagger: {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    }
};

// Estilos CSS modernos para una mejor experiencia de usuario
const modernFilterStyles = {
    filterContainer: "backdrop-blur-xl bg-gradient-to-br from-white/95 via-white/90 to-white/85 border border-gray-200/60 rounded-2xl shadow-2xl shadow-gray-900/10",
    filterHeader: "bg-white border-b border-gray-200/60 rounded-t-2xl",
    filterSection: "group transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-50/60 hover:to-blue-50/40 rounded-xl",
    filterButton: "w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 group",
    filterContent: "bg-gradient-to-b from-white/90 to-gray-50/50 rounded-xl border border-gray-200/40 backdrop-blur-sm",
    searchInput: "w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-300 placeholder:customtext-neutral-dark",
    checkbox: "min-h-5 min-w-5 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-blue-500/30 focus:ring-2 transition-all duration-200 hover:border-blue-400",
    label: "flex items-center gap-3 py-0 px-3 rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-indigo-50/40 cursor-pointer group",
    activeFilter: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25",
    badge: "inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-full text-sm font-medium text-blue-700",
    glowEffect: "shadow-lg shadow-blue-500/20 ring-1 ring-blue-500/20",
    pulseAnimation: "animate-pulse",
    shimmerEffect: "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent"
};






const SkeletonCard = ({ delay = 0 }) => {
    return (
        <motion.div 
            className="group w-full h-full"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
                delay,
                duration: 0.6,
                ease: "easeOut"
            }}
        >
            <div className="px-4 h-full">
                <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                    {/* Contenedor principal con altura fija similar a las tarjetas reales */}
                    <div className="flex flex-col h-[400px] lg:h-[460px] xl:h-[400px] 2xl:h-[430px]">
                        
                        {/* Imagen del producto skeleton */}
                        <div className="relative flex-1 bg-gray-100 rounded-t-3xl overflow-hidden">
                            {/* Efecto shimmer mejorado */}
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200">
                                {/* Shimmer principal */}
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent transform skew-x-12"></div>
                                
                                {/* Shimmer secundario para más profundidad */}
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-blue-100/30 to-transparent transform skew-x-12" style={{ animationDelay: '0.5s' }}></div>
                            </div>
                            
                            {/* Placeholder del icono de imagen */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    animate={{ 
                                        scale: [1, 1.1, 1],
                                        opacity: [0.5, 0.8, 0.5]
                                    }}
                                    transition={{ 
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <ShoppingBag className="w-12 h-12 text-gray-300" />
                                </motion.div>
                            </div>

                            {/* Badge de descuento skeleton */}
                            <div className="absolute top-3 left-3">
                                <div className="h-6 w-16 bg-gray-300 rounded-full animate-pulse"></div>
                            </div>

                            {/* Botón de favorito skeleton */}
                            <div className="absolute top-3 right-3">
                                <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        {/* Contenido del producto skeleton */}
                        <div className="p-4 space-y-3 bg-white flex-shrink-0">
                            {/* Marca skeleton */}
                            <div className="h-3 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                            
                            {/* Título del producto skeleton */}
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-gray-300 rounded animate-pulse"></div>
                                <div className="h-4 w-3/4 bg-gray-300 rounded animate-pulse"></div>
                            </div>

                            {/* Precio skeleton */}
                            <div className="flex items-center justify-between pt-2">
                                <div className="space-y-1">
                                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-5 w-24 bg-gray-400 rounded animate-pulse"></div>
                                </div>
                                
                                {/* Botón de agregar al carrito skeleton */}
                                <div className="h-10 w-10 bg-gray-300 rounded-xl animate-pulse"></div>
                            </div>

                            {/* Rating skeleton */}
                            <div className="flex items-center space-x-1 pt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <div key={star} className="h-3 w-3 bg-gray-200 rounded-full animate-pulse"></div>
                                ))}
                                <div className="h-3 w-8 bg-gray-200 rounded animate-pulse ml-2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};


const CatalagoFiltros = ({ items, data, filteredData, cart, setCart }) => {
    // Estado para el filtro padre (independiente)
    const [independentFilter, setIndependentFilter] = useState(null);
    const [brands, setBrands] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [collections, setCollections] = useState([]);
    const [priceRanges, setPriceRanges] = useState([]);
    const [activeSection, setActiveSection] = useState(null);

    // Rangos de precios estáticos
    const staticPriceRanges = [
        { min: 0, max: 50, label: "Hasta s/ 50" },
        { min: 50, max: 100, label: "S/ 50 - s/ 100" },
        { min: 100, max: 250, label: "S/ 100 - s/ 250" },
        { min: 250, max: 500, label: "S/ 250 - s/ 500" },
        { min: 500, max: 1000, label: "S/ 500 - s/ 1.000" },
        { min: 1000, max: 2000, label: "S/ 1.000 - s/ 2.000" },
        { min: 2000, max: 5000, label: "S/ 2.000 - s/ 5.000" },
        { min: 5000, max: 999999, label: "Desde s/ 5.000" }
    ];

    const [sections, setSections] = useState(() => {
        // Por defecto, todos los filtros cerrados en desktop
        if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
            return {
                marca: false,
                precio: false,
                categoria: false,
                subcategoria: false,
                colores: false,
                coleccion: false,
            };
        }
        // En mobile/tablet puedes mantener el comportamiento anterior
        return {
            marca: false,
            precio: false,
            categoria: false,
            subcategoria: false,
            colores: false,
            coleccion: false,
        };
    });

    const [selectedFilters, setSelectedFilters] = useState({
        collection_id: GET.collection ? GET.collection.split(',') : [],
        category_id: GET.category ? GET.category.split(',') : [],
        brand_id: GET.brand ? GET.brand.split(',') : [],
        subcategory_id: GET.subcategory ? GET.subcategory.split(',') : [],
        tag_id: GET.tag ? GET.tag.split(',') : [], // Agregar soporte para tags
        price: [],
        name: GET.search || null,
        sort: [
            {
                selector: "final_price",
                desc: true,
            },
        ],
    });

    // Track the order in which filters are activated
    const [filterSequence, setFilterSequence] = useState([]);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 24,
        from: 0,
        to: 0,
    });

    const transformFilters = (filters) => {
        const transformedFilters = [];

        if (filters.collection_id.length > 0) {
            const collectionConditions = filters.collection_id.map((slug) => [
                "collection.id", // Cambiar a ID en lugar de slug
                "=",
                collections.find(c => c.slug === slug)?.id || slug,
            ]);
            transformedFilters.push(ArrayJoin(collectionConditions, 'or'));
        }

        if (filters.category_id.length > 0) {
            const categoryConditions = filters.category_id.map((slug) => {
                // Buscar la categoría en el array para obtener su ID
                const category = categories.find(c => c.slug === slug);
                
                if (category) {
                    // Si encontramos la categoría, usar su ID
                    return [
                        "category.id",
                        "=",
                        category.id,
                    ];
                } else {
                    // Si no la encontramos, usar slug
                    return [
                        "category.slug",
                        "=",
                        category.slug,
                    ];
                }
            });
            transformedFilters.push(ArrayJoin(categoryConditions, 'or'));
        }

        if (filters.subcategory_id.length > 0) {
            const subcategoryConditions = filters.subcategory_id.map((slug) => {
                // Buscar la subcategoría en el array para obtener su ID
                const subcategory = subcategories.find(s => s.slug === slug);
                
                if (subcategory) {
                    // Si encontramos la subcategoría, usar su ID
                    return [
                        "subcategory.id",
                        "=",
                        subcategory.id,
                    ];
                } else {
                    // Si no la encontramos (posiblemente porque aún no se han cargado), usar slug
                    return [
                        "subcategory.slug",
                        "=",
                        slug,
                    ];
                }
            });
            transformedFilters.push(ArrayJoin(subcategoryConditions, 'or'));
        }

        if (filters.brand_id.length > 0) {
            const brandConditions = filters.brand_id.map((slug) => {
                // Buscar la marca en el array para obtener su ID
                const brand = brands.find(b => b.slug === slug);
                
                if (brand) {
                    // Si encontramos la marca, usar su ID
                    return [
                        "brand.slug",
                        "=",
                        brand.slug,
                    ];
                } else {
                    // Si no la encontramos, usar slug
                    return [
                        "brand.slug",
                        "=",
                        slug,
                    ];
                }
            });
            transformedFilters.push(ArrayJoin(brandConditions, 'or'));
        }

        if (filters.price && filters.price.length > 0) {
            const priceConditions = filters.price.map((priceRange) => [
                "and",
                [
                    ["final_price", ">=", priceRange.min],
                    "and",
                    ["final_price", "<=", priceRange.max],
                ],
            ]);
            transformedFilters.push(ArrayJoin(priceConditions, 'or'));
        }

        if (filters.name) {
            transformedFilters.push(["name", "contains", filters.name]);
        }

        return ArrayJoin(transformedFilters, 'and');
    };
    // Obtener productos filtrados desde el backend
    const fetchProducts = async (page = 1) => {
        setLoading(true);
        try {
            const filters = transformFilters(selectedFilters);
            const itemsPerPage = 24; // Valor constante para evitar problemas de estado
            
            // Extraer los IDs de los filtros seleccionados (no slugs)
            const params = {
                filter: filters,
                sort: selectedFilters.sort,
                skip: (page - 1) * itemsPerPage,
                take: itemsPerPage,
                requireTotalCount: true,
                filterSequence: filterSequence,
                // Removido los filtros duplicados - solo usar el filtro complejo
            };
            
            const response = await itemsRest.paginate(params);
            
            setProducts(response.data);
            
            // Actualizar paginación con los datos correctos del backend
            const totalCount = response.totalCount || 0;
            const totalPages = Math.ceil(totalCount / itemsPerPage);
            
            setPagination({
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalCount,
                itemsPerPage: itemsPerPage,
                from: totalCount > 0 ? (page - 1) * itemsPerPage + 1 : 0,
                to: Math.min(page * itemsPerPage, totalCount),
            });
            
            // Update all filter options from backend summary
            setBrands(response?.summary.brands || []);
            setCategories(response?.summary.categories || []);
            setSubcategories(response?.summary.subcategories || []);
            setCollections(response?.summary.collections || []);
            setPriceRanges(response?.summary.priceRanges || []);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initialize state from filteredData prop
        if (filteredData) {
            // Set initial data from SystemController
            setCategories(filteredData.categories || []);
            setBrands(filteredData.brands || []);
            setSubcategories(filteredData.subcategories || []);
            setPriceRanges(filteredData.priceRanges || []);
        }
        
        // Initial fetch to get products and update summary data
        fetchProducts(1);
    }, [filteredData]);

    useEffect(() => {
        // Cuando cambian los filtros, volvemos a la primera página SIN hacer scroll
        fetchProducts(1);
    }, [selectedFilters]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.totalPages && page !== pagination.currentPage) {
            // Solo para la paginación: desplazar hacia arriba suavemente
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            // Luego, obtener productos de la nueva página
            fetchProducts(page);
        }
    };

    // Generar números de página para la paginación
    const getPageNumbers = () => {
        const pages = [];
        const total = pagination.totalPages;
        const current = pagination.currentPage;
        const delta = 2;

        for (let i = 1; i <= total; i++) {
            if (
                i === 1 ||
                i === total ||
                (i >= current - delta && i <= current + delta)
            ) {
                pages.push(i);
            } else if (i === current - delta - 1 || i === current + delta + 1) {
                pages.push("...");
            }
        }

        return pages.filter((page, index, array) => {
            return page !== "..." || array[index - 1] !== "...";
        });
    };
    // Opciones de ordenación
   const sortOptions = [
    { value: "created_at:desc", label: "Más reciente" },
    { value: "created_at:asc", label: "Mas antiguo" },
    { value: "final_price:asc", label: "Precio: Menor a Mayor" },
    { value: "final_price:desc", label: "Precio: Mayor a Menor" },
    { value: "name:asc", label: "Nombre: A-Z" },
    { value: "name:desc", label: "Nombre: Z-A" },
    { value: "most_sold:desc", label: "Más vendidos" },
    { value: "views:desc", label: "Más visitados" },
   // { value: "discount_percent:desc", label: "Mayores descuentos" },
    { value: "best_discount:desc", label: "Mejores ofertas" },
   // { value: "offering:desc", label: "En oferta" },
 //   { value: "is_new:desc", label: "Nuevos productos" },
   // { value: "featured:desc", label: "Destacados" },
   
   //{ value: "recommended:desc", label: "Recomendados por expertos" },
];


    //}, [items]);
    // Manejar cambios en los filtros y mantener filterSequence
    const handleFilterChange = (type, value) => {
        // Soporte para filtros especiales tipo booleano
        const specialFields = ['is_new', 'offering', 'recommended', 'featured'];
        if (specialFields.includes(type)) {
            setSelectedFilters((prev) => ({
                ...prev,
                [type]: prev[type] ? !prev[type] : true,
            }));
            return;
        }
        setSelectedFilters((prev) => {
            if (type === "price") {
                // Manejar múltiples rangos de precio
                const currentPrices = Array.isArray(prev.price) ? prev.price : [];
                const isAlreadySelected = currentPrices.some(
                    (range) => range.min === value.min && range.max === value.max
                );
                let newPrices;
                if (isAlreadySelected) {
                    // Deseleccionar el rango
                    newPrices = currentPrices.filter(
                        (range) => !(range.min === value.min && range.max === value.max)
                    );
                } else {
                    // Agregar el nuevo rango
                    newPrices = [...currentPrices, value];
                }
                return {
                    ...prev,
                    price: newPrices,
                };
            }
            // Asegúrate de que prev[type] sea un array antes de usar .includes()
            const currentValues = Array.isArray(prev[type]) ? prev[type] : [];
            let newValues;
            if (currentValues.includes(value)) {
                // Deseleccionar
                newValues = currentValues.filter((item) => item !== value);
            } else {
                // Seleccionar
                newValues = [...currentValues, value];
            }
            return { ...prev, [type]: newValues };
        });

        // Update filterSequence
        setFilterSequence((prevSeq) => {
            // Only track these filter types in the sequence
            const trackedTypes = ["brand_id", "category_id", "collection_id"];
            if (!trackedTypes.includes(type)) return prevSeq;

            // If selecting (not removing)
            if (!selectedFilters[type]?.includes(value)) {
                // If not already in sequence, add to end
                if (!prevSeq.includes(type)) {
                    return [...prevSeq, type];
                }
                return prevSeq;
            } else {
                // If removing, check if any values left for this type
                const remaining = selectedFilters[type]?.filter((item) => item !== value) || [];
                if (remaining.length === 0) {
                    // Remove from sequence
                    return prevSeq.filter((t) => t !== type);
                }
                return prevSeq;
            }
        });
    };

    // Alternar secciones de filtros
    const toggleSection = (section) => {
        setSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const [searchCategory, setSearchCategory] = useState("");
    const [searchSubcategory, setSearchSubcategory] = useState("");
    const [searchBrand, setSearchBrand] = useState("");

    // Filtrar categorías según el input
    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchCategory.toLowerCase())
    );
    const filteredSubcategories = subcategories.filter((subcategory) => {
        // Si hay categorías seleccionadas en los filtros, solo mostrar subcategorías de esas categorías
        let categoryIds;
        if (selectedFilters.category_id && selectedFilters.category_id.length > 0) {
            // Hay categorías seleccionadas, solo mostrar subcategorías de esas categorías
            categoryIds = categories
                .filter(cat => selectedFilters.category_id.includes(cat.slug))
                .map(cat => cat.id);
        } else {
            // No hay categorías seleccionadas, mostrar subcategorías de todas las categorías disponibles
            categoryIds = categories.map(cat => cat.id);
        }
        
        return categoryIds.includes(subcategory.category_id) &&
            subcategory.name.toLowerCase().includes(searchSubcategory.toLowerCase());
    });
    
 

    // Filtrar marcas según el input
    const filteredBrands = brands.filter((brand) =>
        brand.name.toLowerCase().includes(searchBrand.toLowerCase())
    );

    const [filtersOpen, setFiltersOpen] = useState(false);

    // Efecto para manejar el scroll del body cuando el modal está abierto
    useEffect(() => {
        if (filtersOpen) {
            // Prevenir scroll del body cuando el modal esté abierto en mobile
            document.body.classList.add('filter-modal-open');
            document.body.style.overflow = 'hidden';
        } else {
            // Restaurar scroll del body cuando el modal se cierre
            document.body.classList.remove('filter-modal-open');
            document.body.style.overflow = 'unset';
        }
        
        // Cleanup cuando el componente se desmonta
        return () => {
            document.body.classList.remove('filter-modal-open');
            document.body.style.overflow = 'unset';
        };
    }, [filtersOpen]);

    return (
        <section className="py-4 lg:py-12 bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
            <div className="mx-auto px-primary 2xl:px-0 2xl:max-w-7xl">
                {/* Header mejorado con estadísticas y acciones rápidas */}
                <motion.div 
                    className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6 lg:mb-8 lg:pb-6 lg:border-b-2 border-gradient-to-r from-blue-200 via-indigo-200 to-purple-200"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div 
                        className="md:w-6/12 mb-0 md:mb-0"
                        whileHover={{ scale: 1.02 }}
                    >
                        <h2 className="text-2xl lg:text-[32px] md:text-4xl font-bold customtext-primary  lg:mb-2">
                            {data?.title}
                        </h2>
                      
                    </motion.div>
                    
                    <div className="hidden md:flex flex-col w-full items-start md:items-center justify-end gap-4 md:flex-row md:w-5/12">
                        {/* Estadísticas mejoradas */}
                      
                        
                        {/* Selector de ordenación mejorado - Solo Desktop */}
                        <motion.div 
                            className="w-full md:w-6/12 relative"
                         
                        >
                            <SelectForm
                                options={sortOptions}
                                placeholder="Ordenar por"
                                value={
                                    selectedFilters.sort?.[0]?.selector && selectedFilters.sort?.[0]?.desc !== undefined
                                        ? `${selectedFilters.sort[0].selector}:${selectedFilters.sort[0].desc ? "desc" : "asc"}`
                                        : "final_price:desc"
                                }
                                onChange={(value) => {
                                    const [selector, order] = value.split(":");
                                    const sort = [
                                        {
                                            selector: selector,
                                            desc: order === "desc",
                                        },
                                    ];
                                    setSelectedFilters((prev) => ({
                                        ...prev,
                                        sort,
                                    }));
                                }}
                                labelKey="label"
                                valueKey="value"
                                className="customtext-neutral-dark border-primary rounded-lg"
                                generalIcon={<ListFilter className="w-5 h-5 mr-2 customtext-primary" />}
                            />
                        </motion.div>
                    </div>
                </motion.div>

                <div className="relative flex flex-col lg:flex-row gap-6">
                    {/* Fila para móvil: Filtros + Ordenación */}
                    <div className="w-full flex lg:hidden lg:mb-6  items-stretch gap-3">
                        {/* Botón de filtros para móvil */}
                        <motion.div className="flex-1 max-w-max">
                            <Tooltip text="Abrir panel de filtros avanzados" position="bottom">
                                <motion.button
                                    className="w-full h-12 flex items-center justify-center gap-2 px-4 bg-primary text-white rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 overflow-hidden relative"
                                    onClick={() => setFiltersOpen(true)}
                                    whileHover={{ scale: 1.02, y: -3 }}
                                    whileTap={{ scale: 0.98 }}
                                    {...filterAnimations.container}
                                >
                                    {/* Fondo animado */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                        animate={{ x: ['-100%', '100%'] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    />
                                    
                                    <div className="flex items-center gap-2 relative z-10">
                                        <motion.div
                                            className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm"
                                            animate={{ 
                                                rotate: [0, 10, 0],
                                                scale: [1, 1.1, 1]
                                            }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Sliders className="h-4 w-4" />
                                        </motion.div>
                                        <span className="text-sm font-bold">Filtros</span>
                                    </div>
                                </motion.button>
                            </Tooltip>
                        </motion.div>

                        {/* Selector de ordenación para móvil */}
                        <motion.div 
                            className="flex-1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <SelectForm
                                options={sortOptions}
                                placeholder="Ordenar"
                                value={
                                    selectedFilters.sort?.[0]?.selector && selectedFilters.sort?.[0]?.desc !== undefined
                                        ? `${selectedFilters.sort[0].selector}:${selectedFilters.sort[0].desc ? "desc" : "asc"}`
                                        : "final_price:desc"
                                }
                                onChange={(value) => {
                                    const [selector, order] = value.split(":");
                                    const sort = [
                                        {
                                            selector: selector,
                                            desc: order === "desc",
                                        },
                                    ];
                                    setSelectedFilters((prev) => ({
                                        ...prev,
                                        sort,
                                    }));
                                }}
                                labelKey="label"
                                valueKey="value"
                                className="!w-full customtext-neutral-dark border-primary rounded-2xl text-sm h-12"
                            />
                        </motion.div>
                    </div>

                    {/* Panel de filtros mejorado */}
                    <motion.div 
                        className={`${filtersOpen
                            ? "fixed inset-0 backdrop-blur-md z-[999] flex flex-col mobile-filter-modal"
                            : "hidden"
                        } lg:block lg:w-3/12 lg:bg-transparent lg:h-max lg:relative lg:z-auto`}
                        {...(filtersOpen ? filterAnimations.container : {})}
                        initial={filtersOpen ? { opacity: 0 } : false}
                        animate={filtersOpen ? { opacity: 1 } : false}
                        exit={filtersOpen ? { opacity: 0 } : false}
                        transition={{ duration: 0.3 }}
                        onClick={filtersOpen ? (e) => {
                            if (e.target === e.currentTarget) {
                                setFiltersOpen(false);
                            }
                        } : undefined}
                    >
                        {/* Contenedor principal de filtros - Estructura mejorada para mobile */}
                        <div className={`${filtersOpen 
                            ? "flex flex-col h-full bg-transparent" 
                            : modernFilterStyles.filterContainer
                        } lg:backdrop-blur-xl lg:border lg:border-gray-200/60 lg:rounded-2xl lg:shadow-2xl lg:shadow-gray-900/10`}>
                            
                            {/* Contenido principal del modal mobile - ocupando todo excepto el footer */}
                            <div className={`${filtersOpen 
                                ? "mx-4 mt-4 mb-2 bg-white rounded-t-3xl shadow-2xl flex flex-col flex-1 overflow-hidden safe-area-top mobile-filter-content"
                                : ""
                            }`}>
                            
                            {/* Header mejorado */}
                            <motion.div 
                                className={`${modernFilterStyles.filterHeader} p-6 flex items-center justify-between lg:relative lg:p-4`}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="flex items-center gap-3">
                                    <motion.div 
                                        className="p-2 bg-primary rounded-xl shadow-lg"
                                        whileHover={{ rotate: 360 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <Filter className="h-5 w-5 text-white" />
                                    </motion.div>
                                    <div>
                                        <h2 className="text-xl font-bold customtext-neutral-dark">
                                            Filtros
                                        </h2>
                                        <p className="text-sm customtext-neutral-dark hidden lg:block">
                                            Refina tu búsqueda con precisión
                                        </p>
                                    </div>
                                </div>
                                
                              
                            </motion.div>

                            {/* Contenido principal con scroll mejorado - ajustado para footer móvil */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar" 
                                 style={{ 
                                     height: filtersOpen ? 'calc(100vh - 200px)' : 'auto',
                                     paddingBottom: filtersOpen ? '1rem' : '1.5rem'
                                 }}>
                                {/* Sección Marcas Mejorada */}
                                <motion.div 
                                    className={modernFilterStyles.filterSection}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <motion.button
                                        onClick={() => toggleSection("marca")}
                                        className={modernFilterStyles.filterButton}
                                        whileHover={filterAnimations.hover}
                                        whileTap={filterAnimations.tap}
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.div 
                                                className="p-2 bg-primary rounded-lg shadow-md"
                                                animate={{ rotate: sections.marca ? 360 : 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Tag className="h-4 w-4 text-white" />
                                            </motion.div>
                                            <div className="text-left">
                                                <span className="font-semibold customtext-neutral-dark">Marcas</span>
                                                <p className="text-xs customtext-neutral-dark">Selecciona tus marcas favoritas</p>
                                            </div>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: sections.marca ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ChevronDown className="h-5 w-5 customtext-neutral-dark" />
                                        </motion.div>
                                    </motion.button>
                                    
                                    <AnimatePresence>
                                        {sections.marca && (
                                            <motion.div 
                                                className={`mt-4 p-4 ${modernFilterStyles.filterContent}`}
                                                {...filterAnimations.section}
                                            >
                                                {/* Barra de búsqueda mejorada */}
                                                <div className="relative mb-4">
                                                    <motion.div
                                                        className="absolute left-4 top-4 z-[99]"
                                                    
                                                    >
                                                        <Search className="h-4 w-4" />
                                                    </motion.div>
                                                    <input
                                                        type="text"
                                                        placeholder="Buscar marcas..."
                                                        className={modernFilterStyles.searchInput}
                                                        value={searchBrand}
                                                        onChange={(e) => setSearchBrand(e.target.value)}
                                                    />
                                                   
                                                </div>
                                                
                                                {/* Lista de marcas mejorada */}
                                                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                                    <AnimatePresence>
                                                        {filteredBrands.map((brand, index) => (
                                                            <motion.label
                                                                key={brand.id}
                                                                className={modernFilterStyles.label}
                                                                {...filterAnimations.item}
                                                                transition={{ delay: index * 0.05 }}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    className={modernFilterStyles.checkbox}
                                                                    onChange={() => handleFilterChange("brand_id", brand.slug)}
                                                                    checked={selectedFilters.brand_id?.includes(brand.slug)}
                                                                />
                                                                <span className="text-sm font-medium line-clamp-1 customtext-neutral-dark  transition-colors duration-200">
                                                                    {brand.name}
                                                                </span>
                                                                {selectedFilters.brand_id?.includes(brand.slug) && (
                                                                    <motion.div
                                                                        className="ml-auto"
                                                                        initial={{ scale: 0 }}
                                                                        animate={{ scale: 1 }}
                                                                        exit={{ scale: 0 }}
                                                                    >
                                                                        <CheckCircle2 className="h-4 w-4 customtext-primary" />
                                                                    </motion.div>
                                                                )}
                                                            </motion.label>
                                                        ))}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Sección Categorías Mejorada */}
                                <motion.div 
                                    className={modernFilterStyles.filterSection}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <motion.button
                                        onClick={() => toggleSection("categoria")}
                                        className={modernFilterStyles.filterButton}
                                        whileHover={filterAnimations.hover}
                                        whileTap={filterAnimations.tap}
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.div 
                                                className="p-2 bg-primary rounded-lg shadow-md"
                                                animate={{ rotate: sections.categoria ? 360 : 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Layers className="h-4 w-4 text-white" />
                                            </motion.div>
                                            <div className="text-left">
                                                <span className="font-semibold customtext-neutral-dark">Categorías</span>
                                                <p className="text-xs customtext-neutral-dark">Explora por categorías</p>
                                            </div>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: sections.categoria ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ChevronDown className="h-5 w-5 customtext-neutral-dark" />
                                        </motion.div>
                                    </motion.button>
                                    
                                    <AnimatePresence>
                                        {sections.categoria && (
                                            <motion.div 
                                                className={`mt-4 p-4 ${modernFilterStyles.filterContent}`}
                                                {...filterAnimations.section}
                                            >
                                                {/* Barra de búsqueda */}
                                                <div className="relative mb-4">
                                                    <motion.div
                                                         className="absolute left-4 top-4 z-[99]"
                                                   
                                                    >
                                                        <Search className="h-4 w-4" />
                                                    </motion.div>
                                                    <input
                                                        type="text"
                                                        placeholder="Buscar categorías..."
                                                        className={modernFilterStyles.searchInput}
                                                        value={searchCategory}
                                                        onChange={(e) => setSearchCategory(e.target.value)}
                                                    />
                                                </div>
                                                
                                                {/* Lista de categorías con subcategorías */}
                                                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                                    <AnimatePresence>
                                                        {filteredCategories.map((category, index) => (
                                                            <motion.div 
                                                                key={category.id}
                                                                className=" rounded-xl overflow-hidden"
                                                                {...filterAnimations.item}
                                                                transition={{ delay: index * 0.05 }}
                                                            >
                                                                <motion.label 
                                                                    className={`${modernFilterStyles.label} `}
                                                                  
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        className={modernFilterStyles.checkbox}
                                                                        onChange={() => handleFilterChange("category_id", category.slug)}
                                                                        checked={selectedFilters.category_id?.includes(category.slug)}
                                                                    />
                                                                    <span className="text-sm line-clamp-1 customtext-neutral-dark  transition-colors duration-200">
                                                                        {category.name}
                                                                    </span>
                                                                    {selectedFilters.category_id?.includes(category.slug) && (
                                                                        <motion.div
                                                                            className="ml-auto"
                                                                            initial={{ scale: 0 }}
                                                                            animate={{ scale: 1 }}
                                                                            exit={{ scale: 0 }}
                                                                        >
                                                                            <CheckCircle2 className="h-4 w-4 customtext-primary" />
                                                                        </motion.div>
                                                                    )}
                                                                </motion.label>

                                                                {/* Subcategorías expandibles */}
                                                                <AnimatePresence>
                                                                    {selectedFilters.category_id?.includes(category.slug) && category.subcategories && (
                                                                        <motion.div
                                                                            className="bg-gradient-to-b from-purple-25 to-white/50 p-3"
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: "auto", opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            transition={{ duration: 0.3 }}
                                                                        >
                                                                            <div className="space-y-2 pl-4 border-l-2 border-purple-200">
                                                                                {category.subcategories.map((sub) => (
                                                                                    <motion.label 
                                                                                        key={sub.id} 
                                                                                        className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-purple-50/60 transition-colors duration-200 cursor-pointer group"
                                                                                        whileHover={{ x: 3 }}
                                                                                    >
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            className="h-4 w-4 rounded border-2 border-purple-300 text-purple-600 focus:ring-purple-500/30"
                                                                                            onChange={() => handleFilterChange("subcategory_id", sub.slug)}
                                                                                            checked={selectedFilters.subcategory_id?.includes(sub.slug)}
                                                                                        />
                                                                                        <span className="text-sm line-clamp-1 customtext-neutral-dark group-hover:text-purple-600 transition-colors duration-200">
                                                                                            {sub.name}
                                                                                        </span>
                                                                                    </motion.label>
                                                                                ))}
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
   {/* Sección Subcategorías Independiente */}
                                <motion.div 
                                    className={modernFilterStyles.filterSection}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                >
                                    <motion.button
                                        onClick={() => toggleSection("subcategoria")}
                                        className={modernFilterStyles.filterButton}
                                        whileHover={filterAnimations.hover}
                                        whileTap={filterAnimations.tap}
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.div 
                                                className="p-2 bg-primary rounded-lg shadow-md"
                                                animate={{ rotate: sections.subcategoria ? 360 : 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Grid3X3 className="h-4 w-4 text-white" />
                                            </motion.div>
                                            <div className="text-left">
                                                <span className="font-semibold customtext-neutral-dark">Subcategorías</span>
                                                <p className="text-xs customtext-neutral-dark">Busca por subcategorías específicas</p>
                                            </div>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: sections.subcategoria ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ChevronDown className="h-5 w-5 customtext-neutral-dark" />
                                        </motion.div>
                                    </motion.button>
                                    
                                    <AnimatePresence>
                                        {sections.subcategoria && (
                                            <motion.div 
                                                className={`mt-4 p-4 ${modernFilterStyles.filterContent}`}
                                                {...filterAnimations.section}
                                            >
                                                {/* Barra de búsqueda para subcategorías */}
                                                <div className="relative mb-4">
                                                    <motion.div
                                                       className="absolute left-4 top-4 z-[99]"
                                                        animate={{ scale: [1, 1.1, 1] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                    >
                                                        <Search className="h-4 w-4" />
                                                    </motion.div>
                                                    <input
                                                        type="text"
                                                        placeholder="Buscar subcategorías..."
                                                        className={modernFilterStyles.searchInput}
                                                        value={searchSubcategory}
                                                        onChange={(e) => setSearchSubcategory(e.target.value)}
                                                    />
                                                
                                                </div>
                                                
                                                {/* Lista de subcategorías mejorada */}
                                                <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                                                    <AnimatePresence>
                                                        {filteredSubcategories.length > 0 ? (
                                                            filteredSubcategories.map((subcategory, index) => (
                                                                <motion.label
                                                                    key={subcategory.id}
                                                                    className={modernFilterStyles.label}
                                                                    {...filterAnimations.item}
                                                                    transition={{ delay: index * 0.05 }}
                                                                >
                                                                    <input
                                                                   
                                                                        type="checkbox"
                                                                        className={modernFilterStyles.checkbox}
                                                                        onChange={() => handleFilterChange("subcategory_id", subcategory.slug)}
                                                                        checked={selectedFilters.subcategory_id?.includes(subcategory.slug)}
                                                                    />
                                                                    <span className="text-sm line-clamp-1 font-medium customtext-neutral-dark transition-colors duration-200">
                                                                        {subcategory.name}
                                                                    </span>
                                                                    {selectedFilters.subcategory_id?.includes(subcategory.slug) && (
                                                                        <motion.div
                                                                            className="ml-auto"
                                                                            initial={{ scale: 0 }}
                                                                            animate={{ scale: 1 }}
                                                                            exit={{ scale: 0 }}
                                                                        >
                                                                            <CheckCircle2 className="h-4 w-4 customtext-primary" />
                                                                        </motion.div>
                                                                    )}
                                                                </motion.label>
                                                            ))
                                                        ) : (
                                                            <motion.div 
                                                                className="text-center py-6 customtext-neutral-dark"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                            >
                                                                <Grid3X3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                                <p className="text-sm">No se encontraron subcategorías</p>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                                {/* Sección Precio Mejorada */}
                                <motion.div 
                                    className={modernFilterStyles.filterSection}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <motion.button
                                        onClick={() => toggleSection("precio")}
                                        className={modernFilterStyles.filterButton}
                                        whileHover={filterAnimations.hover}
                                        whileTap={filterAnimations.tap}
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.div 
                                                className="p-2 bg-primary rounded-lg shadow-md"
                                                animate={{ rotate: sections.precio ? 360 : 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <TrendingUp className="h-4 w-4 text-white" />
                                            </motion.div>
                                            <div className="text-left">
                                                <span className="font-semibold customtext-neutral-dark">Rango de Precio</span>
                                                <p className="text-xs customtext-neutral-dark">Encuentra tu presupuesto ideal</p>
                                            </div>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: sections.precio ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ChevronDown className="h-5 w-5 customtext-neutral-dark" />
                                        </motion.div>
                                    </motion.button>
                                    
                                    <AnimatePresence>
                                        {sections.precio && (
                                            <motion.div 
                                                className={`mt-4 p-4 ${modernFilterStyles.filterContent}`}
                                                {...filterAnimations.section}
                                            >
                                                <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar">
                                                    <AnimatePresence>
                                                        {staticPriceRanges.map((range, index) => (
                                                            <motion.label
                                                                key={`${range.min}-${range.max}`}
                                                                className={modernFilterStyles.label}
                                                                {...filterAnimations.item}
                                                                transition={{ delay: index * 0.05 }}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    className={modernFilterStyles.checkbox}
                                                                    onChange={() => handleFilterChange("price", range)}
                                                                    checked={
                                                                        selectedFilters.price?.some(
                                                                            (priceRange) => 
                                                                                priceRange.min === range.min && 
                                                                                priceRange.max === range.max
                                                                        ) || false
                                                                    }
                                                                />
                                                                <span className="text-sm line-clamp-1 font-medium customtext-neutral-dark  transition-colors duration-200">
                                                                    {range.label}
                                                                </span>
                                                                {selectedFilters.price?.some(
                                                                    (priceRange) => 
                                                                        priceRange.min === range.min && 
                                                                        priceRange.max === range.max
                                                                ) && (
                                                                    <motion.div
                                                                        className="ml-auto"
                                                                        initial={{ scale: 0 }}
                                                                        animate={{ scale: 1 }}
                                                                        exit={{ scale: 0 }}
                                                                    >
                                                                        <CheckCircle2 className="h-4 w-4 customtext-primary" />
                                                                    </motion.div>
                                                                )}
                                                            </motion.label>
                                                        ))}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                             

                                {/* Chips de filtros activos mejorados */}
                                <motion.div
                                    className="mt-6 pt-6 border-t border-gray-200/60"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <AnimatePresence>
                                        {(selectedFilters.brand_id?.length > 0 || 
                                          selectedFilters.category_id?.length > 0 || 
                                          selectedFilters.subcategory_id?.length > 0 || 
                                          (selectedFilters.price && selectedFilters.price.length > 0)) && (
                                            <motion.div
                                                className="mb-4"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                            >
                                                <h4 className="text-sm font-semibold customtext-neutral-dark mb-3 flex items-center gap-2">
                                                    <Star className="h-4 w-4 customtext-primary" />
                                                    Filtros Activos
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {/* Chips de marcas con AnimatedBadge */}
                                                    {selectedFilters.brand_id?.map((brandSlug) => {
                                                        const brand = brands.find(b => b.slug === brandSlug);
                                                        return brand ? (
                                                            <AnimatedBadge
                                                                key={brandSlug}
                                                             
                                                                onClick={() => handleFilterChange("brand_id", brandSlug)}
                                                                className="group"
                                                            >
                                                                <Tag className="h-3 w-3" />
                                                                <span>{brand.name}</span>
                                                                <motion.div
                                                                    className="ml-1  rounded-full p-0.5 transition-colors duration-200"
                                                                    whileHover={{ scale: 1.2 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </motion.div>
                                                            </AnimatedBadge>
                                                        ) : null;
                                                    })}
                                                    
                                                    {/* Chips de categorías con AnimatedBadge */}
                                                    {selectedFilters.category_id?.map((categorySlug) => {
                                                        const category = categories.find(c => c.slug === categorySlug);
                                                        return category ? (
                                                            <AnimatedBadge
                                                                key={categorySlug}
                                                              
                                                                onClick={() => handleFilterChange("category_id", categorySlug)}
                                                            >
                                                                <Layers className="h-3 w-3" />
                                                                <span>{category.name}</span>
                                                                <motion.div
                                                                    className="ml-1  rounded-full p-0.5 transition-colors duration-200"
                                                                    whileHover={{ scale: 1.2 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </motion.div>
                                                            </AnimatedBadge>
                                                        ) : null;
                                                    })}

                                                    {/* Chips de subcategorías con AnimatedBadge */}
                                                    {selectedFilters.subcategory_id?.map((subcategorySlug) => {
                                                        const subcategory = subcategories.find(sub => sub.slug === subcategorySlug);
                                                        return subcategory ? (
                                                            <AnimatedBadge
                                                                key={subcategorySlug}
                                                                onClick={() => handleFilterChange("subcategory_id", subcategorySlug)}
                                                            >
                                                                <Grid3X3 className="h-3 w-3" />
                                                                <span>{subcategory.name}</span>
                                                                <motion.div
                                                                    className="ml-1 rounded-full p-0.5 transition-colors duration-200"
                                                                    whileHover={{ scale: 1.2 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </motion.div>
                                                            </AnimatedBadge>
                                                        ) : null;
                                                    })}

                                                    {/* Chips de precio con AnimatedBadge */}
                                                    {selectedFilters.price?.map((priceRange, index) => {
                                                        const staticRange = staticPriceRanges.find(range => 
                                                            range.min === priceRange.min && 
                                                            range.max === priceRange.max
                                                        );
                                                        return (
                                                            <AnimatedBadge
                                                                key={`price-${priceRange.min}-${priceRange.max}`}
                                                                onClick={() => handleFilterChange("price", priceRange)}
                                                            >
                                                                <TrendingUp className="h-3 w-3" />
                                                                <span>
                                                                    {staticRange?.label || `S/ ${priceRange.min} - S/ ${priceRange.max}`}
                                                                </span>
                                                                <motion.div
                                                                    className="ml-1 rounded-full p-0.5 transition-colors duration-200"
                                                                    whileHover={{ scale: 1.2 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </motion.div>
                                                            </AnimatedBadge>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Botón de limpiar filtros mejorado */}
                                <motion.div
                                    className="mt-6 pt-6 border-t border-gray-200"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <motion.button
                                        className="w-full p-4 bg-secondary customtext-neutral-dark rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                                        onClick={() => {
                                            setSelectedFilters({
                                                collection_id: [],
                                                category_id: [],
                                                brand_id: [],
                                                subcategory_id: [],
                                                tag_id: [],
                                                price: [],
                                                name: null,
                                                sort_by: "created_at",
                                                order: "desc",
                                            });
                                            setFilterSequence([]);
                                        }}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-center justify-center gap-3">
                                          
                                                <Trash className="h-5 w-5" />
                                            
                                            <span>Limpiar todos los filtros</span>
                                        </div>
                                    </motion.button>
                                </motion.div>
                            </div>
                        </div>
</div>
                        {/* Footer móvil mejorado */}
                        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-white via-white to-gray-50 border-t border-gray-200 p-4 shadow-2xl backdrop-blur-xl lg:hidden z-50">
                            <div className="flex items-center gap-3">
                                <motion.button
                                    className="flex-1 bg-primary text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                                    onClick={() => {
                                        setFiltersOpen(false);
                                        // Removido el scroll automático - solo cerrar el panel
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <ShoppingBag className="h-5 w-5" />
                                        <span>Ver {pagination.totalItems} Productos</span>
                                    </div>
                                </motion.button>
                                
                                <motion.button
                                    className="p-3 bg-gray-100 hover:bg-gray-200 customtext-neutral-dark rounded-xl transition-colors duration-200"
                                    onClick={() => setFiltersOpen(false)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X className="h-5 w-5" />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Área de productos mejorada */}
                    <motion.div 
                        className="w-full lg:w-9/12 py-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
               
                     

                        {/* Grid de productos con animaciones mejoradas */}
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div 
                                    className="w-full"
                                    key="loading"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
                                >
                                    {/* Header de loading mejorado */}
                                    <motion.div 
                                        className="mb-8 text-center"
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <motion.div
                                            animate={{ 
                                                rotate: [0, 360],
                                                scale: [1, 1.1, 1]
                                            }}
                                            transition={{ 
                                                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                                                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                                            }}
                                            className="inline-block mb-4"
                                        >
                                            <Sparkles className="h-8 w-8 customtext-primary" />
                                        </motion.div>
                                        <h3 className="text-xl font-bold customtext-neutral-dark mb-2">Cargando productos increíbles</h3>
                                        <p className="customtext-neutral-dark">Preparando la mejor selección para ti...</p>
                                    </motion.div>

                                    {/* Grid de skeleton cards */}
                                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                                        {Array.from({ length: 12 }, (_, index) => (
                                            <div key={index} className="h-[400px] lg:h-[460px] xl:h-[400px] 2xl:h-[430px]">
                                                <SkeletonCard delay={index * 0.08} />
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    className="flex items-center flex-wrap gap-y-8 transition-all duration-300 ease-in-out"
                                    key="products"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {Array.isArray(products) && products.length > 0 ? (
                                        products.map((product, index) => (
                                            <motion.div
                                                className="w-1/2 lg:w-1/3 xl:w-1/4 lg:h-[460px] lg:max-h-[500px] xl:h-[450px] xl:max-h-[450px] 2xl:h-[450px] 2xl:max-h-[450px] flex items-center justify-center"
                                                key={product.id}
                                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ 
                                                    delay: index * 0.1,
                                                    duration: 0.5,
                                                    type: "spring",
                                                    stiffness: 100
                                                }}
                                                whileHover={{ 
                                                    y: -5,
                                                    transition: { duration: 0.2 }
                                                }}
                                            >
                                                <CardHoverBtn
                                                    data={data}
                                                    product={product}
                                                    widthClass="w-full sm:w-full lg:w-full"
                                                    cart={cart}
                                                    setCart={setCart}
                                                />
                                            </motion.div>
                                        ))
                                    ) : (
                                        <motion.div
                                            className="w-full flex items-center justify-center py-16"
                                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                                        >
                                            <div className="text-center space-y-6">
                                               
                                                <motion.div 
                                                    className="space-y-3"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                >
                                                    <h3 className="text-xl font-bold customtext-neutral-dark">¡Ups! No encontramos productos</h3>
                                                    <p className="customtext-neutral-dark max-w-md">Intenta ajustar tus filtros o buscar términos diferentes.</p>
                                                    <motion.button
                                                        className="mt-4 px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                                        onClick={() => {
                                                            setSelectedFilters({
                                                                collection_id: [],
                                                                category_id: [],
                                                                brand_id: [],
                                                                subcategory_id: [],
                                                                tag_id: [],
                                                                price: [],
                                                                name: null,
                                                                sort_by: "created_at",
                                                                order: "desc",
                                                            });
                                                            setFilterSequence([]);
                                                        }}
                                                        whileHover={{ scale: 1.05, y: -2 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Trash className="h-4 w-4" />
                                                            <span>Limpiar filtros</span>
                                                        </div>
                                                    </motion.button>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {/* Paginación mejorada */}
                        {Array.isArray(products) && products.length > 0 && (
                        <motion.div
                            className="flex flex-col md:flex-row justify-between items-center mb-4 w-full mt-12 gap-4 p-6 bg-gradient-to-r from-white via-gray-50/50 to-blue-50/50 rounded-2xl border border-gray-200/60 backdrop-blur-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            {/* Navegación de páginas mejorada */}
                            <div className="customtext-primary font-semibold w-full md:w-auto">
                                <div className="overflow-x-auto pb-2">
                                    <nav className="flex items-center gap-x-2 min-w-max">
                                        <motion.button
                                            className={`p-3 inline-flex items-center gap-2 rounded-xl transition-all duration-300 ${
                                                pagination.currentPage === 1
                                                    ? "opacity-50 cursor-not-allowed bg-gray-100"
                                                    : "bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 customtext-primary border border-blue-200"
                                            }`}
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                            disabled={pagination.currentPage === 1}
                                          
                                            whileTap={pagination.currentPage !== 1 ? { scale: 0.95 } : {}}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            <span className="hidden sm:inline">Anterior</span>
                                        </motion.button>

                                        {getPageNumbers().map((page, index) => (
                                            <React.Fragment key={index}>
                                                {page === "..." ? (
                                                    <span className="w-10 h-10 bg-transparent p-2 inline-flex items-center justify-center rounded-full customtext-neutral-dark">
                                                        ...
                                                    </span>
                                                ) : (
                                                    <motion.button
                                                        className={`w-10 h-10 p-2 inline-flex items-center justify-center rounded-xl transition-all duration-300 font-semibold
                                                        ${page === pagination.currentPage
                                                            ? " bg-primary text-white shadow-lg shadow-blue-500/25"
                                                            : "bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 customtext-primary border border-gray-200 hover:border-blue-300"
                                                        }`}
                                                        onClick={() => handlePageChange(page)}
                                                        whileHover={{ scale: 1.1, y: -2 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        {page}
                                                    </motion.button>
                                                )}
                                            </React.Fragment>
                                        ))}

                                        <motion.button
                                            className={`p-3 inline-flex items-center gap-2 rounded-xl transition-all duration-300 ${
                                                pagination.currentPage === pagination.totalPages
                                                    ? "opacity-50 cursor-not-allowed bg-gray-100"
                                                    : "bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 customtext-primary border border-blue-200"
                                            }`}
                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                            disabled={pagination.currentPage === pagination.totalPages}
                                          
                                            whileTap={pagination.currentPage !== pagination.totalPages ? { scale: 0.95 } : {}}
                                        >
                                            <span className="hidden sm:inline">Siguiente</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </motion.button>
                                    </nav>
                                </div>
                            </div>
                            
                            {/* Información de paginación mejorada */}
                            <motion.div 
                                className="w-full md:w-auto text-center md:text-right"
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="flex items-center justify-center md:justify-end gap-2 p-4">
                                
                                    <p className="font-semibold text-sm customtext-neutral-dark">
                                        {pagination.from} - {pagination.to} de {pagination.totalItems} Resultados
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default CatalagoFiltros;

// CSS-in-JS para scrollbar personalizado y efectos adicionales
const customStyles = `
    .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #cbd5e1 #f1f5f9;
    }
    
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 10px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        border-radius: 10px;
        border: 1px solid #e2e8f0;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #2563eb, #4f46e5);
    }
    
    @keyframes shimmer {
        0% {
            transform: translateX(-100%) skew(-12deg);
        }
        100% {
            transform: translateX(200%) skew(-12deg);
        }
    }
    
    .animate-shimmer {
        animation: shimmer 2s infinite;
    }
    
    @keyframes float {
        0%, 100% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-5px);
        }
    }
    
    .filter-shadow {
        box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 0 0 1px rgba(59, 130, 246, 0.1),
            0 0 20px rgba(59, 130, 246, 0.1);
    }
    
    .gradient-border {
        position: relative;
        background: linear-gradient(white, white) padding-box,
                    linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6) border-box;
        border: 2px solid transparent;
    }
`;

// Inyectar estilos en el documento
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = customStyles;
    document.head.appendChild(styleSheet);
}

// Componente de Tooltip personalizado para mejor UX
const Tooltip = ({ children, text, position = "top" }) => {
    const [show, setShow] = useState(false);
    
    const positionClasses = {
        top: "-top-10 left-1/2 -translate-x-1/2",
        bottom: "-bottom-10 left-1/2 -translate-x-1/2",
        left: "-left-2 top-1/2 -translate-y-1/2 -translate-x-full",
        right: "-right-2 top-1/2 -translate-y-1/2 translate-x-full"
    };
    
    return (
        <div 
            className="relative inline-block"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            <AnimatePresence>
                {show && (
                    <motion.div
                        className={`absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap ${positionClasses[position]}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                    >
                        {text}
                        <div className={`absolute w-0 h-0 border-l-4 border-r-4 border-transparent ${
                            position === 'top' ? 'border-t-4 border-t-gray-900 top-full left-1/2 -translate-x-1/2' :
                            position === 'bottom' ? 'border-b-4 border-b-gray-900 bottom-full left-1/2 -translate-x-1/2' :
                            position === 'left' ? 'border-l-4 border-l-gray-900 left-full top-1/2 -translate-y-1/2' :
                            'border-r-4 border-r-gray-900 right-full top-1/2 -translate-y-1/2'
                        }`} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Componente de Badge con animación mejorada
const AnimatedBadge = ({ children, color = "blue", onClick, className = "" }) => {
    const colorClasses = {
        blue: "bg-secondary border-blue-200 customtext-primary",
      
    };
    
    return (
        <motion.div
            className={`inline-flex items-center gap-2 px-3 py-1.5  ${colorClasses[color]} border rounded-full text-sm font-medium cursor-pointer select-none ${className}`}
            onClick={onClick}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {children}
        </motion.div>
    );
};

// Hook personalizado para animaciones de lista
const useStaggerAnimation = (items, delay = 0.1) => {
    return {
        container: {
            animate: {
                transition: {
                    staggerChildren: delay
                }
            }
        },
        item: {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -20 }
        }
    };
};


