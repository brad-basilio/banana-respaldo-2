import {
    ArrowLeft,
    ArrowLeftIcon,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Tag,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import CardHoverBtn from "./Components/CardHoverBtn";
import { adjustTextColor } from "../../../Functions/adjustTextColor";
import ProductCardColorsBoton from "./Components/ProductCardColorsBoton";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import TextWithHighlight from "../../../Utils/TextWithHighlight";

const ProductNavigationSwiperPaani = ({ items, data, setCart, cart }) => {
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    useEffect(() => {
        adjustTextColor(prevRef.current);
        adjustTextColor(nextRef.current);
    }, []);
    
    return (
        <section className={`py-12 lg:pt-16 lg:pb-8 ${data.background ? data.background : 'bg-white'}`}>
            <div className="px-primary w-full font-title">
                {/* Header */}
                {data?.title && (
                    <div className="flex flex-wrap gap-4 justify-between items-center pb-4">
                        <h2 className="text-3xl sm:text-4xl lg:text-[40px] 2xl:text-5xl text-center font-medium tracking-normal customtext-neutral-dark leading-tight font-title">
                            <TextWithHighlight text={data?.title} />
                        </h2>
                    
                        {data?.link_catalog && (
                            <a
                                href={data.link_catalog}
                                className={`${data.backgroundboton ? data.backgroundboton : 'bg-primary'} bg-accent transition-all duration-300 text-white border-none items-center px-10 py-2.5 text-base rounded-3xl font-medium cursor-pointer hover:opacity-90`}
                            >
                                {data?.text_button || 'Ver todos los productos'}
                            </a>
                        )}
                    </div>
                )}

                {/* Swiper Carousel */}
                <div className="relative pt-5">
                    <Swiper
                        modules={[Navigation]}
                        navigation={{
                            prevEl: prevRef.current,
                            nextEl: nextRef.current,
                        }}
                        onInit={(swiper) => {
                            swiper.params.navigation.prevEl = prevRef.current;
                            swiper.params.navigation.nextEl = nextRef.current;
                            swiper.navigation.init();
                            swiper.navigation.update();
                        }}
                        spaceBetween={20}
                        slidesPerView={1}
                        breakpoints={{
                            0: {
                                slidesPerView: 2,
                                spaceBetween: 10,
                            },
                            768: {
                                slidesPerView: 3,
                            },
                            1280: {
                                slidesPerView: 4,
                            },
                            1550: {
                                slidesPerView: 5,
                            },
                        }}
                        
                    >
                        {items.map((product, index) => (
                            <SwiperSlide key={index}>
                                <ProductCardColorsBoton
                                    product={product}
                                    setCart={setCart}
                                    cart={cart}
                                    fondo={data?.background}
                                    fondoboton={data?.backgroundboton}
                                    textcolor="customtext-neutral-dark"
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Navigation buttons */}
                    <button
                        ref={prevRef}
                        className="absolute top-1/2 -left-4 z-10 w-12 h-12  flex items-center justify-center bg-secondary rounded-md disabled:opacity-50 disabled:cursor-not-allowed -translate-y-1/2"
                        aria-label="Productos anteriores"
                    >
                        <ArrowLeft width={"1.5rem"} className="customtext-neutral-light" />
                    </button>

                    <button
                        ref={nextRef}
                        className="absolute top-1/2 -right-4 z-10 w-12 h-12  flex items-center justify-center bg-secondary rounded-md disabled:opacity-50 disabled:cursor-not-allowed -translate-y-1/2"
                        aria-label="Siguientes productos"
                    >
                        <ArrowRight width={"1.5rem"} className="customtext-neutral-light" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ProductNavigationSwiperPaani;
