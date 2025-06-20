import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Grid } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/grid";
import { useEffect, useRef, useState } from "react";
import CardHoverBtn from "./Components/CardHoverBtn";
import { adjustTextColor } from "../../../Functions/adjustTextColor";

const ProductInfinite = ({ items, data, setCart, cart }) => {
    const [swiperInstance, setSwiperInstance] = useState(null);
    const navigationPrevRef = useRef(null);
    const navigationNextRef = useRef(null);
   
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
            // Añadir un pequeño delay para asegurar que el DOM esté actualizado
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
        handleResize(); // Ejecutar inicialmente

        return () => window.removeEventListener('resize', handleResize);
    }, [swiperInstance]);

    return (
        <section className="relative bg-sections-color py-4">
            <div className="relative mx-auto px-[5%] py-[2.5%]">
                {/* Header */}
                <div className="md:flex justify-between items-center mb-8 pb-4 border-b customborder-neutral-light">
                    <h2 className="text-[28px] md:text-4xl font-bold font-font-secondary mb-4 md:mb-0 animate-fadeIn">
                        {data?.title}
                    </h2>
                    <a
                        href={data?.link_catalog}
                        className="hidden md:flex bg-primary animate-bounce transition-all duration-300 text-white border-none  justify-center flex-row items-center gap-3 px-10 py-4 text-base rounded-xl tracking-wide font-bold cursor-pointer hover:opacity-90 hover:scale-105 animate-slideIn"
                    >
                        Ver todos
                        <Tag width="1rem" className="rotate-90" />
                    </a>
                </div>

                {/* Swiper Carousel */}
                <div className="relative lg:px-10">
                    {items && items.length > 0 && (
                        <Swiper
                            modules={[Navigation, Grid]}
                            navigation={{
                                prevEl: null, // Se configurará después
                                nextEl: null, // Se configurará después
                                enabled: true,
                            }}
                            slidesPerView={2}
                            grid={{
                                fill: 'row',
                                rows: 3,
                            }}
                            loop={items.length > 6} // Solo hacer loop si hay suficientes elementos
                            onSwiper={(swiper) => {
                                // Configurar navegación después de que Swiper esté listo
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
                                640: { slidesPerView: 2, spaceBetween: 10 },
                                768: { slidesPerView: 3, grid: { rows: 1 }, spaceBetween: 0 },
                                1024: { slidesPerView: 4, grid: { rows: 1 }, spaceBetween: 0 },
                                1280: { slidesPerView: 5, grid: { rows: 1 }, spaceBetween: 0 },
                            }}
                            className=" md:h-[600px] md:max-h-[600px] lg:!flex lg:items-center lg:justify-center animate-fadeIn"
                        >
                            {items.map((product, index) => (
                                <SwiperSlide
                                    key={`${product.id}-${index}`}
                                    className="mb-4 lg:mb-0 px-1 py-2  md:p-0 !h-full lg:!flex lg:items-center lg:justify-center animate-slideIn"
                                >
                                    <CardHoverBtn
                                        product={product}
                                        setCart={setCart}
                                        cart={cart}
                                        data={data}
                                        isFirstCard={index === 0}
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

                    {/* Navigation Buttons - Mobile */}
                    <div className="md:hidden flex justify-end gap-2 mt-4">
                        <button
                            ref={navigationMobilePrevRef}
                            className="z-10 w-10 h-10 flex items-center justify-center rounded-lg shadow-lg transition-all duration-300 bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
                            aria-label="Productos anteriores"
                        >
                            <ChevronLeft width="1.2rem" className="animate-pulse" />
                        </button>
                        <button
                            ref={navigationMobileNextRef}
                            className="z-10 w-10 h-10 flex items-center justify-center rounded-lg shadow-lg transition-all duration-300 bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
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
            `}</style>
        </section>
    );
};

export default ProductInfinite;
