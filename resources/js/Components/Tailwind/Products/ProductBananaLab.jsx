import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Grid, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/grid";
import "swiper/css/pagination";
import CardProductBananaLab from "./Components/CardProductBananaLab";
import { adjustTextColor } from "../../../Functions/adjustTextColor";

const ProductBananaLab = ({ items, data, setCart, cart, setFavorites, favorites }) => {
    const [swiperInstance, setSwiperInstance] = useState(null);
    const navigationDesktopPrevRef = useRef(null);
    const navigationDesktopNextRef = useRef(null);
    const navigationMobilePrevRef = useRef(null);
    const navigationMobileNextRef = useRef(null);

    // Ajuste de colores para los botones
    useEffect(() => {
        [navigationDesktopPrevRef, navigationDesktopNextRef, navigationMobilePrevRef, navigationMobileNextRef].forEach(ref => {
            if (ref.current) adjustTextColor(ref.current);
        });
    }, []);

    // Actualizar navegación cuando la instancia de Swiper esté lista
    useEffect(() => {
        if (!swiperInstance) return;

        const handleResize = () => {
            setTimeout(() => {
                if (!swiperInstance || !swiperInstance.navigation) return;
                const isDesktop = window.innerWidth >= 768;
                const prevEl = isDesktop
                    ? navigationDesktopPrevRef.current
                    : navigationMobilePrevRef.current;
                const nextEl = isDesktop
                    ? navigationDesktopNextRef.current
                    : navigationMobileNextRef.current;
                if (prevEl && nextEl) {
                    swiperInstance.params.navigation.prevEl = prevEl;
                    swiperInstance.params.navigation.nextEl = nextEl;
                    try {
                        swiperInstance.navigation.destroy();
                        swiperInstance.navigation.init();
                        swiperInstance.navigation.update();
                    } catch (error) {
                        console.warn('Swiper navigation update failed:', error);
                    }
                }
            }, 50);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [swiperInstance]);

    return (
        <>
            {items && items.length > 0 && (

                <section className="pt-6 pb-0 font-paragraph lg:py-4 2xl:py-8">
                    <div className="mx-auto px-primary 2xl:px-0 2xl:max-w-7xl">
                        {/* Header */}
                        <div className="md:flex justify-between items-center customborder-neutral-dark">
                            <h2 className="text-[32px] leading-9 font-semibold mb-2 md:mb-0">
                                {data?.title}
                            </h2>
                            <a
                                href={data?.link_catalog}
                                className="hidden lg:flex bg-white customtext-primary border border-primary transition-all duration-300 justify-center flex-row items-center gap-3 px-10 py-3 text-base rounded-full tracking-wide font-bold cursor-pointer hover:opacity-90 lg:bg-primary"
                            >
                                {data?.text_button || 'Ver más recomendaciones'}
                            </a>
                        </div>

                        {/* Swiper Carousel */}
                        <div className="relative lg:px-10">
                            {items && items.length > 0 && (
                                <Swiper
                                    modules={[Navigation, Grid, Pagination]}
                                    navigation={{
                                        prevEl: null,
                                        nextEl: null,
                                        enabled: true,
                                    }}
                                    pagination={{
                                        clickable: true,
                                        dynamicBullets: false,
                                    }}
                                    slidesPerView={2}
                                    spaceBetween={10}
                                    grid={{
                                        fill: 'row',
                                        rows: 1,
                                    }}
                                    loop={true}
                                    onSwiper={(swiper) => {
                                        setTimeout(() => {
                                            const isDesktop = window.innerWidth >= 768;
                                            swiper.params.navigation.prevEl = isDesktop
                                                ? navigationDesktopPrevRef.current
                                                : navigationMobilePrevRef.current;
                                            swiper.params.navigation.nextEl = isDesktop
                                                ? navigationDesktopNextRef.current
                                                : navigationMobileNextRef.current;
                                            swiper.navigation.destroy();
                                            swiper.navigation.init();
                                            swiper.navigation.update();
                                            setSwiperInstance(swiper);
                                        }, 100);
                                    }}
                                    breakpoints={{
                                        320: {
                                            slidesPerView: 1.2,
                                            spaceBetween: 10,
                                        },
                                        480: {
                                            slidesPerView: 1.5,
                                            spaceBetween: 10,
                                        },
                                        640: {
                                            slidesPerView: 2,
                                            spaceBetween: 10,
                                        },
                                        768: {
                                            slidesPerView: 3,
                                            grid: { rows: 1 },
                                            spaceBetween: 0,
                                            pagination: { enabled: false }
                                        },
                                        1024: {
                                            slidesPerView: 4,
                                            grid: { rows: 1 },
                                            spaceBetween: 0,
                                            pagination: { enabled: false }
                                        },
                                        1280: {
                                            slidesPerView: 4,
                                            grid: { rows: 1 },
                                            spaceBetween: 0,
                                            pagination: { enabled: false }
                                        },
                                    }}
                                    className="md:h-[520px] md:max-h-[520px] lg:!flex lg:items-center lg:justify-center animate-fadeIn product-swiper-mobile"
                                >
                                    {items.map((product, index) => (
                                        <SwiperSlide
                                            key={`${product.id || index}`}
                                            className="mb-4 lg:mb-0 px-1 py-2 md:p-0 !h-full lg:!flex lg:items-center lg:justify-center animate-slideIn"
                                        >
                                            <CardProductBananaLab
                                                product={product}
                                                setCart={setCart}
                                                cart={cart}
                                                data={data}
                                                setFavorites={setFavorites}
                                                favorites={favorites}
                                            />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            )}

                            {/* Navigation Buttons - Desktop */}
                            <div className="hidden md:block">
                                <button
                                    ref={navigationDesktopPrevRef}
                                    className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-lg shadow-lg transition-all duration-300 bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95 transform hover:-translate-x-1"
                                    aria-label="Productos anteriores"
                                >
                                    <ChevronLeft width="1.2rem" className="animate-pulse" />
                                </button>
                                <button
                                    ref={navigationDesktopNextRef}
                                    className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-lg shadow-lg transition-all duration-300 bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95 transform hover:translate-x-1"
                                    aria-label="Siguientes productos"
                                >
                                    <ChevronRight width="1.2rem" className="animate-pulse" />
                                </button>
                            </div>


                        </div>
                    </div>

                    <style jsx="true">{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideIn {
                    from { transform: translateX(20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-in;
                }
                .animate-slideIn {
                    animation: slideIn 0.5s ease-out;
                }
                
                /* Mobile Pagination Styles */
                .product-swiper-mobile .swiper-pagination {
                    position: static !important;
                    margin-top: 20px !important;
                    text-align: center;
                }
                
                /* Hide pagination on desktop */
                @media (min-width: 768px) {
                    .product-swiper-mobile .swiper-pagination {
                        display: none !important;
                    }
                }
                
                /* Custom bullet styles */
                .product-swiper-mobile .swiper-pagination-bullet {
                    width: 12px !important;
                    height: 12px !important;
                    background: rgba(0, 0, 0, 0.2) !important;
                    opacity: 1 !important;
                    margin: 0 6px !important;
                    border-radius: 50% !important;
                    transition: all 0.3s ease !important;
                    cursor: pointer !important;
                    border: 2px solid transparent !important;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
                }
                
                .product-swiper-mobile .swiper-pagination-bullet:hover {
                    transform: scale(1.1) !important;
                    background: rgba(0, 0, 0, 0.4) !important;
                }
                
                .product-swiper-mobile .swiper-pagination-bullet-active {
                    background: #af5cb8 !important;
                    transform: scale(1.3) !important;
                    border-color: #af5cb8 !important;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4) !important;
                }
            `}</style>
                </section>
            )}
        </>
    );
};

export default ProductBananaLab;
