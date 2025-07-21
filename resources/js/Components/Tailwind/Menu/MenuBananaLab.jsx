import { ChevronDown, ChevronUp, Tag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import tagsItemsRest from "../../../Utils/Services/tagsItemsRest";

const MenuBananaLab = ({ pages = [], items }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openCategory, setOpenCategory] = useState(null);
    const [tags, setTags] = useState([]);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
                setOpenCategory(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        // Obtener tags activos al cargar el componente
        const fetchTags = async () => {
            try {
                console.log('Fetching active tags...');
                const response = await tagsItemsRest.getTags();
                console.log('Tags response:', response);
                if (response?.data) {
                    // Filtrar y ordenar tags: promocionales activos primero, luego permanentes
                    const activeTags = response.data.filter(tag => 
                        tag.promotional_status === 'permanent' || tag.promotional_status === 'active'
                    ).sort((a, b) => {
                        // Promocionales activos primero
                        if (a.promotional_status === 'active' && b.promotional_status !== 'active') return -1;
                        if (b.promotional_status === 'active' && a.promotional_status !== 'active') return 1;
                        // Luego por nombre
                        return a.name.localeCompare(b.name);
                    });
                    
                    setTags(activeTags);
                    console.log('Active tags set:', activeTags);
                    
                    // Log para debug: mostrar información promocional
                    const promotionalCount = activeTags.filter(t => t.promotional_status === 'active').length;
                    const permanentCount = activeTags.filter(t => t.promotional_status === 'permanent').length;
                    console.log(`🎯 Tags cargados: ${promotionalCount} promocionales activos, ${permanentCount} permanentes`);
                    
                    if (promotionalCount > 0) {
                        const activePromotions = activeTags.filter(t => t.promotional_status === 'active');
                        console.log('🎉 Promociones activas:', activePromotions.map(t => `${t.name} (${t.start_date} - ${t.end_date})`));
                    }
                }
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };
        fetchTags();
    }, []);

    const toggleCategory = (categoryId) => {
        setOpenCategory(openCategory === categoryId ? null : categoryId);
    };

    return (
        <nav className="hidden md:block  font-paragraph font-normal text-sm py-4">
            <div className="px-primary 2xl:px-0 2xl:max-w-7xl mx-auto flex justify-between">
                <ul className="flex items-center gap-6 text-sm" ref={menuRef}>
                   
                {items.map((category) => (
                        <li key={category.id} className="relative py-3 group">
                            <div className="flex items-center gap-1 hover:customtext-primary">
                                <a
                                    href={`/catalogo?category=${category.slug}`}
                                    className=" cursor-pointer transition-all duration-300 pr-2 relative "
                                >
                                    {category.name}
                                </a>
                                {category.subcategories.length > 0 && (
                                    <button 
                                        onClick={() => toggleCategory(category.id)}
                                        className="customtext-netrual-dark hover:text-primary"
                                    >
                                        {openCategory === category.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                )}
                            </div>
                            
                            {/* Submenú de subcategorías */}
                            {openCategory === category.id && category.subcategories.length > 0 && (
                                <div className="absolute z-40 top-full left-0 bg-white shadow-md rounded-md py-2 min-w-[200px]">
                                    <ul className="space-y-2 px-4 py-2">
                                        {category.subcategories.map((subcategory) => (
                                            <li key={subcategory.id}>
                                                <a
                                                    href={`/catalogo?subcategory=${subcategory.slug}`}
                                                    className="customtext-neutral-dark text-sm hover:customtext-primary transition-colors duration-300 cursor-pointer block py-1"
                                                >
                                                    {subcategory.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>

                {/* Botones de Tags dinámicos */}
                {tags.length > 0 && (
                    <div className="flex items-center gap-4 text-sm">
                        {tags.map((tag, index) => (
                            <a
                                key={tag.id}
                                href={`/catalogo?tag=${tag.id}`}
                                className={
                                    `font-medium rounded-full px-6 py-3 hover:brightness-105 cursor-pointer transition-all duration-300 relative flex items-center gap-2`
                                }
                                style={{
                                    backgroundColor: tag.background_color || '#3b82f6',
                                    color: tag.text_color || '#ffffff',
                                }}
                                title={tag.description || tag.name}
                            >
                                {tag.icon && (
                                    <img 
                                        src={`/storage/images/tag/${tag.icon}`} 
                                        alt={tag.name} 
                                        className="w-4 h-4"   
                                        onError={(e) => (e.target.src = "/api/cover/thumbnail/null")}
                                    />
                                )}
                                {tag.name}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
};
export default MenuBananaLab;
