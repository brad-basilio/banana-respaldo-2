import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import './css/PaginationCollection.css';

const PaginationCollection = ({
  items,
  data,
  showPagination = true,
  alignmentClassPagination = "center",
}) => {
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  // Configuración responsive para slidesPerView
  const breakpoints = {
    0: {
      slidesPerView: 2,
      spaceBetween: 10,
    },
    640: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    768: {
      slidesPerView: 3,
      spaceBetween: 30,
    },
    1024: {
      slidesPerView: 4,
      spaceBetween: 40,
    },
    1280: {
      slidesPerView: 6,
      spaceBetween: 40,
    },
    1550: {
      slidesPerView: 6,
      spaceBetween: 50,
    },
  };

  // Estilos para la paginación según la alineación
  const paginationStyle = {
    left: alignmentClassPagination === "left" ? "0" : "auto",
    right: alignmentClassPagination === "right" ? "0" : "auto",
    transform: alignmentClassPagination === "center" ? "translateX(-50%)" : "none",
  }

  return (
    <section className="px-[3%] font-font-general pt-12 lg:pt-16">
      <div className="w-full px-primary">
        <h2 className={`${data?.centrado ? data.centrado : 'text-left'} text-3xl sm:text-4xl lg:text-[42px] 2xl:text-5xl font-semibold tracking-normal customtext-neutral-dark max-w-5xl 2xl:max-w-6xl !leading-tight`}>
          {data?.title}
        </h2>

        <div className="relative pt-12">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation={{
              prevEl: navigationPrevRef.current,
              nextEl: navigationNextRef.current,
            }}
            loop={true}
            pagination={{
              clickable: true,
              renderBullet: (index, className) => {
                return `
                  <div class="${className} inline-flex mx-1 cursor-pointer">
                    <div class="w-4 h-4 bg-gray-300 rounded-full transition-all duration-200 ease-in-out hover:bg-secondary"></div>
                  </div>
                `;
              },
              el: showPagination ? ".custom-pagination" : null,
            }}
            breakpoints={breakpoints}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = navigationPrevRef.current;
              swiper.params.navigation.nextEl = navigationNextRef.current;
            }}
            className="py-4"
          >
            {items.map((collection) => (
              <SwiperSlide key={collection.id}>
                <div className="group min-w-[150px] px-2 flex-shrink-0 group-hover:shadow-xl">
                  <a
                    href={`/catalogo?collection=${collection.slug}`}
                    className="block group"
                  >
                    <div className="bg-transparent rounded-xl p-0 transition-transform duration-300">
                      <div className="aspect-square relative mb-8 rounded-full overflow-hidden w-3/4 mx-auto">
                        <img
                          src={`/storage/images/collection/${collection.image}`}
                          onError={(e) =>
                          (e.target.src =
                            "assets/img/noimage/no_imagen_circular.png")
                          }
                          alt={collection.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                      <h3 className="text-center font-semibold text-base lg:text-lg 2xl:text-2xl customtext-neutral-dark font-font-general">
                        {collection.name}
                      </h3>
                    </div>
                  </a>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Botones de navegación */}
          <button
            ref={navigationPrevRef}
            className="absolute -left-3 sm:-left-10 top-1/2 z-10 -translate-y-1/2 bg-primary rounded-full p-2 text-white hover:bg-primary hover:bg-opacity-10"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            ref={navigationNextRef}
            className="absolute -right-3 sm:-right-10 top-1/2 z-10 -translate-y-1/2 bg-primary rounded-full p-2 text-white shadow-md hover:bg-primary"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Añadir el contenedor de paginación */}
        </div>
        <div className="w-full custom-pagination relative flex justify-center mt-8 lg:mt-12 gap-2"></div>

      </div>

    </section>
  );
};

export default PaginationCollection;