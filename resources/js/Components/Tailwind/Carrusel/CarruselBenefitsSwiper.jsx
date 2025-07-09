"use client"

import { useEffect, useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { adjustTextColor } from "../../../Functions/adjustTextColor"

// Import Swiper styles
import "swiper/css"

const CarruselBenefitsInifinite = ({ items, data }) => {
  const benefitsRef = useRef(null)

  useEffect(() => {
    if (items && items.length > 0) {
      adjustTextColor(benefitsRef.current)
    }
  })

  // Si no hay items o el array está vacío, no renderizar nada
  if (!items || items.length === 0) {
    return null
  }

  return (
    <div ref={benefitsRef} className={`${data.background ? data.background : "bg-secondary"} py-12 overflow-hidden`}>
      <div className="px-[5%] relative">
        <Swiper
          slidesPerView={1}
          spaceBetween={24}
          breakpoints={{
            0: {
              slidesPerView: 1,
              spaceBetween: 48,
            },
            600: {
                slidesPerView: 2,
                spaceBetween: 40,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 40,
            },
          }}
          className="w-full"
        >
          {items.map((benefit, index) => (
            <SwiperSlide key={index}>
              <div className="flex flex-col md:flex-row gap-2 lg:gap-4 ">
                
                <div className="flex flex-col items-start justify-start">
                  <div className="w-10 h-10">
                    <img
                      alt={benefit.name}
                      src={`/storage/images/indicator/${benefit.symbol}`}
                      className="w-8 h-8 filter brightness-0 saturate-100"
                      style={{
                        filter:
                          "invert(58%) sepia(89%) saturate(1945%) hue-rotate(8deg) brightness(101%) contrast(101%)",
                      }}
                      onError={(e) => {
                        e.target.src = "/api/cover/thumbnail/null"
                      }}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xl 2xl:text-2xl text-white mb-2 leading-tight font-title">{benefit.name}</h3>
                  <p className="text-gray-300 text-base 2xl:text-xl leading-relaxed xl:line-clamp-3 font-normal font-title">{benefit.description}</p>
                </div>

              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}

export default CarruselBenefitsInifinite