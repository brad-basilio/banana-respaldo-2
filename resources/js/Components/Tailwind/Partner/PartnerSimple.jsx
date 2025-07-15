import React, { useEffect, useRef } from "react";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from 'swiper/modules';
import 'swiper/css/navigation';
import { ArrowLeft, ArrowRight } from "lucide-react";
import TextWithHighlight from "../../../Utils/TextWithHighlight";

const PartnerSimple = ({ data, items }) => {
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    // Si no hay items o el array está vacío, no renderizar nada
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <section className={`${data.background ? data.background : 'bg-[#F2F2F2]'}  customtext-primary font-font-general bg-cover bg-center mt-10`}>
            <div className="overflow-hidden px-primary">
                <div className="grid grid-cols-1 gap-8 xl:gap-10 pt-12 pb-16 2xl:py-12">
                    {/* Text Content */}
                    <div className="flex flex-row justify-center items-center h-full max-w-xl 2xl:max-w-2xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl lg:text-[40px] 2xl:text-5xl text-center font-medium tracking-normal customtext-neutral-dark leading-tight font-title">
                            <TextWithHighlight text={data?.title}></TextWithHighlight>
                        </h2>
                    </div>

                    {/* Center Image */}
                    <div className="flex flex-row justify-end items-center relative">
                        <div className="h-max w-full max-w-6xl 2xl:max-w-none mx-auto relative">
                            <Swiper
                                modules={[Autoplay, Navigation]}
                                autoplay={{
                                    delay: 3000,
                                    disableOnInteraction: false,
                                }}
                                navigation={{
                                    prevEl: prevRef.current,
                                    nextEl: nextRef.current,
                                }}
                                onInit={(swiper) => {
                                    swiper.params.navigation.prevEl = prevRef.current;
                                    swiper.params.navigation.nextEl = nextRef.current;
                                    swiper.navigation.init();
                                    swiper.navigation.update();
                                }}
                                loop={true}
                                breakpoints={{
                                    0: {
                                        slidesPerView: 2,
                                        spaceBetween: 10,
                                    },
                                    640: {
                                        slidesPerView: 3,
                                        spaceBetween: 10,
                                    },
                                    850: {
                                        slidesPerView: 4,
                                        spaceBetween: 10,
                                    },
                                    1200: {
                                        slidesPerView: 5,
                                        spaceBetween: 10,
                                    },
                                    1550: {
                                        slidesPerView: 6,
                                        spaceBetween: 10,
                                    },
                                }}
                                className="flex items-center"
                            >
                                {items.map((item, index) => (
                                    <SwiperSlide
                                        key={index}
                                        className="w-full h-full flex items-center"
                                    >
                                        <div className="flex flex-col justify-center items-center w-full h-full">
                                            <img 
                                                src={`/storage/images/partner/${item.image}`}
                                                onError={e => e.target.src = 'assets/img/noimage/noimagenslider.jpg'}
                                                alt={item.description}
                                                className="w-auto 2xl:w-36 object-contain mx-auto my-auto object-center"
                                            />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            {/* Botones de navegación */}
                            <button
                                ref={prevRef}
                                className="absolute -bottom-10 sm:top-1/2 -left-1 sm:-left-7 lg:-left-10 z-10 w-6 h-6 sm:w-10 sm:h-10 flex items-center justify-center bg-secondary rounded-md disabled:opacity-50 disabled:cursor-not-allowed -translate-y-1/2"
                            >
                                <ArrowLeft className="customtext-neutral-light w-[2rem]" />
                            </button>

                            <button
                                ref={nextRef}
                                className="absolute -bottom-10 sm:top-1/2 -right-1 sm:-right-7 lg:-right-10 z-10 w-6 h-6 sm:w-10 sm:h-10 flex items-center justify-center bg-secondary rounded-md disabled:opacity-50 disabled:cursor-not-allowed -translate-y-1/2"
                            >
                                <ArrowRight className="customtext-neutral-light w-[2rem]" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PartnerSimple;