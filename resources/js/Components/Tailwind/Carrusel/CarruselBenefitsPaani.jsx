import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { adjustTextColor } from "../../../Functions/adjustTextColor";
import "swiper/css";
import Global from "../../../Utils/Global";


const CarruselBenefitsPaani = ({ items }) => {
  const benefitsRef = useRef(null);

  useEffect(() => {
    adjustTextColor(benefitsRef.current);
  }, []);

  const highlightText = (desc) => {
    const parts = desc.split(/(\*[^*]+\*)/g);
    return parts.map((part, i) =>
      part.startsWith("*") && part.endsWith("*") ? (
        <span key={i} className="font-bold text-primary-700">
          {part.slice(2, -2)}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };


  const [imageExists, setImageExists] = useState(false);
  const imageUrl = `/assets/${Global.APP_CORRELATIVE}/overlay.png`;

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setImageExists(true);
    img.onerror = () => setImageExists(false);
  }, [imageUrl]);
  return (
    <div ref={benefitsRef} className="bg-primary py-10 overflow-hidden relative">
      {imageExists && (<img
        src={`/assets/${Global.APP_CORRELATIVE}/overlay.png`}
        alt={`${Global.APP_NAME} - ${Global.APP_CORRELATIVE}`}
        className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover opacity-50 z-0"
        style={{
          objectPosition: "center",
          mixBlendMode: "overlay",
        }}
        aria-hidden="true"
        loading="lazy"
      />)}

      <div className="px-primary 2xl:px-0 2xl:max-w-7xl mx-auto relative">
        <Swiper
          slidesPerView={1}
          spaceBetween={32}
          loop={true}
          breakpoints={{
            0: {
              slidesPerView: 1,
              loop: true,
              allowTouchMove: true,
            },
            640: {
              slidesPerView: 2,
              loop: false,
              allowTouchMove: false,
            },
            950: {
              slidesPerView: 3,
              loop: false,
              allowTouchMove: false,
            },
            1250: {
              slidesPerView: 4,
              loop: false,
              allowTouchMove: false,
            },
          }}
          className="w-full"
        >
          {items.map((benefit, index) => (
            <SwiperSlide key={index}>
              <div className="flex flex-col h-full ">
                <div className="flex flex-row  items-center gap-6 h-full  transition   duration-200">
                  <div className="flex-shrink-0 flex items-center justify-center bg-white rounded-full shadow-md w-14 h-14 p-2">
                    <img
                      alt={benefit.name}
                      src={`/storage/images/indicator/${benefit.symbol}`}
                      className="w-7 h-7 object-contain"
                      onError={(e) => {
                        e.target.src = "/api/cover/thumbnail/null";
                      }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center items-start text-left">
                    <p className="text-base leading-tight text-primary-900">
                      {highlightText(benefit.description)}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default CarruselBenefitsPaani;
