import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Grid } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/grid";
import { useEffect, useRef, useState } from "react";
import { adjustTextColor } from "../../../Functions/adjustTextColor";

// Nuevo Card para replicar la UI de la imagen
const MakitaProductCard = ({ product }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm flex flex-col h-full transition-all duration-200 hover:shadow-2xl overflow-hidden">
          
            {/* Imagen */}
            <div className="relative flex justify-center items-center h-52 p-4">
                 {product.is_new===1  && (
                        <span className="absolute top-8 right-0 bg-primary text-white text-sm font-bold px-2 py-1 rounded-sm">
                            NUEVO
                        </span>
                    )}
                <img
                    src={`/storage/images/item/${product.image}`}
                    onError={e => e.target.src = '/assets/img/noimage/no_img.jpg'}
                    alt={product.name}
                    className="object-contain max-h-48 max-w-full"
                    loading='lazy'
                />
            </div>
            {/* Contenido de texto */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Código del producto */}
                <div className="text-primary text-sm font-medium mb-1">
                    {product.code || "DMR200"}
                </div>
                {/* Título */}
                <h3 className="customtext-neutral-dark font-bold text-lg mb-2 leading-tight line-clamp-2">
                    {product.name || product.title}
                </h3>
                {/* Descripción */}
                <p className="customtext-neutral-light text-sm mb-3 line-clamp-2" dangerouslySetInnerHTML={{ __html: product.description }}>

                </p>
            </div>
        </div>
    );
};

const ProductMakita = ({ items, data, setCart, cart }) => {
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
            const isDesktop = window.innerWidth >= 768;
            swiperInstance.params.navigation.prevEl = isDesktop
                ? navigationDesktopPrevRef.current
                : navigationMobilePrevRef.current;

            swiperInstance.params.navigation.nextEl = isDesktop
                ? navigationDesktopNextRef.current
                : navigationMobileNextRef.current;

            swiperInstance.navigation.destroy();
            swiperInstance.navigation.init();
            swiperInstance.navigation.update();
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Ejecutar inicialmente

        return () => window.removeEventListener('resize', handleResize);
    }, [swiperInstance]);

    return (
        <section className="relative bg-white py-8">
            <div className="relative mx-auto px-primary py-10 2xl:px-0 2xl:max-w-7xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold customtext-neutral-dark">
                        {data?.title || "Set de nuevas máquinas"}
                    </h2>
                    <a
                        href={data?.link_catalog}
                        className="hidden md:flex bg-primary transition-all duration-300 text-white border-none justify-center flex-row items-center gap-2 px-6 py-3 text-sm rounded-lg font-medium cursor-pointer hover:brightness-125"
                    >
                        Ver todo
                    </a>
                </div>

                {/* Swiper Carousel */}
                <div className="relative">
                    <Swiper
                        modules={[Navigation, Grid]}
                        navigation={{
                            prevEl: navigationDesktopPrevRef.current,
                            nextEl: navigationDesktopNextRef.current,
                            enabled: true,
                        }}
                        slidesPerView={1}
                        spaceBetween={20}
                        loop={true}
                        onSwiper={setSwiperInstance}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            768: { slidesPerView: 3 },
                            1024: { slidesPerView: 4 },
                        }}
                        className="px-10"
                    >
                        {items.map((product, index) => (
                            <SwiperSlide
                                key={index}
                                className="py-2"
                            >
                                <MakitaProductCard product={product} />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Navigation Buttons */}
                    <button
                        ref={navigationDesktopPrevRef}
                        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-lg bg-secondary bg-opacity-70 text-white hover:brightness-125"
                        aria-label="Productos anteriores"
                    >
                        <ChevronLeft width="1.2rem" />
                    </button>
                    <button
                        ref={navigationDesktopNextRef}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-lg bg-secondary bg-opacity-70 text-white hover:brightness-125"
                        aria-label="Siguientes productos"
                    >
                        <ChevronRight width="1.2rem" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ProductMakita;
