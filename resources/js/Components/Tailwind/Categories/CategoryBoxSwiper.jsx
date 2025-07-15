import React from "react";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import TextWithHighlight from "../../../Utils/TextWithHighlight";

const CategoryBoxSwiper = ({ data, items }) => {
    // Si no hay items o el array está vacío, no renderizar nada
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div className="relative bg-cover bg-center" style={{ backgroundImage: 'url(/assets/img/backgrounds/sliders/bannerako.png)' }}>
            <div className="px-[5%] replace-max-w-here w-full mx-auto pt-12 md:pt-16 xl:pt-20 space-y-10">
                {data?.title && (
                    <div className="flex flex-col max-w-2xl 2xl:max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl 2xl:text-6xl text-center customtext-neutral-light leading-tight font-medium font-title">
                            <TextWithHighlight text={data?.title} ></TextWithHighlight>
                        </h1>
                    </div>
                )}
                
                <div className="rounded-t-2xl overflow-hidden">
                    <Swiper
                        modules={[Autoplay]}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                        }}
                        loop={true}
                        breakpoints={{
                            0: {
                                slidesPerView: 1,
                                spaceBetween: 0,
                            },
                            640: {
                                slidesPerView: 2,
                                spaceBetween: 0,
                            },
                            768: {
                                slidesPerView: 3,
                                spaceBetween: 0,
                            },
                            1024: {
                                slidesPerView: 4,
                                spaceBetween: 0,
                            },
                        }}
                    >
                        {items.map((item, index) => (
                            <SwiperSlide
                                key={index}
                                className="p-4 shadow-md w-full aspect-square overflow-hidden group relative"
                            >
                                <img
                                    className="absolute w-full h-full top-0 left-0 object-cover object-center transition-all duration-300 group-hover:scale-105 group-hover:brightness-50"
                                    src={`/storage/images/category/${item.image}`}
                                    alt={item.name}
                                    onError={e => e.target.src = 'assets/img/noimage/noimagenslider.jpg'}
                                />

                                {/* Nombre normal (se oculta en hover) */}
                                <div className="relative flex flex-col gap-3 items-center justify-end h-full pb-2 transition-opacity duration-300 font-title group-hover:opacity-0">
                                    <h2 className="text-xl xl:text-2xl 2xl:text-3xl customtext-neutral-light font-semibold text-center tracking-normal">
                                        {item.name}
                                    </h2>

                                    <a href={`/${data?.path}/${item.slug}`}
                                        className="flex md:hidden bg-accent px-6 py-2 rounded-lg font-medium customtext-neutral-light transition-colors duration-300 text-sm md:text-base 2xl:text-xl"
                                    >
                                        Ver línea
                                    </a>
                                </div>

                                {/* Overlay on hover (se muestra en hover) */}
                                <div className="absolute font-title inset-0 bg-black bg-opacity-0 flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 group-hover:bg-opacity-70 transition-all duration-300">
                                    <h3 className="text-xl xl:text-2xl 2xl:text-3xl customtext-neutral-light text-center mb-2 font-semibold">
                                        {item.name}
                                    </h3>
                                    {item.description && (
                                        <p className="customtext-neutral-light text-base 2xl:text-xl text-center line-clamp-3 mb-4 font-normal">
                                            {item.description}
                                        </p>
                                    )}
                                    <a
                                        href={`/${data?.path}/${item.slug}`}
                                        className="bg-accent px-6 py-2 rounded-lg customtext-neutral-light transition-colors font-medium duration-300 text-sm md:text-base 2xl:text-xl"
                                    >
                                        Ver línea de producto
                                    </a>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </div>
    );
};

export default CategoryBoxSwiper;