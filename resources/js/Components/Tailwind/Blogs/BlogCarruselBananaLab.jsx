import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";

const BlogCarruselBananaLab = ({ data, items }) => {
    const [secondAd, setSecondAd] = useState(null);
    const renderTextWithBold = (text) => {
        if (!text) return text;

        const parts = text.split(/(\*.*?\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('*') && part.endsWith('*')) {
                const boldText = part.slice(1, -1); // Remover los asteriscos
                return <span key={index} className="font-bold customtext-primary text-6xl ">{boldText}</span>;
            }
            return part;
        });
    };
    // useEffect para cargar el segundo ad
    useEffect(() => {
        const fetchSecondAd = async () => {
            try {
                const response = await fetch('/api/ads/active');
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 1) {
                        setSecondAd(data[1]); // Tomar el segundo ad
                        console.log('Second ad loaded:', data[1]);
                    } else if (data && data.length === 1) {
                        // Si solo hay un ad, usarlo también como segundo
                        setSecondAd(data[0]);
                        console.log('Only one ad available, using it as second ad:', data[0]);
                    }
                }
            } catch (error) {
                console.error('Error fetching second ad:', error);
            }
        };
        fetchSecondAd();
    }, []);

    // Animaciones
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const hoverCard = {
        scale: 1.02,
        boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
        transition: { duration: 0.3 }
    };

    const hoverImage = {
        scale: 1.05,
        transition: { duration: 0.5 }
    };

    return (
        <>
            {items && items.length > 0 && (
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                    className="w-full mx-auto px-[5%] font-paragraph customtext-neutral-dark mb-8 2xl:px-0 2xl:max-w-7xl"
                >
                    <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
                        <h2 className="text-[32px] leading-9 font-semibold mb-2 md:mb-0">
                            {data?.title}
                        </h2>
                        <motion.a
                            href={data?.link_blog}
                            className="font-bold"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            {data?.button_text_section}{" "}
                            <i className="mdi mdi-chevron-right"></i>
                        </motion.a>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-16"
                    >
                        <motion.div
                            variants={itemVariants}
                            className="col-span-1 bg-sections-color md:col-span-2 lg:col-span-3 rounded-2xl p-4 grid grid-cols-1 lg:grid-cols-2 gap-6"
                        >
                            {items.map((item, index) => {
                                const content = document.createElement("div");
                                content.innerHTML = item?.description;
                                const text = content.textContent || content.innerText || "";

                                return (
                                    <motion.a
                                        href={`/blog/${item?.slug}`}
                                        key={index}
                                        variants={itemVariants}
                                        whileHover={hoverCard}
                                        className="bg-white rounded-lg overflow-hidden shadow-sm h-auto cursor-pointer"
                                    >
                                        <motion.div
                                            className="overflow-hidden"
                                            whileHover={hoverImage}
                                        >
                                            <img
                                                src={`/storage/images/post/${item?.image}`}
                                                alt={item?.title}
                                                className="inset-0  w-full object-cover aspect-[6/3]"
                                            />
                                        </motion.div>
                                        <div className="p-4">
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
                                    </motion.a>
                                );
                            })}
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            whileHover={{
                                scale: 1.02,
                                rotate: 0.5,
                                transition: { type: "spring", damping: 10 }
                            }}
                            className="col-span-1 md:col-span-1 lg:col-span-1 rounded-2xl mt-2"
                        >
                            <div className="bg-white rounded-3xl overflow-hidden shadow-sm h-full">

                                <motion.a
                                    href={data?.button_link || '#'}
                                    target={data?.button_link ? "_blank" : "_self"}
                                    className="block h-full w-full relative overflow-hidden"
                                    whileHover={{ scale: 1.02 }}
                                    title={data?.description || data?.name}
                                >
                                    <motion.img
                                        src={`/storage/images/system/${data?.background}`}
                                        alt={data?.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            // Fallback a la imagen original si falla cargar el ad
                                            e.target.src = src = "/api/cover/thumbnail/null";
                                        }}
                                    />
                                    {/* Overlay con el contenido */}
                                    <div className="absolute inset-0 flex flex-col justify-between items-start p-6  ">
                                     <div>
                                           <h3 className="text-white font-medium text-5xl  mb-2">{renderTextWithBold(data?.name)}</h3>
                                        <p className="text-neutral-dark text-base mb-4 leading-relaxed">{data?.description}</p>
                                      
                                     </div>
                                      
                                        <a href={data?.button_link || '#'} target={data?.button_link ? "_blank" : "_self"} className="text-white w-full text-center bg-primary px-6 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors">
                                            {data?.button_text}
                                        </a>
                                    </div>
                                </motion.a>

                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>

            )}
        </>
    );
};

export default BlogCarruselBananaLab;