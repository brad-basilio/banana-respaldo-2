import { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { adjustTextColor } from "../../../Functions/adjustTextColor";

// Import Swiper styles
import "swiper/css";

const CarruselBenefitsInifinite = ({ items }) => {
  const benefitsRef = useRef(null);

  useEffect(() => {
    adjustTextColor(benefitsRef.current);
  });

  return (
    <div ref={benefitsRef} className="bg-primary py-4 lg:py-6 overflow-hidden">
      <div className="px-primary 2xl:px-0 2xl:max-w-7xl mx-auto relative">
        <Swiper
          slidesPerView={2}
          spaceBetween={32}
          loop={true}
          breakpoints={{
            768: {
              slidesPerView: 4,
              loop: false,
              allowTouchMove: false,
            },
          }}
          className="w-full"
        >
          {items.map((benefit, index) => (
            <SwiperSlide key={index}>
              <div
                className={`flex items-center gap-2  lg:gap-4 justify-start relative 
                ${
                  index !== items.length - 1
                    ? "lg:before:absolute lg:before:-right-2 lg:before:top-1/2 lg:before:-translate-y-1/2 lg:before:h-14 lg:before:w-[2px] lg:before:bg-white"
                    : ""
                }`}
              >
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="relative z-10 text-3xl p-3">
                    <img
                    alt={benefit.name}
                      src={`/storage/images/indicator/${benefit.symbol}`}
                      className="w-full h-auto aspect-square"
                      onError={(e) => {
                        e.target.src = "/api/cover/thumbnail/null"
                      }}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-sm lg:text-lg">
                    {benefit.name}
                  </h3>
                  <p className="text-[10px] lg:text-sm">{benefit.description}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default CarruselBenefitsInifinite;
