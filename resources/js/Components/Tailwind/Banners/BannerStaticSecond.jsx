import "swiper/css";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import TextWithHighlight_Second from "../../../Utils/TextWithHighlight_Second";

export default function BannerStaticSecond({ data, items }) {
    const cleanDescription = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    // Si no hay items o el array está vacío, no renderizar nada
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <section className="customtext-primary bg-[#F2F2F2] font-font-general bg-cover bg-center" style={{ backgroundImage: 'url(/assets/img/backgrounds/sliders/bannerm.png)' }}>
            <div className="overflow-hidden px-primary">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-8 xl:gap-40 py-10 2xl:py-12">
                    {/* Text Content */}
                    <div className="flex flex-row justify-start items-center h-full">
                        <h2 className="text-3xl sm:text-4xl lg:text-[40px] 2xl:text-5xl font-medium tracking-normal customtext-neutral-dark leading-tight font-title">
                            <TextWithHighlight_Second text={data?.title} ></TextWithHighlight_Second>
                        </h2>
                    </div>

                    {/* Swiper Content */}
                    <div className="flex flex-row justify-end items-center relative">
                        <div className="min-w-[300px] w-full max-w-[500px] 2xl:max-w-[700px] h-max">
                            <Swiper
                                modules={[Autoplay]}
                                autoplay={{
                                    delay: 3000,
                                    disableOnInteraction: false,
                                }}
                                loop={true}
                                breakpoints={{
                                    0: {
                                        slidesPerView: 2,
                                        spaceBetween: 10,
                                    },
                                    640: {
                                        slidesPerView: 2,
                                        spaceBetween: 10,
                                    },
                                    768: {
                                        slidesPerView: 3,
                                        spaceBetween: 10,
                                    },
                                }}
                            >
                                {items.map((item, index) => (
                                    <SwiperSlide
                                        key={index}
                                        className="w-full aspect-auto lg:aspect-square overflow-hidden relative"
                                    >
                                        <div className="flex flex-col justify-center items-center h-full">
                                            <img 
                                                src={`/storage/images/certification/${item?.image}`}
                                                onError={e => e.target.src = 'assets/img/noimage/noimagenslider.jpg'}
                                                alt={item?.description}
                                                className="w-28 2xl:w-36 object-contain"
                                            />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}