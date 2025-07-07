import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const BlogCarrusel = ({ items, itemVariants, hoverCard, hoverImage }) => {
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  return (
    <motion.div 
      variants={itemVariants}
      className="col-span-1 lg:col-span-2 rounded-2xl p-4"
    >
      <div className="relative">
        <Swiper
          modules={[Navigation]}
          loop={true}
          navigation={{
            prevEl: navigationPrevRef.current,
            nextEl: navigationNextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = navigationPrevRef.current;
            swiper.params.navigation.nextEl = navigationNextRef.current;
          }}
          
          slidesPerView={1}
          breakpoints={{
            0:{
              slidesPerView: 1,
              spaceBetween: 30
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 20
            },
            1600: {
              slidesPerView: 3,
              spaceBetween: 40
            },
          }}
          className="mySwiper"
        >
          {items.map((item, index) => {
            const content = document.createElement("div");
            content.innerHTML = item?.description;
            const text = content.textContent || content.innerText || "";

            return (
              <SwiperSlide key={index}>
                <motion.div
                  variants={itemVariants}
                  whileHover={hoverCard}
                  className="bg-white rounded-lg overflow-hidden shadow-sm h-auto cursor-pointer"
                >
                  <motion.div 
                    className="overflow-hidden"
                  >
                    <img
                      src={`/storage/images/post/${item?.image}`}
                      alt={item?.title}
                      className="inset-0 w-full object-cover aspect-[4/3]"
                    />
                  </motion.div>
                  <div className="py-4">
                    <h3 className="text-2xl font-semibold mt-1 mb-2 leading-tight">
                      {item?.name}
                    </h3>
                    <motion.p 
                      className="text-base line-clamp-2"
                      whileHover={{ color: "#555" }}
                    >
                      {text}
                    </motion.p>
                  </div>
                </motion.div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Flechas de navegación */}
        <button
          ref={navigationPrevRef}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          ref={navigationNextRef}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export default BlogCarrusel;