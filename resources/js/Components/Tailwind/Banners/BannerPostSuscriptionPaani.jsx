import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import BannerAd from "./BannerAd";
import BannerPublicitario from "./BannerPublicitario";
import SubscriptionsRest from "../../../Actions/SubscriptionsRest";
import { toast } from "sonner";
import Global from "../../../Utils/Global";
import { CircleCheckBig } from "lucide-react";

const BannerPostSuscriptionPaani = ({ data, items }) => {
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

  const [saving, setSaving] = useState(false);
    const subscriptionsRest = new SubscriptionsRest();
    const emailRef = useRef();
    const onEmailSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const request = {
            email: emailRef.current.value,
        };
        const result = await subscriptionsRest.save(request);
        setSaving(false);

        if (!result) return;

        /* Swal.fire({
             title: "¡Éxito!",
             text: `Te has suscrito correctamente al blog de ${Global.APP_NAME}.`,
             icon: "success",
             confirmButtonText: "Ok",
         });*/
        toast.error("¡Suscrito!", {
            description: `Te has suscrito correctamente al blog de ${Global.APP_NAME}.`,
            icon: <CircleCheckBig className="h-5 w-5 text-green-500" />,
            duration: 3000,
            position: "top-center",
        });

        emailRef.current.value = null;
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="py-10  w-full mx-auto px-primary font-paragraph customtext-neutral-dark 2xl:px-0 2xl:max-w-7xl"
        >
            <motion.div variants={itemVariants} className="flex flex-col lg:flex-row justify-between lg:items-center ">
                <h2 className="text-[32px] leading-9 font-semibold  md:mb-0">
                    {data?.title}
                </h2>
                <motion.a
                    href={data?.link_button}
                    className="font-bold"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    {data?.text_button}{" "}
                    <i className="mdi mdi-chevron-right"></i>
                </motion.a>
            </motion.div>

            <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10"
            >
                <motion.div
                    variants={itemVariants}
                    className="col-span-1 bg-secondary md:col-span-2 lg:col-span-3 rounded-2xl p-4 grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    {items.map((item, index) => {
                        const content = document.createElement("div");
                        content.innerHTML = item?.description;
                        const text = content.textContent || content.innerText || "";

                        return (
                            <motion.div
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
                                        className="inset-0 h-[250px] w-full object-cover aspect-[4/3]"
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
                            </motion.div>
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
                    className="col-span-1 md:col-span-1 lg:col-span-1 rounded-2xl"
                >
                    <div className=" rounded-3xl overflow-hidden shadow-sm h-[500px] lg:h-full" style={{ backgroundImage: `url(/storage/images/system/${data?.background})`, backgroundSize: "cover", backgroundPosition: "top" }}>

                        <div className="relative z-10 flex flex-col justify-end h-full px-6 py-10 w-full">
                            <h2 className="text-3xl 2xl:text-4xl font-medium text-white mb-2 drop-shadow-lg">
                                {data?.name}
                            </h2>
                            <p className="text-base 2xl:text-lg  text-white mb-3 max-w-2xl drop-shadow">
                                {data?.description}
                            </p>
                            <form onSubmit={onEmailSubmit}>
                                <div className="relative">
                                    <input
                                        ref={emailRef}
                                        type="email"
                                        placeholder="Ingresa tu e-mail"
                                        className="w-full  bg-transparent text-sm   shadow-xl  py-4 pl-5 border  rounded-[20px] md:rounded-full focus:ring-0 focus:outline-none placeholder:text-white text-white"
                                    />
                                    <button
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 py-2  shadow-xl px-4 bg-[linear-gradient(90deg,_#003D52_0%,_#0075A7_118.41%)] text-white rounded-full"
                                        aria-label="Suscribite"
                                    >
                                        Suscribirme
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default BannerPostSuscriptionPaani;