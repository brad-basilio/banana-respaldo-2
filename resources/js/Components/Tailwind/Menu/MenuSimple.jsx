import { ChevronDown, ChevronUp, Tag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Global from "../../../Utils/Global";
import tagsItemsRest from "../../../Utils/Services/tagsItemsRest";

const MenuSimple = ({ pages = [], items, data ,visible=false}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [tags, setTags] = useState([]);
    const [currentTagIndex, setCurrentTagIndex] = useState(0);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("pointerdown", handleClickOutside);
        return () => document.removeEventListener("pointerdown", handleClickOutside);
    }, []);

    useEffect(() => {
        // Obtener tags al cargar el componente
        const fetchTags = async () => {
            try {
                console.log('Fetching tags...');
                const response = await tagsItemsRest.getTags();
                console.log('Tags response:', response);
                if (response?.data) {
                    setTags(response.data);
                    console.log('Tags set:', response.data);
                }
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };
        fetchTags();
    }, []);

    // Auto-advance carousel for mobile tags
    useEffect(() => {
        if (tags.length > 2 && window.innerWidth < 1024) {
            const interval = setInterval(() => {
                setCurrentTagIndex(prev => {
                    const nextIndex = prev + 2;
                    return nextIndex >= tags.length ? 0 : nextIndex;
                });
            }, 3000); // Avanza cada 3 segundos

            return () => clearInterval(interval);
        }
    }, [tags.length]);

    // Detectar si estamos en mobile
    const isMobile = window.innerWidth < 1024;
    
    // En desktop: siempre mostrar el menú. En mobile: mostrar solo si visible es true y hay tags
    const shouldShowMenu = isMobile ? (visible && tags.length > 0) : true;
    // Mostrar solo tags en mobile si existen Y visible es true
    const showOnlyTagsMobile = tags.length > 0 && isMobile && visible;

    console.log("items", data)
    console.log("tags", tags)
    console.log("isMobile", isMobile)
    console.log("shouldShowMenu", shouldShowMenu)

    // Si no debe mostrar el menú, retornar null (oculto)
    if (!shouldShowMenu) {
        return null;
    }

    return (
        <nav
            className={
                `${
                showOnlyTagsMobile
                        ? " block w-full relative md:block bg-secondary font-paragraph text-sm"
                        : " relative w-full md:block bg-secondary font-paragraph text-sm"
                }`
            }
            ref={menuRef}
        >
            <div className="px-primary  2xl:px-0 2xl:max-w-7xl mx-auto">
                <ul className="flex items-center gap-4 lg:gap-6 text-sm justify-between">
                    {/* Mostrar solo tags en mobile si corresponde */}
                    {showOnlyTagsMobile ? (
                        <div className="w-full py-3 px-4">
                            {/* Carrusel de tags para mobile */}
                            <div className="relative">
                                <div className="grid grid-cols-2 gap-3 h-10">
                                    {tags.slice(currentTagIndex, currentTagIndex + 2).map((tag, index) => {
                                        const actualIndex = currentTagIndex + index;
                                        return (
                                            <a
                                                key={`${tag.id}-${actualIndex}`}
                                                href={`/catalogo?tag=${tag.id}`}
                                                className="group relative border-white border-2 overflow-hidden rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                                                style={{
                                                    background: `linear-gradient(135deg, ${tag.background_color || '#3b82f6'}, ${tag.background_color || '#3b82f6'}dd)`,
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                                                <div className="relative h-full flex items-center justify-center p-3">
                                                    <div className="flex items-center gap-2 text-center">
                                                        {tag.icon ? (
                                                            <img 
                                                                src={`/storage/images/tag/${tag.icon}`} 
                                                                alt={tag.name} 
                                                                className="w-6 h-6 object-contain filter brightness-0 invert"
                                                                onError={(e) => e.target.src = "/api/cover/thumbnail/null"}
                                                            />
                                                        ) : (
                                                            <Tag size={20} style={{ color: tag.text_color || '#ffffff' }} />
                                                        )}
                                                        <span 
                                                            className="text-xs font-semibold leading-tight"
                                                            style={{ color: tag.text_color || '#ffffff' }}
                                                        >
                                                            {tag.name}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                                            </a>
                                        );
                                    })}
                                    
                                    {/* Rellenar espacios vacíos si hay menos de 2 tags */}
                                    {tags.slice(currentTagIndex, currentTagIndex + 2).length < 2 && (
                                        <div className="rounded-2xl bg-white/10 flex items-center justify-center">
                                            <div className="text-white/50 text-xs">Más próximamente</div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Indicadores de posición */}
                                {tags.length > 2 && (
                                    <div className="flex justify-center mt-2 gap-1">
                                        {Array.from({ length: Math.ceil(tags.length / 2) }).map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentTagIndex(i * 2)}
                                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                                    Math.floor(currentTagIndex / 2) === i 
                                                        ? 'bg-primary shadow-lg' 
                                                        : 'bg-neutral-light hover:bg-white/60'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <ul className="flex items-center gap-4 lg:gap-6 text-sm">
                                {data?.showCategories && 
                                <li className="relative py-3">
                                    <button
                                        className="font-medium customtext-neutral-dark flex items-center gap-2 hover:customtext-primary pr-6 transition-colors duration-300 relative before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2 before:h-3 before:w-[1px] before:bg-[#262624]"
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    >
                                        Categorias
                                        {isMenuOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                    {isMenuOpen && (
                                        <div className="absolute z-50 top-12 left-0 bg-white shadow-xl border-t rounded-xl transition-all duration-500 ease-in-out h-[70dvh] overflow-y-scroll w-[calc(60vw-6rem)]">
                                            <div className="p-8">
                                                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8">
                                                    {[...items].sort((a, b) => a.name.localeCompare(b.name)).map((category, index) => (
                                                        <div key={index} className="w-full break-inside-avoid-column mb-8">
                                                            <a
                                                                href={`/catalogo?category=${category.slug}`}
                                                                className="customtext-neutral-dark font-bold text-base mb-4 cursor-pointer hover:customtext-primary transition-colors duration-300 w-full inline-block border-b pb-2"
                                                            >
                                                                {category.name}
                                                            </a>
                                                            <ul className="space-y-1">
                                                                {category.subcategories.map((item, itemIndex) => (
                                                                    <li key={itemIndex} className="w-full">
                                                                        <a
                                                                            href={`/catalogo?subcategory=${item.slug}`}
                                                                            className="customtext-neutral-dark text-sm hover:customtext-primary transition-colors duration-300 cursor-pointer w-full inline-block line-clamp-2"
                                                                        >
                                                                            {item.name}
                                                                        </a>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </li>}

                                {/* Páginas del menú */}
                                {pages
                                    .filter(page => page.menuable)
                                    .map((page, index, arr) => (
                                        <li key={index} className="py-3">
                                            <a
                                                href={page.path}
                                                className={
                                                    "font-medium hover:customtext-primary cursor-pointer transition-all duration-300" +
                                                    (index !== arr.length - 1 
                                                        ? " pr-6 relative before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2 before:h-3 before:w-[1px] before:bg-[#262624]"
                                                        : " pr-6")
                                                }
                                            >
                                                {page.name}
                                            </a>
                                        </li>
                                ))}
                            </ul>
                        
                            {/* Botones de Tags - Ahora al final */}
                            {tags.length > 0 && (
                                <div className="flex items-center gap-4 lg:gap-4 text-sm">
                                    {tags.map((tag, index) => (
                                        <li key={tag.id} className="">
                                            <a
                                                href={`/catalogo?tag=${tag.id}`}
                                                className={
                                                    `font-medium ${tag.background_color} ${tag.text_color} rounded-full p-2 hover:brightness-105 cursor-pointer transition-all duration-300  relative flex items-center gap-2`
                                                }
                                                style={{
                                                    backgroundColor: tag.background_color || '#3b82f6',
                                                    color: tag.text_color || '#ffffff',
                                                    
            }}
                                                title={tag.description || tag.name}
                                            >
                                                {tag.icon && <img src={`/storage/images/tag/${tag.icon}`} alt={tag.name} className="w-4 h-4"   onError={(e) =>
                                        (e.target.src =
                                            "/api/cover/thumbnail/null")
                                    }/>}
                                            
                                                {tag.name}
                                            </a>
                                        </li>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default MenuSimple;
