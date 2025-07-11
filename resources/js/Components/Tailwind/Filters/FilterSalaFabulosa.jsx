import React, { useEffect, useState } from "react";
import CardHoverBtn from "../Products/Components/CardHoverBtn";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Filter,
    Search,
    Tag,
    X,
} from "lucide-react";
import ItemsRest from "../../../Actions/ItemsRest";
import ArrayJoin from "../../../Utils/ArrayJoin";
import { Loading } from "../Components/Resources/Loading";
import { NoResults } from "../Components/Resources/NoResult";
import SelectForm from "./Components/SelectForm";
import ProductCard from "../Components/ProductCard";
import ProductCardSimple from "../Products/Components/ProductCardSimple";
import ProductCardColors from "../Products/Components/ProductCardColors";
import { GET } from "sode-extend-react";
import Modal from "react-modal";

const itemsRest = new ItemsRest();

//const FilterSalaFabulosa = ({ items, data, categories, brands, prices, cart, setCart }) => {
const FilterSalaFabulosa = ({ items, data, filteredData, cart, setCart }) => {
    // const { collections, categories, brands, priceRanges } = filteredData;
    const [collections, setCollections] = useState([]);
    const [brands, setBrands] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [priceRanges, setPriceRanges] = useState([]);
    const [sections, setSections] = useState({
        collection: data?.collection ? false : true,
        marca: data?.brand ? true : false,
        precio: true,
        categoria: data?.category ? true : false,
        colores: data?.color ? true : false,
    });
    // Nuevo estado para controlar si estamos en móvil
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    const [filterSequence, setFilterSequence] = useState([]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Alternar secciones de filtros
    const toggleSection = (section) => {
        if (isMobile) {
            // En móvil: colapsar todos excepto el que se está abriendo
            setSections(prev => {
                const newState = {
                    collection: false,
                    marca: false,
                    precio: false,
                    categoria: false,
                    colores: false,
                };
                newState[section] = !prev[section];
                return newState;
            });
        } else {
            // En desktop: comportamiento normal
            setSections(prev => ({
                ...prev,
                [section]: !prev[section],
            }));
        }
    };

    const clearAllFilters = () => {
        setSelectedFilters({
            collection_id: [],
            category_id: [],
            brand_id: [],
            subcategory_id: [],
            price: null,
            name: null,
            sort_by: "created_at",
            order: "desc",
        });
        setFilterSequence([]);
    };



    const [selectedFilters, setSelectedFilters] = useState({
        collection_id: GET.collection ? GET.collection.split(',') : [],
        category_id: GET.category ? GET.category.split(',') : [],
        brand_id: GET.brand ? GET.brand.split(',') : [],
        subcategory_id: GET.subcategory ? GET.subcategory.split(',') : [],
        price: null,
        name: GET.search || null,
        sort_by: "created_at",
        order: "desc",
    });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 21,
        from: 0,
        to: 0,
    });

    const hasActiveFilters =
        selectedFilters.collection_id.length > 0 ||
        selectedFilters.category_id.length > 0 ||
        selectedFilters.brand_id.length > 0 ||
        selectedFilters.subcategory_id.length > 0 ||
        selectedFilters.price !== null ||
        selectedFilters.name !== null;

    const transformFilters = (filters) => {
        const transformedFilters = [];

        if (filters.collection_id.length > 0) {
            const collectionConditions = filters.collection_id.map((id) => [
                "collection.slug",
                "=",
                id,
            ]);
            transformedFilters.push(ArrayJoin(collectionConditions, 'or'));
        }
        // Categorías

        if (filters.category_id.length > 0) {
            const categoryConditions = filters.category_id.map((id) => [
                "category.slug",
                "=",
                id,
            ]);
            transformedFilters.push(ArrayJoin(categoryConditions, 'or'));
        }
        //subcategorias
        if (filters.subcategory_id.length > 0) {
            const subcategoryConditions = filters.subcategory_id.map((id) => [
                "subcategory.slug",
                "=",
                id,
            ]);
            transformedFilters.push(ArrayJoin(subcategoryConditions, 'or'));
        }
        // Marcas
        if (filters.brand_id.length > 0) {
            const brandConditions = filters.brand_id.map((id) => [
                "brand.slug",
                "=",
                id,
            ]);
            transformedFilters.push(ArrayJoin(brandConditions, 'or'));
        }

        // Precio


        if (filters.price?.min && filters.price?.max) {
            transformedFilters.push([
                ["final_price", ">=", filters.price.min],
                "or",
                ["final_price", "<=", filters.price.max],
            ]);
        }

        // Búsqueda (asumiendo que se filtra por título o contenido)
        if (filters.name) {
            transformedFilters.push(["name", "contains", filters.name]);
        }
        return ArrayJoin(transformedFilters, 'and');
    };

    // Obtener productos filtrados desde el backend
    const fetchProducts = async (page = 1) => {
        setLoading(true);
        try {
            // Transformar los filtros al formato esperado por el backend
            const filters = transformFilters(selectedFilters);

            // Crear un objeto con los filtros principales según su orden de aplicación
            const orderedFilters = {};

            // Añadir los filtros en el orden registrado
            // filterSequence.forEach(filterType => {
            //     if (filterType === 'collection_id' && selectedFilters.collection_id.length > 0) {
            //         orderedFilters.primary_filter = 'collection';
            //     } else if (filterType === 'category_id' && selectedFilters.category_id.length > 0) {
            //         orderedFilters.secondary_filter = 'category';
            //     } else if (filterType === 'price' && selectedFilters.price) {
            //         orderedFilters.tertiary_filter = 'price';
            //     }
            // });

            const params = {
                filter: filters,
                sort: selectedFilters.sort,
                skip: (page - 1) * pagination.itemsPerPage,
                take: pagination.itemsPerPage,
                requireTotalCount: true,
                // Añadir la información de orden de filtros
                filterSequence
            };

            const response = await itemsRest.paginate(params);

            setProducts(response.data);
            setPagination({
                currentPage: page,
                totalPages: Math.ceil(
                    response.totalCount / pagination.itemsPerPage
                ),
                totalItems: response.totalCount,
                itemsPerPage: pagination.itemsPerPage,
                from: (page - 1) * pagination.itemsPerPage + 1,
                to: Math.min(
                    page * pagination.itemsPerPage,
                    response.totalCount
                ),
            });
            console.log(response);
            setCollections(response?.summary.collections);
            setBrands(response?.summary.brands);
            setCategories(response?.summary.categories);
            setSubcategories(response?.summary.subcategories);
            setPriceRanges(response?.summary.priceRanges);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(pagination.currentPage);
    }, [selectedFilters]);

    // Función para manejar el cambio de página
    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.totalPages) {
            fetchProducts(page);
        }
    };

    // Función para generar los números de página a mostrar
    const getPageNumbers = () => {
        const pages = [];
        const total = pagination.totalPages;
        const current = pagination.currentPage;
        const delta = 2; // Número de páginas a mostrar alrededor de la actual

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

    // Manejar cambios en los filtros
    const handleFilterChange = (type, value) => {
        setFilterSequence(prev => {
            // Verificamos si el filtro se está activando o desactivando
            let isActivating = false;

            if (type === "price") {
                // Para price, verificamos si se está activando o desactivando
                isActivating = !!value;
            } else {
                // Para los demás filtros (arrays), verificamos si se está añadiendo o quitando
                const currentValues = Array.isArray(selectedFilters[type]) ? selectedFilters[type] : [];
                isActivating = !currentValues.includes(value);
            }

            // Si el tipo ya existe en la secuencia y se está activando, mantenemos la secuencia como está
            if (prev.includes(type) && isActivating) {
                return prev;
            }
            
            // Si el tipo no existe y se está activando, lo añadimos al final
            if (!prev.includes(type) && isActivating) {
                return [...prev, type];
            }
            
            // Si se está desactivando y es el último filtro de ese tipo, lo removemos
            if (!isActivating) {
                // Verificamos si después de esta acción no quedarán más filtros de este tipo
                let willHaveNoFiltersOfThisType = false;
                
                if (type === "price") {
                    // Para price, si value es null, no quedarán filtros
                    willHaveNoFiltersOfThisType = !value;
                } else {
                    // Para arrays, verificamos si después de quitar este valor no quedarán más
                    const currentValues = Array.isArray(selectedFilters[type]) ? [...selectedFilters[type]] : [];
                    const newValues = currentValues.filter(item => item !== value);
                    willHaveNoFiltersOfThisType = newValues.length === 0;
                }
                
                // Solo removemos de la secuencia si no quedarán más filtros de este tipo
                return willHaveNoFiltersOfThisType ? prev.filter(item => item !== type) : prev;
            }
            
            return prev;
        });
        setSelectedFilters((prev) => {
            if (type === "price") {
                return {
                    ...prev,
                    price:
                        prev.price &&
                            prev.price.min === value?.min &&
                            prev.price.max === value?.max
                            ? null
                            : value,
                };
            }

            const currentValues = Array.isArray(prev[type]) ? prev[type] : [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter((item) => item !== value)
                : [...currentValues, value];

            return { ...prev, [type]: newValues };
        });
    };

    const sortOptions = [
        { value: "created_at:desc", label: "Más reciente" },
        { value: "created_at:asc", label: "Mas antiguo" },
        { value: "final_price:asc", label: "Precio: Menor a Mayor" },
        { value: "final_price:desc", label: "Precio: Mayor a Menor" },
        { value: "name:asc", label: "Nombre: A-Z" },
        { value: "name:desc", label: "Nombre: Z-A" },
    ];

    const [searchCategory, setSearchCategory] = useState("");
    const [searchCollection, setSearchCollection] = useState("");
    const [searchBrand, setSearchBrand] = useState("");
    const filteredCollections = collections?.filter((collection) =>
        collection.name.toLowerCase().includes(searchCollection.toLowerCase())
    );

    // Filtrar categorías según el input
    const filteredCategories = categories?.filter((category) =>
        category.name.toLowerCase().includes(searchCategory.toLowerCase())
    );

    // Filtrar marcas según el input
    const filteredBrands = brands?.filter((brand) =>
        brand.name.toLowerCase().includes(searchBrand.toLowerCase())
    );

    const [filtersOpen, setFiltersOpen] = useState(false); // Añadir estado para mobile
    const [isOpen, setIsOpen] = useState(false)
    const [isVisible, setIsVisible] = useState(false);

    const openModal = () => {
        setIsOpen(true);
        // Forzamos un pequeño delay para que React actualice el DOM antes de la animación
        setTimeout(() => setIsVisible(true), 10);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setIsVisible(false);
        // Esperamos a que termine la animación antes de cerrar completamente
        setTimeout(() => setIsOpen(false), 300);
        document.body.style.overflow = 'auto';
    };

    const customStyles = {
        overlay: {
            backgroundColor: isVisible ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0)",
            zIndex: 50,
            transition: 'background-color 300ms ease-in-out',
        },
        content: {
            top: "auto",
            left: "0",
            right: "0",
            bottom: "0",
            borderRadius: "1rem 1rem 0 0",
            border: "none",
            padding: "0",
            height: "85vh",
            transform: isVisible ? "translateY(0)" : "translateY(100%)",
            transition: "transform 300ms ease-in-out",
            willChange: 'transform', // Mejora el rendimiento de la animación
        },
    };

    const renderFilters = () => (
        <div className="flex-1 overflow-y-auto px-4 pb-20 lg:pb-0 lg:px-0">
            <div className="sticky top-0 bg-white py-4 border-b flex justify-between items-center lg:hidden">
                <h2 className="text-xl font-bold">Filtros</h2>
                <button onClick={closeModal}>
                    <X className="h-6 w-6" />
                </button>
            </div>

            <p className="customtext-primary text-2xl font-bold pb-4 mb-4 border-b lg:block hidden">
                Combina como desees tu sala
            </p>

            {/* <div className="mb-4">
                <button
                    onClick={clearAllFilters}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    <X size={16} />
                    <span>Limpiar todos los filtros</span>
                </button>
            </div> */}

            {hasActiveFilters && (
                <div className="mb-4">
                    <button onClick={clearAllFilters} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                        <X size={16} />
                        <span>Limpiar todos los filtros</span>
                    </button>
                </div>
            )}

            {/* Colecciones */}
            <div className="mt-2 mb-4">
                <button
                    onClick={() => toggleSection("collection")}
                    className="flex items-center justify-between w-full mb-2 p-2 lg:p-0"
                >
                    <span className="font-medium">Colecciones</span>
                    <ChevronUp
                        className={`h-5 w-5 transform transition-transform ${sections.collection ? "" : "-rotate-180"
                            }`}
                    />
                </button>

                {sections.collection && (
                    <div className="space-y-4">
                        <div className="relative hidden md:flex">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar"
                                className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-0 focus:outline-0"
                                value={searchCollection}
                                onChange={(e) => setSearchCollection(e.target.value)}
                            />
                        </div>
                        <div className="max-h-[200px] xl:max-h-none overflow-y-auto space-y-1 md:space-y-2">
                            {filteredCollections?.map((collection) => {
                                const isChecked = selectedFilters.collection_id?.includes(collection.slug);
                                return (
                                    <div
                                        key={collection.id}
                                        className={`group flex items-center gap-3 p-2 rounded-lg ${isChecked
                                            ? "bg-secondary"
                                            : "hover:bg-gray-50"
                                            }`}
                                    >
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 accent-primary form-checkbox focus:ring-0 customtext-neutral-dark"
                                                onChange={() => handleFilterChange("collection_id", collection.slug)}
                                                checked={isChecked}
                                            />
                                            <img
                                                src={`/storage/images/collection/${collection.image}`}
                                                onError={(e) => e.target.src = "assets/img/noimage/no_imagen_circular.png"}
                                                className="w-8 h-8 rounded-full object-cover"
                                                alt={collection.name}
                                            />
                                            <span className="text-sm lg:text-base">{collection.name}</span></label>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Categorías */}
            <div className="mb-4">
                <button
                    onClick={() => toggleSection("categoria")}
                    className="flex items-center justify-between w-full mb-2 p-2 lg:p-0"
                >
                    <span className="font-medium">Categorías</span>
                    <ChevronUp
                        className={`h-5 w-5 transform transition-transform ${sections.categoria ? "" : "-rotate-180"
                            }`}
                    />
                </button>
                {sections.categoria && (
                    <div className="space-y-4">
                        <div className="relative hidden md:flex">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar"
                                className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-0 focus:outline-0"
                                value={searchCategory}
                                onChange={(e) => setSearchCategory(e.target.value)}
                            />
                        </div>
                        <div className="max-h-[200px] xl:max-h-none overflow-y-auto space-y-1 md:space-y-2">
                            {filteredCategories?.map((category) => {
                                const isChecked = selectedFilters.category_id?.includes(category.slug);
                                return (
                                    <div
                                        key={category.id}
                                        className={`group flex items-center gap-3 p-2 rounded-lg ${isChecked
                                            ? "bg-secondary"
                                            : "hover:bg-gray-50"
                                            }`}
                                    >
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 accent-primary form-checkbox focus:ring-0 customtext-neutral-dark"
                                                onChange={() => handleFilterChange("category_id", category.slug)}
                                                checked={isChecked}
                                            />
                                            <img
                                                src={`/storage/images/category/${category.image}`}
                                                onError={(e) => e.target.src = "assets/img/noimage/no_imagen_circular.png"}
                                                className="w-8 h-8 rounded-full object-cover"
                                                alt={category.name}
                                            />
                                            <span className="text-sm lg:text-base">{category.name}</span></label>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Precio */}
            <div className="mb-4">
                <button
                    onClick={() => toggleSection("precio")}
                    className="flex items-center justify-between w-full mb-2 p-2 lg:p-0"
                >
                    <span className="font-medium">Precio</span>
                    <ChevronUp
                        className={`h-5 w-5 transform transition-transform ${sections.precio ? "" : "-rotate-180"
                            }`}
                    />
                </button>
                {sections.precio && (
                    <div className="max-h-[200px] xl:max-h-none overflow-y-auto space-y-1 md:space-y-2">
                        {priceRanges.map((range) => {
                            const isSelected = selectedFilters.price?.min === range.min &&
                                selectedFilters.price?.max === range.max
                            return <label
                                key={`${range.min}-${range.max}`}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                onClick={() => {
                                    if (isSelected) {
                                        handleFilterChange("price", null)
                                    } else {
                                        handleFilterChange("price", range)
                                    }
                                }}
                            >
                                <div className={`w-[18px] h-[18px] rounded-full border ${isSelected ? 'border-primary' : 'border-gray-300'} flex items-center justify-center`}>
                                    {isSelected && (
                                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                                    )}
                                </div>
                                <span className="text-sm lg:text-base">{`S/ ${range.min} - S/ ${range.max}`}</span>
                            </label>
                        })}
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 h-20 flex items-center lg:hidden">
                <button
                    className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors"
                    onClick={closeModal}
                >
                    Ver resultados
                </button>
            </div>
        </div>
    );



    return (
        <>
            {/* Botón flotante fijo */}
            {/* <button
                onClick={openModal}
                className="fixed flex xl:hidden left-1 top-2/3 transform -translate-y-1/2 bg-primary text-white rounded-full p-3 shadow-lg z-40 items-center justify-center"
                aria-label="Abrir filtros"
        >
            <Filter className="w-6 h-6" />
        </button> */}

            <Modal
                isOpen={isOpen}
                onRequestClose={closeModal}
                style={customStyles}
                closeTimeoutMS={300}
                ariaHideApp={false}
                shouldCloseOnOverlayClick={true}
                shouldCloseOnEsc={true}
            >
                {renderFilters()}
            </Modal>

            <section className="py-6 font-font-general customtext-primary">
                <div className="mx-auto px-primary">

                    <p className="customtext-primary text-3xl font-bold mb-2 xl:hidden">
                        Combina como desees tu sala
                    </p>

                    <div className="relative flex flex-col xl:flex-row gap-10">
                        {/* Contenedor de Filtros (Modificado para mobile) */}
                        <div className="hidden xl:block xl:w-1/4 lg:bg-white lg:p-0 xl:rounded-lg xl:h-max">
                            {renderFilters()}
                        </div>

                        <div className="w-full pb-4">
                            {/* flex flex-col lg:flex-row lg:justify-between items-start */}
                            <div className="mb-4 lg:mb-8 w-full gap-5 xl:flex xl:flex-row xl:justify-between items-start">
                                {/* Ordenación <span className='block w-6/12'>Productos seleccionados: <strong>{products?.length}</strong></span>*/}
                                <div className="flex flex-row justify-between items-end gap-5">
                                    <div className="flex flex-col xl:flex-row xl:justify-between gap-2 xl:items-center lg:max-w-xs w-full">
                                        <label className="font-semibold text-base 2xl:text-lg w-auto">
                                            Ordenar por
                                        </label>
                                        <div className="min-w-52">
                                            <SelectForm
                                                options={sortOptions}
                                                placeholder="Recomendados"
                                                onChange={(value) => {
                                                    const [selector, order] =
                                                        value.split(":");
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
                                                className="border-primary rounded-full customtext-primary w-full"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <button
                                            onClick={openModal}
                                            className="flex xl:hidden bg-primary text-white rounded-full p-3 shadow-lg z-40 items-center justify-center"
                                            aria-label="Abrir filtros"
                                        >
                                            <Filter className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                <div className="hidden xl:flex customtext-primary font-semibold w-full lg:w-auto">
                                    <div className="flex gap-3 items-center w-full">
                                        <div className="customtext-primary font-semibold">
                                            <nav className="flex items-center gap-x-1 min-w-max">
                                                <button
                                                    className={`p-0 inline-flex items-center ${pagination.currentPage === 1
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : ""
                                                        }`}
                                                    onClick={() =>
                                                        handlePageChange(
                                                            pagination.currentPage -
                                                            1
                                                        )
                                                    }
                                                    disabled={
                                                        pagination.currentPage === 1
                                                    }
                                                >
                                                    <ChevronLeft />
                                                </button>

                                                {getPageNumbers().map(
                                                    (page, index) => (
                                                        <React.Fragment key={index}>
                                                            {page === "..." ? (
                                                                <span className="w-10 h-10 bg-transparent p-2 inline-flex items-center justify-center rounded-full">
                                                                    ...
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    className={`w-10 h-10 p-2 inline-flex items-center justify-center rounded-full transition-all duration-300 
                                           
                                            ${page === pagination.currentPage
                                                                            ? "bg-accent text-white"
                                                                            : "bg-transparent hover:text-white hover:bg-accent"
                                                                        }`}
                                                                    onClick={() =>
                                                                        handlePageChange(
                                                                            page
                                                                        )
                                                                    }
                                                                >
                                                                    {page}
                                                                </button>
                                                            )}
                                                        </React.Fragment>
                                                    )
                                                )}

                                                <button
                                                    className={`p-0 inline-flex items-center ${pagination.currentPage ===
                                                        pagination.totalPages
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : ""
                                                        }`}
                                                    onClick={() =>
                                                        handlePageChange(
                                                            pagination.currentPage +
                                                            1
                                                        )
                                                    }
                                                    disabled={
                                                        pagination.currentPage ===
                                                        pagination.totalPages
                                                    }
                                                >
                                                    <ChevronRight />
                                                </button>
                                            </nav>
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                {pagination.from} - {pagination.to}{" "}
                                                de {pagination.totalItems}{" "}
                                                Resultados
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Productos */}
                            {loading ? (
                                <Loading />
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 xl:gap-8 gap-y-2 lg:gap-y-3 transition-all duration-300 ease-in-out">
                                    {Array.isArray(products) &&
                                        products.length > 0 ? (
                                        products.map((product) => (
                                            <ProductCardColors
                                                key={product.id}
                                                product={product}
                                                widthClass="lg:w-1/3"
                                                cart={cart}
                                                setCart={setCart}
                                            />
                                        ))
                                    ) : (
                                        <NoResults />
                                    )}
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-4 w-full mt-8">
                                <div className="customtext-primary font-semibold">
                                    <div className="flex justify-between items-center mb-4 w-full mt-8">
                                        <div className="customtext-primary font-semibold">
                                            <nav className="flex items-center gap-x-2 min-w-max">
                                                <button
                                                    className={`p-4 inline-flex items-center ${pagination.currentPage === 1
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : ""
                                                        }`}
                                                    onClick={() =>
                                                        handlePageChange(
                                                            pagination.currentPage -
                                                            1
                                                        )
                                                    }
                                                    disabled={
                                                        pagination.currentPage === 1
                                                    }
                                                >
                                                    <ChevronLeft />
                                                </button>

                                                {getPageNumbers().map(
                                                    (page, index) => (
                                                        <React.Fragment key={index}>
                                                            {page === "..." ? (
                                                                <span className="w-10 h-10 bg-transparent p-2 inline-flex items-center justify-center rounded-full">
                                                                    ...
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    className={`w-10 h-10 p-2 inline-flex items-center justify-center rounded-full transition-all duration-300 
                                            ${page === pagination.currentPage
                                                                            ? "bg-accent text-white"
                                                                            : "bg-transparent hover:text-white hover:bg-accent"
                                                                        }`}
                                                                    onClick={() =>
                                                                        handlePageChange(
                                                                            page
                                                                        )
                                                                    }
                                                                >
                                                                    {page}
                                                                </button>
                                                            )}
                                                        </React.Fragment>
                                                    )
                                                )}

                                                <button
                                                    className={`p-4 inline-flex items-center ${pagination.currentPage ===
                                                        pagination.totalPages
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : ""
                                                        }`}
                                                    onClick={() =>
                                                        handlePageChange(
                                                            pagination.currentPage +
                                                            1
                                                        )
                                                    }
                                                    disabled={
                                                        pagination.currentPage ===
                                                        pagination.totalPages
                                                    }
                                                >
                                                    <ChevronRight />
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-semibold">
                                        {pagination.from} - {pagination.to} de{" "}
                                        {pagination.totalItems} Resultados
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                    {/* Paginación 
                <div>
                    <button
                        disabled={pagination.currentPage === 1}
                        onClick={() => fetchProducts(pagination.currentPage - 1)}
                    >
                        Anterior
                    </button>
                    <span>
                        Página {pagination.currentPage} de {pagination.totalPages}
                    </span>
                    <button
                        disabled={pagination.currentPage === pagination.totalPages}
                        onClick={() => fetchProducts(pagination.currentPage + 1)}
                    >
                        Siguiente
                    </button>
                </div>*/}
                </div>
            </section>

        </>
    );
};

export default FilterSalaFabulosa;