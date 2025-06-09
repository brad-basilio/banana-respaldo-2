import { useState } from "react";
import { Search, X, ChevronRight, ChevronLeft } from "lucide-react";
import LiveSearchBar from "./LiveSearchBar";

export default function MobileMenuSF({ search, setSearch, pages, items, headerPosts}) {
    const [menuLevel, setMenuLevel] = useState("main"); // main, categories, subcategories
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);

    const handleCategoryClick = (categoryName) => {
        setSelectedSubcategory(categoryName);
        console.log(selectedSubcategory);
        setSelectedCategory(categoryName);
        setMenuLevel("subcategories");
    };

    const handleBackClick = () => {
        if (menuLevel === "subcategories") {
            setMenuLevel("categories");
        } else if (menuLevel === "categories") {
            setMenuLevel("main");
        }
    };

    const handleMainMenuItemClick = (itemId) => {
        if (itemId === "categories") {
            setMenuLevel("categories");
        }
    };

    const [category, setCategory] = useState();

    const renderMenuItems = () => {
        if (menuLevel === "main") {
            return (
                <>
                    <div className="customtext-neutral-dark">
                        <button
                            className="py-4 border-b border-gray-100 w-full flex justify-between items-center"
                            onClick={() =>
                                handleMainMenuItemClick("categories")
                            }
                        >
                            <span>Categorias</span>
                            <ChevronRight className="h-5 w-5 customtext-neutral-dark" />
                        </button>
                    </div>
                    {pages.map(
                        (page, index) =>
                            page.menuable && (
                                <button
                                    key={index}
                                    className="customtext-neutral-dark py-4 border-b border-gray-100 flex justify-between items-center"
                                    href={page.path}
                                >
                                    <span>{page.name}</span>
                                </button>
                            )
                    )}
                </>
            );
        } else if (menuLevel === "categories") {
            return items.map((category) => (
                <div
                    key={category.id}
                    className=" py-4 border-b customtext-neutral-dark border-gray-100 flex justify-between items-center"
                    onClick={() => handleCategoryClick(category.name)}
                >
                    <a href={`/catalogo?category=${category.slug}`}>
                        {category.name}
                    </a>

                    <ChevronRight className="h-5 w-5 customtext-neutral-dark" />
                </div>
            ));
        } else if (menuLevel === "subcategories" && selectedCategory) {
            // Por simplicidad, solo mostramos subcategorías para "audio"
            // En una implementación real, usaríamos selectedCategory para mostrar las subcategorías correspondientes
            const selectedSubcategory = items.find(
                (category) => category.name === selectedCategory
            );
            return selectedSubcategory.subcategories.map((subcat, index) => (
                <a
                    href={`/catalogo?subcategory=${subcat.slug}`}
                    key={index}
                    className="block py-4 customtext-neutral-dark border-b border-gray-100"
                >
                    <span>{subcat.name}</span>
                </a>
            ));
        }
    };

    return (
        <div className="w-full fixed top-[120px] h-screen customtext-neutral-dark mx-auto bg-white">
            <div className="bg-white z-50 w-full">
                
                <div className="p-5 w-full flex flex-col gap-3 font-font-general">
                    <div className="relative mb-2">
                        <LiveSearchBar search={search} setSearch={setSearch} />
                    </div>
                    
                    <ul
                        className={`bg-white flex font-font-general font-semibold text-lg`}
                    >
                        <div className="flex-col lg:flex-row order-2 lg:order-1 lg:w-full lg:justify-center">
                            {pages.map(
                                (page, index) =>
                                    page.menuable && (
                                        (page.name !== "Blogs" || headerPosts.length > 0) && (
                                            <li
                                                key={index}
                                                className="flex flex-col py-1"
                                            >
                                                <a
                                                    href={page.path}
                                                    className="hover:customtext-neutral-dark cursor-pointer transition-all duration-300 pr-6"
                                                    onClick={() =>
                                                        setMenuOpen(false)
                                                    }
                                                >
                                                    {page.name}
                                                </a>
                                            </li>
                                        )
                                    )
                            )}
                        </div>
                    </ul>
                    
                </div>
            </div>
        </div>
    );
}
