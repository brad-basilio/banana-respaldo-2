import { useState, useEffect, useRef } from "react";
import { Search, X, ChevronRight, ChevronLeft, Home, ShoppingCart, User, Menu } from "lucide-react";
import MenuSimple from "../../Menu/MenuSimple";

export default function MobileMenu({ search, setSearch, pages, items, onClose }) {
    const [menuLevel, setMenuLevel] = useState("main");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [previousMenus, setPreviousMenus] = useState([]);
    const [animationDirection, setAnimationDirection] = useState("right"); // "right" o "left" para las animaciones

    // Referencia para el input de búsqueda
    const searchInputRef = useRef(null);

    // Función para manejar el submit del formulario de búsqueda
    const handleSearchSubmit = (event) => {
        event.preventDefault();
        if (search.trim()) {
            const trimmedSearch = search.trim();
            window.location.href = `/catalogo?search=${encodeURIComponent(trimmedSearch)}`;
        }
        return false;
    };

    // Función para manejar el Enter y el icono de búsqueda del teclado móvil
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (search.trim()) {
                const trimmedSearch = search.trim();
                window.location.href = `/catalogo?search=${encodeURIComponent(trimmedSearch)}`;
            }
        }
    };

    // Función para manejar la navegación con animaciones
    const navigateTo = (level, direction = "right", categoryName = null) => {
        setAnimationDirection(direction);
        
        if (categoryName) {
            setSelectedCategory(categoryName);
        }
        
        setTimeout(() => {
            setMenuLevel(level);
        }, 50); // Pequeño retraso para la animación
    };

    const handleCategoryClick = (category) => {
        setSelectedSubcategory(category.name);
        setPreviousMenus([...previousMenus, { level: menuLevel, name: "Categorías" }]);
        navigateTo("subcategories", "right", category.name);
    };

    const handleBackClick = () => {
        if (previousMenus.length > 0) {
            const lastMenu = previousMenus[previousMenus.length - 1];
            navigateTo(lastMenu.level, "left");
            setPreviousMenus(previousMenus.slice(0, -1));
        } else {
            if (menuLevel === "subcategories") {
                navigateTo("categories", "left");
            } else if (menuLevel === "categories") {
                navigateTo("main", "left");
            }
        }
    };

    const handleMainMenuItemClick = (itemId) => {
        if (itemId === "categories") {
            navigateTo("categories", "right");
        }
    };

    // Determina el título según el nivel
    const getMenuTitle = () => {
         return "Menú principal";
       
    };

    const renderMenuItems = () => {
        if (menuLevel === "main") {
            return (
                <div className="animate-fade animate-duration-300">
                    {/* Categorías */}
                    <button
                        className="px-4 py-2 mb-3 w-full flex justify-between items-center hover:bg-gray-50 active:bg-primary transition-all  rounded-xl"
                        onClick={() => handleMainMenuItemClick("categories")}
                    >
                        <div className="flex items-center">
                          
                            <span className="font-medium">Categorías</span>
                        </div>
                        <ChevronRight className="h-5 w-5 customtext-neutral-light" />
                    </button>
                    
                    {/* Páginas del menú */}
                    <div className="space-y-2">
                        {pages.map(
                            (page, index) =>
                                page.menuable && (
                                    <a
                                        key={index}
                                        href={page.path}
                                        className="p-4 py-2 flex justify-between items-center w-full hover:bg-gray-50 active:bg-primary transition-all  rounded-xl"
                                    >
                                        <span className="font-medium">{page.name}</span>
                                    </a>
                                )
                        )}
                    </div>
                </div>
            );
        } else if (menuLevel === "categories") {
            // Ordenar categorías alfabéticamente
            const sortedCategories = [...items].sort((a, b) => 
                a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
            );
            
            return (
                <div className={animationDirection === "right" ? "animate-fade-left animate-duration-300" : "animate-fade-right animate-duration-300"}>
                    <div className="space-y-2">
                        {sortedCategories.map((category) => (
                            <div
                                key={category.id}
                                className="px-4 py-2  rounded-xl flex justify-between items-center cursor-pointer hover:bg-gray-50 active:bg-primary transition-all"
                                onClick={() => handleCategoryClick(category)}
                            >
                                <span className="font-medium">{category.name}</span>
                                <ChevronRight className="h-5 w-5 customtext-neutral-light" />
                            </div>
                        ))}
                    </div>
                </div>
            );
        } else if (menuLevel === "subcategories" && selectedCategory) {
            const selectedSubcategory = items.find(
                (category) => category.name === selectedCategory
            );
            
            // Ordenar subcategorías alfabéticamente
            const sortedSubcategories = selectedSubcategory.subcategories 
                ? [...selectedSubcategory.subcategories].sort((a, b) => 
                    a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
                  )
                : [];
                
            return (
                <div className={animationDirection === "right" ? "animate-fade-left animate-duration-300" : "animate-fade-right animate-duration-300"}>
                    <div className="space-y-2">
                        {sortedSubcategories.map((subcat, index) => (
                            <a
                                href={`/catalogo?subcategory=${subcat.slug}`}
                                key={index}
                                className="flex w-full px-4  py-2 rounded-xl justify-between items-center hover:bg-gray-50 active:bg-primary transition-all"
                            >
                                <span className="font-medium">{subcat.name}</span>
                                <ChevronRight className="h-5 w-5 customtext-neutral-light" />
                            </a>
                        ))}
                    </div>
                </div>
            );
        }
    };

    // Efecto para prevenir el scroll del cuerpo cuando el menú está abierto
    useEffect(() => {
        // Al montar el componente
        document.body.style.overflow = 'hidden';
        
        // Al desmontar el componente
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // useEffect para manejar la tecla Escape en la búsqueda
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'Escape') {
                if (search.trim()) {
                    setSearch(""); // Limpiar búsqueda
                } else {
                    onClose(); // Cerrar menú si no hay búsqueda
                }
            }
        };

        document.addEventListener("keydown", handleKeyPress);
        return () => {
            document.removeEventListener("keydown", handleKeyPress);
        };
    }, [search, onClose, setSearch]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col touch-none overscroll-none">
            {/* Overlay oscuro */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            
            {/* Contenedor del menú */}
            <div className="relative w-full md:w-[400px] md:mx-auto flex flex-col h-[100dvh]  ">
                {/* Panel del menú - fijo en la parte inferior */}
                <div className="mt-auto bg-white  shadow-xl flex flex-col max-h-[80vh] rounded-t-2xl overflow-hidden">
                    {/* Header del menú */}
                    <div className="p-4 bg-white flex justify-between items-center border-b border-gray-200 sticky top-0 z-10">
                        <h1 className="text-lg font-bold">{getMenuTitle()}</h1>
                        <button 
                            className="p-2 rounded-full hover:bg-gray-100"
                            onClick={onClose}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Contenido scrollable */}
                    <div className="overflow-y-auto flex-1 p-4 overscroll-contain">
                        {/* Buscador mejorado para móvil */}
                        <div className="mb-5">
                            <form onSubmit={handleSearchSubmit} role="search" className="relative w-full">
                                <input
                                    ref={searchInputRef}
                                    type="search"
                                    name="search"
                                    placeholder="Buscar productos"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full pr-12 py-3 pl-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                    enterKeyHint="search"
                                    inputMode="search"
                                    autoComplete="off"
                                    role="searchbox"
                                    aria-label="Buscar productos"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                    aria-label="Buscar"
                                >
                                    <Search className="h-4 w-4" />
                                </button>
                            </form>
                        </div>

                        {/* Botón de retroceso */}
                        {menuLevel !== "main" && (
                            <button
                                onClick={handleBackClick}
                                className="flex items-center customtext-primary mb-4 font-medium"
                            >
                                <ChevronLeft className="h-5 w-5 mr-1" />
                                <span>
                                    {menuLevel === "categories" ? "Categorías" : selectedCategory}
                                </span>
                            </button>
                        )}

                        {/* Lista de ítems */}
                        <div className="pb-16">
                            {renderMenuItems()}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0  flex justify-center">
                            <MenuSimple/>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
