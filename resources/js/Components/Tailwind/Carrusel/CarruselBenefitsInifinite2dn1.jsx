import { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { adjustTextColor } from "../../../Functions/adjustTextColor";
import TextWithHighlight_Second from "../../../Utils/TextWithHighlight_Second";

// Import Swiper styles
import "swiper/css";

const CarruselBenefitsInifinite2dn1 = ({ items, data }) => {
  const benefitsRef = useRef(null);

  useEffect(() => {
    adjustTextColor(benefitsRef.current);
  });

  return (
    <div ref={benefitsRef} className={`${data.background ? data.background : 'bg-primary' }  py-4 2xl:py-6 mt-12 lg:mt-16 overflow-hidden font-title customtext-neutral-dark`}>
      <div className="px-primary 2xl:px-0 2xl:max-w-7xl mx-auto relative">
        <Swiper
          slidesPerView={1}
          spaceBetween={0}
          loop={true}
          breakpoints={{
            0: {
              slidesPerView: 1,
              loop: false,
              allowTouchMove: false,
            },
          }}
        >
          {items.map((benefit, index) => (
            <SwiperSlide className="w-full" key={index}>
              <div
                className={`flex items-center gap-1 justify-center relative 
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
                <div className="flex flex-row items-center justify-center gap-2 text-sm sm:text-base lg:text-lg 2xl:text-xl">
                  <h3 className="font-bold">
                    {benefit.name} <span className="font-medium"><TextWithHighlight_Second text={benefit.description} ></TextWithHighlight_Second> </span>
                  </h3>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default CarruselBenefitsInifinite2dn1;
