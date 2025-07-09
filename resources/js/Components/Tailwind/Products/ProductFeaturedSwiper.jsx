import {
    ArrowLeft,
    ArrowLeftIcon,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Tag,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ProductCardFull from "./Components/ProductCardFull";

const ProductFeaturedSwiper = ({ items, data, setCart, cart, contacts }) => {
    // Si no hay items o el array está vacío, no renderizar nada
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <section className="py-0">
            <div className="w-full font-font-general">
                {/* Swiper Carousel */}
                <div className="relative">
                    <Swiper
                        modules={[Navigation]}
                        spaceBetween={20}
                        slidesPerView={1}
                        breakpoints={{
                            0: {
                                slidesPerView: 1,
                                spaceBetween: 10,
                            },
                        }}
                    >
                        {items.map((product, index) => (
                            <SwiperSlide key={index}>
                                <ProductCardFull
                                    product={product}
                                    setCart={setCart}
                                    cart={cart}
                                    contacts={contacts}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
};

export default ProductFeaturedSwiper;