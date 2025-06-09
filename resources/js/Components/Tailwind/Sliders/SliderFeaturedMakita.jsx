import React, { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';



const SliderFeaturedMakita = ({
  items,
  data
}) => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const swiperRef = useRef(null);
  return (
    <div className="relative bg-primary overflow-hidden py-8 lg:py-12">
      {/* Fondo patrón */}
      <div className="absolute inset-0 opacity-30 z-0"
        style={{
          backgroundImage: 'url("/assets/images/pattern-grid.svg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className="relative z-10 w-full px-primary 2xl:px-0 2xl:max-w-7xl mx-auto flex flex-col md:flex-row items-center min-h-[480px] md:min-h-[400px] py-8 md:py-12">
        {/* Izquierda: estático */}
        <div className="w-full md:w-5/12 flex flex-col justify-center text-white pr-0 md:pr-8 mb-8 md:mb-0">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {data?.title}
          </h2>
          <p className="text-lg md:text-xl opacity-80 mb-8">
            {data?.description}
          </p>
        </div>
        {/* Derecha: slider */}
        <div className="w-full md:w-7/12">
          <Swiper
            slidesPerView={1}
            modules={[Autoplay, Pagination]}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            loop={true}
            pagination={{
              clickable: true,
              el: '.swiper-pagination',
            }}
            spaceBetween={30}
            effect={'fade'}
            observer={true}
            observeParents={true}
            className="relative"
            onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex + 1)}
            onSwiper={(swiper) => { swiperRef.current = swiper; }}
          >
            {items.map((item, i) => (
              <SwiperSlide key={`featured-platform-${i} relative flex flex-col `}>
                <div className="h-[550px] lg:h-auto  flex flex-col w-full lg:w-11/12 md:flex-row items-center bg-secondary lg:bg-black/10 rounded-xl p-8 min-h-[340px] hover:bg-primary brightness-100 hover:brightness-125 transition-colors duration-300">
                  {/* Logo y voltaje */}
                  <div className="flex flex-col items-start w-full  md:w-6/12  md:mb-0 gap-4">

                    <img
                      src={`/storage/images/brand/${item?.brand.image}`}
                      alt="Logo"
                      className="h-12 md:h-16"
                    />

                    <div className="text-white text-base md:text-lg opacity-80 mt-2 mb-4 prose line-clamp-4" dangerouslySetInnerHTML={{ __html: item?.description }}>

                    </div>
                    <a
                       href={`/product/${item.slug}`}
                      className="inline-block bg-primary hover:brightness-125 text-white font-medium py-3 px-6 rounded-md transition-colors duration-300"
                    >
                       Más información
                    </a>
                  </div>
                  {/* Imagen */}

                  {/* Stats y botón */}
                  <div className="flex flex-col items-start w-full  md:w-5/12 mt-4 md:mt-0 ">
                    <div className="flex-1 flex justify-center items-center absolute lg:top-0 bottom-0 right-5 lg:-right-20  ">
                      <img
                        src={`/storage/images/item/${item?.banner}`}
                        alt={item?.name}
                        className=" min-w-[350px] lg:w-[500px] object-cover"
                      />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
                {/* Paginación mejorada y centrada */}
                <div className="w-full flex justify-center mt-6 mb-2 absolute bottom-4 left-0 right-0 z-20">
                  <div className="flex gap-3">
                    {items.map((_, index) => (
                      <button
                        key={`dot-${index}`}
                        aria-label={`Ir al slide ${index + 1}`}
                        onClick={() => {
                          setCurrentIndex(index + 1);
                          if (swiperRef.current) {
                            swiperRef.current.slideToLoop(index);
                          }
                        }}
                        className={`transition-all duration-300 rounded-full flex items-center justify-center
                          ${currentIndex === index + 1
                            ? 'w-3 h-3 bg-primary brightness-125 shadow-lg'
                            : 'w-3 h-3  bg-gray-100 hover:bg-primary/30'}
                        `}
                        style={{ outline: 'none' }}
                      >
                      
                      </button>
                    ))}
                  </div>
                </div>
          

          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default SliderFeaturedMakita;

