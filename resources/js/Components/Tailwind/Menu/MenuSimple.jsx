import { ChevronDown, ChevronUp, Tag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Global from "../../../Utils/Global";
import tagsItemsRest from "../../../Utils/Services/tagsItemsRest";

const MenuSimple = ({ pages = [], items, data }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [tags, setTags] = useState([]);
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

    console.log("items", data)
    console.log("tags", tags)

    return (
        <nav className={`${Global.APP_CORRELATIVE === "stechperu" ? "hidden" : "overflow-x-hidden w-full"} md:block bg-secondary font-paragraph text-sm`} ref={menuRef}>
            <div className="px-primary  2xl:px-0 2xl:max-w-7xl mx-auto">
                <ul className="flex items-center gap-4 lg:gap-6 text-sm justify-between">
                    <div className="flex items-center gap-4 lg:gap-6 text-sm">
                        {data?.showCategories && <li className="relative py-3">
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
                                            "font-medium hover:customtext-primary cursor-pointer transition-all duration-300 pr-6 relative" +
                                            (index !== arr.length - 1 || tags.length > 0
                                                ? " before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2 before:h-3 before:w-[1px] before:bg-[#262624]"
                                                : "")
                                        }
                                    >
                                        {page.name}
                                    </a>
                                </li>
                            ))}
                    </div>

                    {/* Botones de Tags - Ahora al final */}
                    {tags.length > 0 && (<div className="flex items-center gap-4 lg:gap-4 text-sm">
                        {tags.map((tag, index) => (
                            <li key={tag.id} className="">
                                <a
                                    href={`/catalogo?tag=${tag.id}`}
                                    className={
                                        "font-medium bg-primary text-white rounded-full p-2 hover:brightness-105 cursor-pointer transition-all duration-300  relative flex items-center gap-2"
                                    }
                                    title={tag.description || tag.name}
                                >
                                    <Tag size={16} className="text-white" />
                                    {tag.name}
                                    {/* <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {tag.items_count}
                                </span> */}
                                </a>
                            </li>
                        ))}
                    </div>)}

                </ul>
            </div>
        </nav>
    );
};

export default MenuSimple;
