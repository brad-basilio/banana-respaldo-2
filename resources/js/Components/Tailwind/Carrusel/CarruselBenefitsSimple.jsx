import { Hexagon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { adjustTextColor } from "../../../Functions/adjustTextColor";

const CarruselBenefitsSimple = ({ items, data }) => {
    // Duplicamos los elementos para lograr el efecto infinito
    const infiniteBenefits = [...items, ...items];
    const sliderRef = useRef(null);

    useEffect(() => {
        const slider = sliderRef.current;
        if (slider) {
            const totalWidth = slider.scrollWidth / 2; // La mitad porque duplicamos la lista
            let start = 0;

            const animate = () => {
                start -= 1; // Velocidad de desplazamiento
                if (Math.abs(start) >= totalWidth) {
                    start = 0; // Reinicia el scroll sin que se note el corte
                }
                slider.style.transform = `translateX(${start}px)`;
                requestAnimationFrame(animate);
            };

            animate();
        }
    }, []);

    //infiniteBenefits si lo quiere infinito reemplaza
    //va en el div incial ref = { benefitsRef }
    // va en el div antes de hacer el map ref={sliderRef}
    return (
        <div
            className={`${
                data.background ? data.background : "bg-secondary"
            } py-6 overflow-hidden customtext-primary font-paragraph mt-12 lg:mt-16`}
        >
            <div className="px-primary 2xl:px-0 2xl:max-w-7xl mx-auto relative">
                <div className="flex flex-col md:flex-row w-full gap-8 whitespace-nowrap transition-none">
                    {items.map((benefit, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 justify-start w-full md:w-1/3 "
                        >
                            {" "}
                            {/*para infinito usa esto flex-shrink-0*/}
                            <div className="relative w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                                {/* Ícono */}
                                <div className="relative z-10 text-3xl">
                                    <img
                                        src={`/storage/images/indicator/${benefit.symbol}`}
                                        onError={(e) =>
                                            (e.target.src =
                                                "assets/img/noimage/no_imagen_circular.png")
                                        }
                                        className="w-full h-auto "
                                    />
                                </div>
                            </div>
                            <p className="text-lg break-words whitespace-normal w-full max-w-[250px]">
                                <span className="font-bold">
                                    {benefit.name}
                                </span>{" "}
                                {benefit.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CarruselBenefitsSimple;
