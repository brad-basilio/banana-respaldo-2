import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import TextWithHighlight from "../../../Utils/TextWithHighlight";
import BlogCarrusel from "./Components/BlogCarrusel";
import SubscriptionsRest from "../../../Actions/SubscriptionsRest";
import Swal from "sweetalert2";
import Global from "../../../Utils/Global";

const BlogSectionAko = ({ data, items }) => {
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
        // boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
        transition: { duration: 0.3 }
    };

    const hoverImage = {
        scale: 1.05,
        transition: { duration: 0.5 }
    };

    const subscriptionsRest = new SubscriptionsRest();
    const emailRef = useRef();
    const [saving, setSaving] = useState();
    
    const onEmailSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
    
        const request = {
          email: emailRef.current.value,
        };
        const result = await subscriptionsRest.save(request);
        setSaving(false);
    
        if (!result) return;
    
        Swal.fire({
          title: "¡Éxito!",
          text: `Te has suscrito correctamente al blog de ${Global.APP_NAME}.`,
          icon: "success",
          confirmButtonText: "Ok",
        });
    
        emailRef.current.value = null;
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="w-full px-[5%] font-title customtext-neutral-dark py-12 lg:py-20"
        >
            <motion.div variants={itemVariants} className="flex flex-col gap-6 justify-center items-center mb-6">
                <h2 className="max-w-lg 2xl:max-w-xl mx-auto text-3xl sm:text-4xl lg:text-[40px] 2xl:text-5xl text-center font-medium tracking-normal customtext-neutral-dark leading-tight font-title">
                    <TextWithHighlight text={data?.title} ></TextWithHighlight>
                </h2>
                <p className="max-w-3xl 2xl:max-w-4xl mx-auto text-lg 2xl:text-xl tracking-normal font-light font-title customtext-neutral-dark text-center">
                    {data?.description}
                </p>
            </motion.div>

            <motion.div 
                variants={containerVariants}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-16"
            >   
                <BlogCarrusel 
                    items={items} 
                    itemVariants={itemVariants} 
                    hoverCard={hoverCard} 
                    hoverImage={hoverImage}
                />

                <motion.div 
                    variants={itemVariants}
                    whileHover={{ 
                        scale: 1.02,
                        rotate: 0.5,
                        transition: { type: "spring", damping: 10 }
                    }}
                    className="col-span-1 rounded-2xl mt-2 "
                >
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm h-full relative flex flex-col items-center justify-end" 
                        style={{
                            backgroundImage: 'url(/assets/img/backgrounds/resources/suscription.png)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                          }}
                        > 

                        <div
                            className="bg-transparent text-white text-left p-4 rounded-b-2xl"
                        >
                            <h2 className="text-2xl font-title font-medium mb-3">¡Suscríbete a nuestro blog y recibe las últimas novedades y consejos!</h2>
                            
                            <form onSubmit={onEmailSubmit} className="max-w-sm">
                                <div className="relative customtext-primary">
                                    <input ref={emailRef} type="email" placeholder="Ingresa tu e-mail"
                                    className="w-full bg-transparent text-white font-medium py-4 pl-2 border-2 border-white rounded-xl focus:ring-0 focus:outline-none placeholder:text-white placeholder:opacity-65" />
                                    <button
                                        className="absolute text-md right-2 top-1/2 transform -translate-y-1/2 py-3 font-medium px-4 bg-accent customtext-neutral-light rounded-lg"
                                        aria-label="Suscribite">
                                        Suscribirme
                                    </button>
                                </div>
                            </form>
                            
                        </div>
                    </div>
                    
                </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-row items-center justify-center w-full mt-6">
                <motion.a 
                    href={data?.link_blog} 
                    className="bg-secondary text-base lg:text-lg customtext-neutral-light px-10 py-2.5 rounded-lg"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                   {data?.button_text}{" "}
                </motion.a>
            </motion.div>

        </motion.div>
    );
};

export default BlogSectionAko;