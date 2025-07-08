import CategoryCard from "./Components/CategoryCard";
import { useRef } from "react";

// Si usas SwiperJS:
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const CategoryFlex = ({ data, items }) => {
    // Solo mostrar hasta 6 categorías
    const categories = items.slice(0, 6);
    const count = categories.length;

    return (
        <div className="px-primary mx-auto py-10 lg:py-16 2xl:max-w-7xl 2xl:px-0">
            {/* Header */}
            {data?.title && (
                <div className="flex flex-wrap gap-4 justify-between items-center ">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-semibold tracking-normal customtext-neutral-dark max-w-3xl 2xl:max-w-6xl">{data?.title}</h2>
                    {data?.text_button && data?.link_catalog && (
                        <a
                            href={data?.link_catalog}
                            className="bg-primary transition-all duration-300 text-white border-none items-center px-10 py-2.5 text-base rounded-full font-semibold cursor-pointer hover:opacity-90"
                        >
                            {data?.text_button}
                        </a>
                    )}
                </div>
            )}

            <div className="mt-12 w-full">
                {/* Mobile: Swiper */}
                <div className="block md:hidden">
                    <Swiper
                        spaceBetween={16}
                        slidesPerView={1.2}
                        breakpoints={{
                            480: { slidesPerView: 1.5 },
                            640: { slidesPerView: 2 },
                        }}
                    >
                        {categories.map((cat, idx) => (
                            <SwiperSlide key={cat.id || idx}>
                                <CategoryCard featured category={cat} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* Desktop: grid/flex layouts */}
                <div className="hidden md:block">
                    {/* 1 item: banner grande */}
                    {count === 1 && (
                        <div className="flex justify-center">
                            <div className="w-full ">
                                <CategoryCard featured category={categories[0]} />
                            </div>
                        </div>
                    )}

                    {/* 2 items: dos banners grandes */}
                    {count === 2 && (
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="w-full md:w-1/2">
                                <CategoryCard featured category={categories[0]} />
                            </div>
                            <div className="w-full md:w-1/2">
                                <CategoryCard featured category={categories[1]} />
                            </div>
                        </div>
                    )}

                    {/* 3 items: uno grande a la izquierda, dos apilados a la derecha */}
                    {count === 3 && (
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="w-full md:w-1/2">
                                <CategoryCard featured category={categories[0]} />
                            </div>
                            <div className="w-full md:w-1/2 flex flex-col gap-8">
                                <CategoryCard flex category={categories[1]} />
                                <CategoryCard flex category={categories[2]} />
                            </div>
                        </div>
                    )}

                    {/* 4 items: dos apilados en cada lado */}
                    {count === 4 && (
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="w-full md:w-1/2 flex flex-col gap-8">
                                <CategoryCard flex category={categories[0]} />
                                <CategoryCard flex category={categories[1]} />
                            </div>
                            <div className="w-full md:w-1/2 flex flex-col gap-8">
                                <CategoryCard flex category={categories[2]} />
                                <CategoryCard flex category={categories[3]} />
                            </div>
                        </div>
                    )}

                    {/* 5 items: uno grande a la izquierda, dos apilados a la derecha, dos abajo en grid */}
                    {count === 5 && (
                        <>
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="w-full md:w-2/3">
                                    <CategoryCard featured category={categories[0]} />
                                </div>
                                <div className="w-full md:w-1/3 flex flex-col gap-8">
                                    <CategoryCard flex category={categories[1]} />
                                    <CategoryCard flex category={categories[2]} />
                                </div>
                            </div>
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <CategoryCard flex category={categories[3]} />
                                <CategoryCard flex category={categories[4]} />
                            </div>
                        </>
                    )}

                    {/* 6 items: dos grandes arriba, cuatro en grid abajo */}
                    {count === 6 && (
                        <>
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="w-full md:w-1/2">
                                    <CategoryCard featured category={categories[0]} />
                                </div>
                                <div className="w-full md:w-1/2 flex flex-col gap-8">
                                    <CategoryCard flex category={categories[1]} />
                                    <CategoryCard flex category={categories[2]} />
                                </div>
                            </div>
                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                                <CategoryCard flex category={categories[3]} />
                                <CategoryCard flex category={categories[4]} />
                                <CategoryCard flex category={categories[5]} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryFlex;