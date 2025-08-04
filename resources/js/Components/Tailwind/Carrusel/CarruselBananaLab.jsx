import { motion, AnimatePresence } from "framer-motion";
import { Hexagon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";

const CarruselBananaLab = ({data, items }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [firstAd, setFirstAd] = useState(null);
    
    // Función para procesar texto con **texto** y convertirlo a font-bold
    const renderTextWithBold = (text) => {
        if (!text) return text;
        
        const parts = text.split(/(\*.*?\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('*') && part.endsWith('*')) {
                const boldText = part.slice(1, -1); // Remover los asteriscos
                return <span key={index} className="font-bold !text-[#3D143E]">{boldText}</span>;
            }
            return part;
        });
    };
    
  

    // useEffect para cargar el primer ad
    useEffect(() => {
        const fetchFirstAd = async () => {
            try {
                const response = await fetch('/api/ads/active');
                if (response.ok) {
                    const data = await response.json();
                    if (data && data?.length > 0) {
                        setFirstAd(data[0]); // Tomar el primer ad
                        console.log('First ad loaded:', data[0]);
                    }
                }
            } catch (error) {
                console.error('Error fetching ads:', error);
            }
        };
        fetchFirstAd();
    }, []);

    // Animaciones
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
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
        },
        hover: {
            backgroundColor: "rgba(244, 184, 184, 0.8)",
            transition: { duration: 0.3 }
        }
    };

    const iconVariants = {
        hidden: { scale: 0 },
        visible: {
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 260,
                damping: 20
            }
        },
        hover: {
            rotate: 10,
            scale: 1.1,
            transition: { duration: 0.3 }
        }
    };

    const imageVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="pl-[5%] lg:px-[5%] overflow-hidden customtext-neutral-dark font-paragraph mt-5 lg:mt-10 lg:flex lg:gap-8 h-full 2xl:px-0 2xl:max-w-7xl mx-auto"
        >
            <motion.div 
                className="bg-secondary rounded-l-3xl 2xl:px-0 2xl:max-w-7xl mx-auto relative lg:w-9/12 lg:rounded-3xl lg:flex lg:items-center"
                whileHover={{ boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
            >
                {/* Versión Mobile */}
                <div className="lg:hidden pl-4 py-4">
                    <Swiper
                        slidesPerView={3}
                        spaceBetween={30}
                        loop={true}
                        breakpoints={{
                            0: { slidesPerView: 1.8, spaceBetween: 20 },
                            640: { slidesPerView: 1, spaceBetween: 10 },
                            1024: { slidesPerView: 1, spaceBetween: 0 },
                        }}
                        modules={[Navigation, Pagination]}
                        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                    >
                        {items && items?.map((benefit, index) => (
                            <SwiperSlide key={index}>
                                <motion.div
                                    className="flex p-4 flex-col rounded-xl justify-center h-[230px]"
                                    whileHover={{
                                        backgroundColor: "rgba(244, 184, 184, 0.8)",
                                        transition: { duration: 0.3 }
                                    }}
                                >
                                    <motion.div 
                                        className="relative min-w-20 min-h-20 rounded-full flex justify-start"
                                        variants={iconVariants}
                                        whileHover="hover"
                                    >
                                        <motion.img
                                            src={`/storage/images/strength/${benefit.image}`}
                                            className="min-w-20 min-h-20 object-cover"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2 }}
                                        />
                                    </motion.div>
                                    <motion.p 
                                        className="font-bold text-white mt-4"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        {benefit.name}
                                    </motion.p>
                                    <motion.p 
                                        className="text-white text-lg leading-6"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        {benefit.description}
                                    </motion.p>
                                </motion.div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* Versión Desktop */}
                <motion.div 
                    className="hidden lg:grid grid-cols-2 lg:p-4 lg:gap-4"
                    variants={containerVariants}
                >
                    {items && items?.map((benefit, index) => (
                        <motion.div
                            key={index}
                            className="flex cursor-pointer p-4 flex-col lg:flex-row lg:items-center lg:gap-4 rounded-xl justify-center h-[230px] lg:h-auto"
                            variants={itemVariants}
                            whileHover={{
                                backgroundColor: "rgba(244, 184, 184, 0.8)",
                                transition: { duration: 0.3 }
                            }}
                            animate={{
                                backgroundColor: hoveredIndex === index ? "rgba(244, 184, 184, 0.8)" : "transparent"
                            }}
                            onHoverStart={() => setHoveredIndex(index)}
                            onHoverEnd={() => setHoveredIndex(null)}
                        >
                            <motion.div 
                                className="relative w-20 h-20 rounded-full flex justify-start lg:justify-center lg:items-center"
                                variants={iconVariants}
                                whileHover="hover"
                            >
                                <motion.img
                                    src={`/storage/images/strength/${benefit.image}`}
                                    className="w-full h-auto"
                                    animate={{
                                        filter: hoveredIndex === index ? "drop-shadow(0 5px 15px rgba(255,255,255,0.5))" : "none"
                                    }}
                                />
                            </motion.div>
                            <motion.div className="lg:flex lg:flex-col">
                                <motion.p 
                                    className="font-bold text-white mt-4 lg:mt-0"
                                    animate={{
                                        color: hoveredIndex === index ? "#FFF" : "#FFF",
                                        x: hoveredIndex === index ? 5 : 0
                                    }}
                                >
                                    {benefit.name}
                                </motion.p>
                                <motion.p 
                                    className="text-white text-lg leading-6"
                                    animate={{
                                        opacity: hoveredIndex === index ? 1 : 0.9
                                    }}
                                >
                                    {benefit.description}
                                </motion.p>
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>

            {/* Imagen lateral */}
            <motion.div 
                className="min-h-full w-full lg:w-4/12"
                variants={imageVariants}
            >
                <motion.a
                    href={data?.button_link || '#'}
                    target={data?.button_link ? "_blank" : "_self"}
                    className="h-full w-full flex items-center justify-center relative overflow-hidden rounded-lg"
                
                    title={data?.description || data?.name}
                >
                    <motion.img
                        src={`/storage/images/system/${data?.background}`}
                        alt={data?.name}
                        className="w-full min-h-full object-cover object-center"
                        onError={(e) =>
                            (e.target.src =
                                "/api/cover/thumbnail/null")
                        }
                    />
                    
                    {/* Overlay con el contenido */}
                    <div className="absolute inset-0 flex flex-col justify-center items-start p-6  ">
                        <h3 className="text-white font-medium text-3xl max-w-[70%] mb-2 whitespace-pre-line">{renderTextWithBold(data?.name)}</h3>
                        <p className="text-white text-base mb-4 max-w-[70%] leading-relaxed whitespace-pre-line">{data?.description}</p>
                        <a href={data?.button_link || '#'} target={data?.button_link ? "_blank" : "_self"} className="text-white bg-primary px-6 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors">
                            {data?.button_text}
                        </a>
                    </div>
                </motion.a>
            </motion.div>
        </motion.div>
    );
};

export default CarruselBananaLab;