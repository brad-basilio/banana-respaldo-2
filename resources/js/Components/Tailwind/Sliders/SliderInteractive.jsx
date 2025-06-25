import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { adjustTextColor } from "../../../Functions/adjustTextColor";
import Global from "../../../Utils/Global";

const SliderInteractive = ({ items, data }) => {
    //TODO: Validación y conversión de infiniteLoop
    const parseInfiniteLoop = (value) => {
        const validTrueValues = ["true", "si"];
        const validFalseValues = ["false", "no"];
        if (validTrueValues.includes(value?.toLowerCase())) {
            return true;
        } else if (validFalseValues.includes(value?.toLowerCase())) {
            return false;
        }
        return false; // Valor predeterminado si no se especifica o es inválido
    };

    const infiniteLoop = parseInfiniteLoop(data?.infiniteLoop);

    const [currentIndex, setCurrentIndex] = useState(1);
    const sliderRef = useRef(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const currentTranslate = useRef(0);

    const duplicatedItems = [items[items.length - 1], ...items, items[0]];
    const validAlignments = ["center", "left", "right"];
    const validPosition = ["yes", "true", "si"];
    const showPagination = validAlignments.includes(data?.paginationAlignment);
    const alignmentClassPagination = showPagination
        ? data?.paginationAlignment
        : "center";

    const showNavigation = validPosition.includes(data?.showNavigation);
    const alignmentClassNavigation = showNavigation
        ? data?.navigationAlignment
        : "true";

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % duplicatedItems.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? duplicatedItems.length - 1 : prevIndex - 1
        );
    };


    // Helper para saber si el evento fue sobre un botón o enlace
    const isEventOnButtonOrLink = (e) => {
        let el = e.target;
        while (el) {
            if (el.tagName === 'A' || el.tagName === 'BUTTON') return true;
            el = el.parentElement;
        }
        return false;
    };

    // Handle touch events for mobile
    const handleTouchStart = (e) => {
        if (isEventOnButtonOrLink(e)) return;
        isDragging.current = true;
        startX.current = e.touches[0].pageX;
        sliderRef.current.style.transition = "none";
    };

    const handleTouchMove = (e) => {
        if (!isDragging.current) return;
        const deltaX = e.touches[0].pageX - startX.current;
        currentTranslate.current =
            -currentIndex * 100 + (deltaX / window.innerWidth) * 100;
        sliderRef.current.style.transform = `translateX(${currentTranslate.current}%)`;
    };

    const handleTouchEnd = (e) => {
        if (!isDragging.current) return;
        isDragging.current = false;
        sliderRef.current.style.transition = "transform 0.5s ease-in-out";
        const threshold = 20;
        const deltaX = Math.abs(
            (currentTranslate.current + currentIndex * 100) *
                (window.innerWidth / 100)
        );
        if (deltaX > threshold) {
            if (currentTranslate.current > -currentIndex * 100) {
                prevSlide();
            } else {
                nextSlide();
            }
        } else {
            setCurrentIndex(currentIndex);
        }
        sliderRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
    };

    // Mouse events for desktop
    const handleMouseDown = (e) => {
        if (isEventOnButtonOrLink(e)) return;
        isDragging.current = true;
        startX.current = e.pageX;
        sliderRef.current.style.transition = "none";
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        const deltaX = e.pageX - startX.current;
        currentTranslate.current =
            -currentIndex * 100 + (deltaX / window.innerWidth) * 100;
        sliderRef.current.style.transform = `translateX(${currentTranslate.current}%)`;
    };

    const handleMouseUp = (e) => {
        if (!isDragging.current) return;
        isDragging.current = false;
        sliderRef.current.style.transition = "transform 0.5s ease-in-out";
        const threshold = 20;
        const deltaX = Math.abs(
            (currentTranslate.current + currentIndex * 100) *
                (window.innerWidth / 100)
        );
        if (deltaX > threshold) {
            if (currentTranslate.current > -currentIndex * 100) {
                prevSlide();
            } else {
                nextSlide();
            }
        } else {
            setCurrentIndex(currentIndex);
        }
        sliderRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
    };

    const handleMouseLeave = () => {
        if (isDragging.current) {
            handleMouseUp();
        }
    };

    //TODO: Problema Loop - Validacion y Efectuar
    if (infiniteLoop) {
        useEffect(() => {
            const interval = setInterval(() => {
                nextSlide();
            }, 5000);

            return () => clearInterval(interval);
        }, [currentIndex]);
    }

    //TODO: Efecto para manejar el loop infinito sin saltos bruscos
    useEffect(() => {
        if (currentIndex === 0) {
            setTimeout(() => {
                sliderRef.current.style.transition = "none";
                setCurrentIndex(duplicatedItems.length - 2);
                requestAnimationFrame(() => {
                    sliderRef.current.style.transform = `translateX(-${
                        (duplicatedItems.length - 2) * 100
                    }%)`;
                    setTimeout(() => {
                        sliderRef.current.style.transition =
                            "transform 0.5s ease-in-out";
                    }, 50);
                });
            }, 500);
        } else if (currentIndex === duplicatedItems.length - 1) {
            setTimeout(() => {
                sliderRef.current.style.transition = "none";
                setCurrentIndex(1);
                requestAnimationFrame(() => {
                    sliderRef.current.style.transform = `translateX(-${
                        1 * 100
                    }%)`;
                    setTimeout(() => {
                        sliderRef.current.style.transition =
                            "transform 0.5s ease-in-out";
                    }, 50);
                });
            }, 500);
        }
    }, [currentIndex]);

    const buttonsRef = useRef([]);

    useEffect(() => {
        buttonsRef.current.forEach((button) => {
            if (button) adjustTextColor(button);
        });
    }, [items]);

    // Estado para saber si la imagen actual es oscura
    const [isDarkBg, setIsDarkBg] = useState(false);

    // Función para detectar si la imagen es oscura
    const checkImageDarkness = (src) => {
        const img = new window.Image();
        img.crossOrigin = "Anonymous";
        img.src = src;
        img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, img.width, img.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let colorSum = 0;
            for (let i = 0; i < imageData.data.length; i += 4) {
                const r = imageData.data[i];
                const g = imageData.data[i + 1];
                const b = imageData.data[i + 2];
                // brillo promedio
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                colorSum += brightness;
            }
            const avg = colorSum / (imageData.data.length / 4);
            setIsDarkBg(avg < 128); // umbral: 128
        };
    };

    // Cada vez que cambia el slide, revisa si la imagen es oscura
    useEffect(() => {
        const currentItem = duplicatedItems[currentIndex];
        if (currentItem?.bg_image) {
            checkImageDarkness(`/storage/images/slider/${currentItem.bg_image}`);
        }
    }, [currentIndex, duplicatedItems]);

    return (
        <div className="relative w-full mx-auto">
            <div
                className="overflow-hidden relative cursor-grab ease"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    ref={sliderRef}
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                        transform: `translateX(-${currentIndex * 100}%)`,
                    }}
                >
                    {duplicatedItems.map((item, index) => (
                        <div
                            key={`slide-${index}`}
                            className="w-full h-[589px] lg:h-auto  flex-shrink-0 relative"
                        >
                            <img
                                src={`/storage/images/slider/${
                                    item.bg_image || "undefined"
                                }`}
                                alt={item.name}
                                loading="lazy"
                                className={`absolute top-0  left-0 h-full md:h-full  w-screen md:w-full object-cover ${data?.imageBgPosition || "object-right-25 "} md:object-center  z-0  md:mr-20 lg:mr-0`}
                            />

                          {data?.overlayMobile && (
                              <div className="md:hidden absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
                          )}

                            <div className={`relative w-full px-primary 2xl:px-0 2xl:max-w-7xl  mx-auto  h-[530px] md:h-[600px] flex flex-col items-start justify-end md:justify-center ${isDarkBg ? "text-white" : "customtext-neutral-dark"}`}>
                                <div className="flex flex-col gap-5 lg:gap-10 items-start">
                                    <h2
                                        className={`${Global.APP_CORRELATIVE==="stechperu" ?"w-9/12  md:w-full md:max-w-md " :"w-full  md:w-full md:max-w-lg "} font-title text-[40px] leading-tight sm:text-5xl md:text-6xl tracking-normal font-bold ${isDarkBg ? "text-white" : "customtext-neutral-dark"}`}
                                        style={{
                                            textShadow: "0 0 20px rgba(0, 0, 0, .25)",
                                        }}
                                    >
                                        {item.name}
                                    </h2>
                                    <p
                                        className={`${Global.APP_CORRELATIVE==="stechperu" ?"w-8/12" :"w-full"} md:w-full md:max-w-md text-lg leading-tight font-paragraph ${isDarkBg ? "text-white" : "customtext-neutral-dark"}`}
                                        style={{
                                            textShadow: "0 0 20px rgba(0, 0, 0, .25)",
                                        }}
                                    >
                                        {item.description}
                                    </p>
                                    {item.button_text && item.button_link && (
                                      <div className="flex flex-row gap-5 md:gap-10 justify-center items-start">
                                        <a
                                          href={item.button_link}
                                          ref={(el) => (buttonsRef.current[index] = el)}
                                          className="bg-primary border-none flex flex-row items-center gap-3 px-10 py-4 text-base rounded-xl tracking-wide font-bold hover:opacity-90 transition-all duration-300"
                                          onClick={e => {
                                            e.stopPropagation();
                                          }}
                                          onMouseDown={e => e.stopPropagation()}
                                          onTouchStart={e => e.stopPropagation()}
                                        >
                                          {item.button_text}
                                          <Tag
                                            width={"1.25rem"}
                                            className="transform rotate-90"
                                          />
                                        </a>
                                      </div>
                                    )}
                                  
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showNavigation && (
                <>
                    <div
                        className={`absolute top-1/2 left-0 transform -translate-y-1/2 `}
                    >
                        <button
                            onClick={prevSlide}
                            className="bg-secondary rounded-r-lg text-white w-12 h-12 flex items-center justify-center transition-colors duration-300"
                        >
                            <ChevronLeft width={"1rem"} />
                        </button>
                    </div>
                    <div
                        className={`absolute top-1/2 right-0 transform -translate-y-1/2 `}
                    >
                        <button
                            onClick={nextSlide}
                            className="bg-secondary rounded-l-lg text-white w-12 h-12 flex items-center justify-center transition-colors duration-300"
                        >
                            <ChevronRight width={"1rem"} />
                        </button>
                    </div>
                </>
            )}

            {showPagination && (
                <div className="px-primary 2xl:px-0 2xl:max-w-7xl mx-auto ">
                    <div className="relative">
                        <div
                            className={`absolute bottom-4 ${
                                alignmentClassPagination === "left"
                                    ? "inset-x-0 left-0"
                                    : alignmentClassPagination === "right"
                                    ? "right-0"
                                    : "left-1/2 transform -translate-x-1/2"
                            }`}
                        >
                            {items.map((_, index) => (
                                <div
                                    key={`dot-${index}`}
                                    className={`inline-flex mx-1 w-3 h-3 rounded-full ${
                                        currentIndex === index + 1
                                            ? "bg-white h-5 w-5 lg:w-6 lg:h-6 items-center justify-center border-2 border-primary"
                                            : "bg-secondary"
                                    }`}
                                    onClick={() => setCurrentIndex(index + 1)}
                                >
                                    {currentIndex === index + 1 && (
                                        <div className="w-3 h-3 bg-primary rounded-full items-center justify-center"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SliderInteractive;
