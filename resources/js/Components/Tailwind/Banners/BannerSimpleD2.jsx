import React from "react";
import TextWithHighlightD2en1 from "../../../Utils/TextWithHighlightD2en1";

const BannerSimpleD2 = ({ data }) => {
    return (
        <section>
            <div className="px-primary replace-max-w-here w-full mx-auto py-[5%] md:py-[1.5%]">
                <div
                    className="w-full aspect-[5/2] rounded-2xl flex flex-col gap-5 items-center justify-center bg-white shadow-lg text-center"
                    style={{
                        backgroundImage: `url('/storage/images/system/${data?.background}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                >
                    <h1 className="text-xl sm:text-2xl 2xl:text-4xl text-white font-bold tracking-widest">
                         <TextWithHighlightD2en1 clase="text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl" text={data?.name} />
                    </h1>

                    <p className="text-white italic text-base md:text-lg lg:text-xl 2xl:text-2xl font-normal">{data?.description}</p>
                    
                    <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-8 customtext-primary font-semibold w-full py-5 max-w-md mx-auto">

                        {data?.button_link && data?.button_text && (
                            <a
                                className="bg-primary text-white text-base 2xl:text-xl tracking-normal cursor-pointer w-full sm:w-max px-5 sm:px-10 py-2.5 rounded-full  hover:opacity-90 transition-all duration-300 flex items-center justify-center"
                                href={data?.button_link}
                            >
                                {data?.button_text}
                            </a>
                        )}
                        
                        <a
                            href="/catalogo"
                            className="border-white hover:border-black hover:bg-primary text-white text-base 2xl:text-xl tracking-normal border cursor-pointer w-full sm:w-max px-5 sm:px-10 py-2.5 rounded-full  hover:opacity-90 transition-all duration-300 flex items-center justify-center "
                        >
                            Ver Productos
                        </a>
                        
                    </div>

                </div>
            </div>
        </section>
    );
};

export default BannerSimpleD2;
