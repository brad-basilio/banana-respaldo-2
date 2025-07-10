import { useEffect, useRef, useState } from "react";
import {
    ShoppingCart,
    Store,
    Home,
    Phone,
    CircleUserRound,
    ChevronDown,
    CheckSquare,
    Plus,
    ChevronUp,
    CircleCheckIcon,
    ChevronLeft,
    Share2,
    CheckCircle2,
    ChevronRight,
} from "lucide-react";

import ItemsRest from "../../../Actions/ItemsRest";
import Swal from "sweetalert2";
import { Notify } from "sode-extend-react";
import ProductInfinite from "../Products/ProductInfinite";
import CartModal from "../Components/CartModal";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, Grid, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/grid";
import { Swiper, SwiperSlide } from "swiper/react";
import ProductNavigationSwiperPaani from "../Products/ProductNavigationSwiperPaani";



const ProductDetailPaani = ({ item, data, setCart, cart, generals, favorites, setFavorites }) => {

    const itemsRest = new ItemsRest();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState({
        url: item?.image,
        type: "main",
    });

    const [quantity, setQuantity] = useState(1);
    const handleChange = (e) => {
        let value = parseInt(e.target.value, 10);
        if (isNaN(value) || value < 1) value = 1;
        if (value > 10) value = 10;
        setQuantity(value);
    };
    /*ESPECIFICACIONES */
    const [isExpanded, setIsExpanded] = useState(false);

    const onAddClicked = (product) => {
        const newCart = structuredClone(cart);
        const index = newCart.findIndex((x) => x.id == product.id);
        if (index == -1) {
            newCart.push({ ...product, quantity: quantity });
        } else {
            newCart[index].quantity++;
        }
        setCart(newCart);

        /*   Swal.fire({
               title: "Producto agregado",
               text: `Se agregó ${product.name} al carrito`,
               icon: "success",
               timer: 1500,
           });*/
        setModalOpen(!modalOpen);
        setTimeout(() => setModalOpen(false), 3000);
    };

    const [relationsItems, setRelationsItems] = useState([]);
    const inCart = cart?.find((x) => x.id == item?.id);

    useEffect(() => {
        if (item?.id) {
            productosRelacionados(item);

            handleViewUpdate(item);
        }
    }, [item]); // Agregar `item` como dependencia
    const handleViewUpdate = async (item) => {
        try {
            const request = {
                id: item?.id,
            };
            console.log(request);
            const response = await itemsRest.updateViews(request);

            // Verificar si la respuesta es válida
            if (!response) {
                return;
            }
        } catch (error) {
            return;
        }
    };


    const productosRelacionados = async (item) => {
        try {
            // Preparar la solicitud
            const request = {
                id: item?.id,
            };

            // Llamar al backend para verificar el combo
            const response = await itemsRest.productsRelations(request);

            // Verificar si la respuesta es válida
            if (!response) {
                return;
            }

            // Actualizar el estado con los productos asociados
            const relations = response;

            setRelationsItems(Object.values(relations));
            console.log(relations);
        } catch (error) {
            return;
            // Mostrar un mensaje de error al usuario si es necesario
        }
    };

    const [expandedSpecificationMain, setExpanded] = useState(false);



    // Swiper Refs
    const mainSwiperRef = useRef(null);
    const thumbSwiperRef = useRef(null);
    const navigationPrevRef = useRef(null);
    const navigationNextRef = useRef(null);

    const phone_whatsapp = generals?.find(
        (general) => general.correlative === "phone_whatsapp"
    );

    const numeroWhatsApp = phone_whatsapp?.description; // Reemplaza con tu número
    const mensajeWhatsApp = encodeURIComponent(
        `¡Hola! Tengo dudas sobre este producto: ${item.name}`
    );
    const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeWhatsApp}`;

    const handleClickWhatsApp = () => {
        window.open(linkWhatsApp, "_blank");
    };
    const mensajeWhatsAppCotizar = encodeURIComponent(
        `¡Hola! Me gustaría cotizar este producto: ${item.name}`
    );
    const linkWhatsAppCotizar = `https://wa.me/${numeroWhatsApp}?text=${mensajeWhatsAppCotizar}`;
    const handleClickWhatsAppCotizar = () => {
        window.open(linkWhatsAppCotizar, "_blank");
    };
    // Animaciones
    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } },
    };

    const slideUp = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    return (
        <>
            {/* Versión Mobile */}
            <div className="md:hidden  min-h-screen font-paragraph">
                {/* Header Estilo App */}
                <div className="sticky top-0 bg-white shadow-sm z-20">
                    <div className="flex items-center p-4 gap-4 border-b">
                        {/* <button onClick={() => window.history.back()} className="text-gray-600">
                            <ChevronLeft size={24} />
                        </button>*/}
                        <h1 className="text-lg font-bold flex-1 line-clamp-5">{item?.name}</h1>
                    </div>
                </div>

                {/* Contenido Principal */}
                <div className="p-4 pb-10">
                    {/* Carrusel Principal */}
                    <div className="relative aspect-square mb-4 rounded-2xl overflow-hidden shadow-lg">
                        <Swiper
                            ref={mainSwiperRef}
                            modules={[Navigation, Pagination]}
                            navigation={{
                                prevEl: navigationPrevRef.current,
                                nextEl: navigationNextRef.current,
                            }}
                            pagination={{
                                clickable: true,
                                renderBullet: (_, className) =>
                                    `<span class="${className} !w-2 !h-2 !bg-white/50 !mx-1"></span>`,
                            }}
                            loop={true}
                            onSwiper={(swiper) => {
                                mainSwiperRef.current = swiper;
                            }}
                            className="h-full"
                        >
                            {[item?.image, ...item?.images]
                                .filter((image, index, self) =>
                                    index === self.findIndex((img) => img.url === image.url)
                                )
                                .map((img, i) => (
                                    <SwiperSlide key={i}>
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                            <img
                                                src={`/storage/images/item/${img.url || img}`}
                                                className="w-full h-full object-contain"
                                                loading="lazy"
                                                onError={(e) => (e.target.src = "/api/cover/thumbnail/null")}
                                            />
                                        </div>
                                    </SwiperSlide>
                                ))}
                        </Swiper>

                        {/* Botones de navegación */}
                        <div className="absolute top-1/2 w-full flex justify-between px-2 transform -translate-y-1/2 z-10">
                            <button
                                ref={navigationPrevRef}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/80 shadow-lg hover:scale-110 transition-transform"
                            >
                                <ChevronLeft className="text-gray-800" size={20} />
                            </button>
                            <button
                                ref={navigationNextRef}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/80 shadow-lg hover:scale-110 transition-transform"
                            >
                                <ChevronRight className="text-gray-800" size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Sección de Precio */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-3xl font-bold customtext-primary">
                                    S/ {item?.final_price}
                                    <span className="ml-2 text-sm line-through text-gray-400">
                                        S/ {item?.price}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">SKU: {item?.sku}</div>
                            </div>
                            <div className="bg-secondary customtext-primary px-3 py-1 rounded-full text-sm">
                                {Number(item?.discount_percent).toFixed(0)}% OFF
                            </div>
                        </div>
                    </div>

                

                    {/* Acordeones */}
                    <div className="space-y-2">
                        {/* Especificaciones */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            <div className="border-b">
                                <button
                                    onClick={() => setExpanded(!expandedSpecificationMain)}
                                    className="w-full p-4 flex justify-between items-center"
                                >
                                    <span className="font-medium">Especificaciones técnicas</span>
                                    <ChevronDown
                                        className={`transform transition-transform ${expandedSpecificationMain ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>
                            </div>
                            {expandedSpecificationMain && (
                                <div className="p-4">
                                    {item?.specifications.map((spec, i) => (
                                        <div key={i} className="flex items-start gap-3 text-sm mb-2">
                                            <CheckCircle2 className="min-w-4 min-h-4 max-w-4 max-h-4 mt-0.5 customtext-primary" />
                                            <span>{spec.description}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Descripción */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            <div className="border-b">
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="w-full p-4 flex justify-between items-center"
                                >
                                    <span className="font-medium">Descripción del producto</span>
                                    <ChevronDown
                                        className={`transform transition-transform ${isExpanded ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>
                            </div>
                            {isExpanded && (
                                <div className="p-4">
                                    <div dangerouslySetInnerHTML={{ __html: item?.description }} />
                                    <ul className="list-disc pl-5 mt-2">
                                        {item?.features?.map((feature, i) => (
                                            <li key={i} className="text-sm">{feature.feature}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>


                </div>

                {/* Bottom Navigation */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-[99]">
                    <div className="p-4 flex gap-4">
                        <button onClick={() => { handleClickWhatsAppCotizar(); }} className="flex-1 bg-primary text-white py-3 rounded-full font-medium active:scale-95 transition-transform">
                           Quiero Cotizar
                        </button>
                       
                    </div>
                </div>
            </div>

            {/* Desktop View */}
            <div className="px-primary mx-auto py-12  hidden md:block font-paragraph">
                <div className="bg-white rounded-xl p-4 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column - Images and Delivery Options */}
                        <div className="space-y-6">


                            {/* Product Images */}
                            <div className="flex gap-6">
                                {/* Thumbnails */}
                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={() =>
                                            setSelectedImage({
                                                url: item?.image,
                                                type: "main",
                                            })
                                        }
                                        className={`w-16 h-16  rounded-lg p-2 border-2 ${selectedImage.url === item?.image
                                            ? "border-primary "
                                            : "border-gray-200"
                                            }`}
                                    >
                                        <img
                                            src={`/storage/images/item/${item?.image}`}
                                            alt="Main Thumbnail"
                                            className="w-full h-full object-contain"
                                            onError={(e) =>
                                            (e.target.src =
                                                "/api/cover/thumbnail/null")
                                            }
                                        />
                                    </button>
                                    {item?.images.filter((image, index, self) =>
                                        index === self.findIndex((img) => img.url === image.url) // Filtra duplicados
                                    ).map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() =>
                                                setSelectedImage({
                                                    url: image.url,
                                                    type: "gallery",
                                                })
                                            }
                                            className={`w-16 h-16 border-2 rounded-lg p-2 ${selectedImage.url === image.url
                                                ? "border-primary"
                                                : "border-gray-200"
                                                }`}
                                        >
                                            <img
                                                src={`/storage/images/item/${image.url}`}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="w-full h-full object-contain"
                                                onError={(e) =>
                                                (e.target.src =
                                                    "/api/cover/thumbnail/null")
                                                }
                                            />
                                        </button>
                                    ))}
                                </div>

                                {/* Main Image */}
                                <div className="flex-1">
                                    <img
                                        src={
                                            selectedImage.type === "main"
                                                ? `/storage/images/item/${selectedImage.url}`
                                                : `/storage/images/item/${selectedImage.url}`
                                        }
                                        onError={(e) =>
                                        (e.target.src =
                                            "/api/cover/thumbnail/null")
                                        }
                                        alt="Product main"
                                        className="w-full h-auto object-contain"
                                    />
                                </div>
                            </div>


                            <div className="flex lg:hidden gap-8 border-b-2 pb-8">
                                {/* Price Section */}
                                <div className=" w-full ">
                                    <p className="text-sm customtext-neutral-light mb-1">
                                        Precio:{" "}
                                        <span className="line-through line-clamp-1">
                                            S/ {item?.price}
                                        </span>
                                    </p>
                                    <div className="flex items-center gap-4 ">
                                        <span className="text-[40px] font-bold line-clamp-1">
                                            S/ {item?.final_price}
                                        </span>
                                        <span className="bg-[#F93232] text-white font-bold px-3 py-2 rounded-xl">
                                            -
                                            {Number(
                                                item?.discount_percent
                                            ).toFixed(1)}
                                            %
                                        </span>
                                    </div>

                                    {/* Quantity */}
                                    <div className="mt-4">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="flex items-center space-x-4 customtext-neutral-light text-sm">
                                                <span className="">
                                                    Cantidad
                                                </span>
                                                <div className="relative flex items-center border rounded-md px-2 py-1">
                                                    <input
                                                        type="number"
                                                        value={quantity}
                                                        onChange={handleChange}
                                                        min="1"
                                                        max="10"
                                                        className="w-10 py-1 customtext-neutral-dark text-center bg-transparent outline-none appearance-none"
                                                    />
                                                </div>
                                                <span className="">
                                                    Máximo 10 unidades.
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Add to Cart */}
                                    <button
                                        onClick={() => {
                                            onAddClicked(item);

                                        }}
                                        className="w-full bg-primary text-white py-3 font-bold shadow-lg rounded-xl hover:opacity-90 transition-all duration-300 mt-4"
                                    >
                                        Quiero Cotizar
                                    </button>
                                </div>
                            </div>

                            {/* Specifications */}
                            <div className="block lg:hidden flex-1 w-full ">
                                <div className="bg-[#F7F9FB] rounded-lg p-6">
                                    <h3 className="font-medium text-sm mb-4">
                                        Especificaciones principales
                                    </h3>
                                    <ul
                                        className={`space-y-2  customtext-neutral-light mb-4 transition-all duration-300 ${expandedSpecificationMain
                                            ? "max-h-full"
                                            : "max-h-24 overflow-hidden"
                                            }`}
                                        style={{ listStyleType: "disc" }}
                                    >
                                        {item?.specifications.map(
                                            (spec, index) =>
                                                spec.type === "principal" && (
                                                    <li
                                                        key={index}
                                                        className="flex gap-2"
                                                    >
                                                        <CircleCheckIcon className="customtext-primary" />
                                                        {spec.description}
                                                    </li>
                                                )
                                        )}
                                    </ul>
                                    <button
                                        className="customtext-primary text-sm font-semibold hover:underline flex items-center gap-1 transition-all duration-300"
                                        onClick={() =>
                                            setExpanded(
                                                !expandedSpecificationMain
                                            )
                                        }
                                    >
                                        {expandedSpecificationMain
                                            ? "Ver menos"
                                            : "Ver más especificaciones"}
                                        {expandedSpecificationMain ? (
                                            <ChevronUp className="w-4 h-4" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>





                        </div>

                        {/* Right Column - Product Info */}
                        <div className="hidden md:block font-paragraph">
                            {/* Brand and Title */}
                            <div className="mb-6">

                                {/* SKU and Availability */}
                                <div className="font-paragraph flex customtext-neutral-light items-center gap-8 text-sm mb-6">
                                    <span className="customtext-neutral-light text-sm">
                                        Marca:{" "}
                                        <span className="customtext-neutral-dark font-medium">
                                            {item?.brand.name}
                                        </span>
                                    </span>

                                    <span className="customtext-neutral-light text-sm">
                                        SKU:{" "}
                                        <span className="customtext-neutral-dark font-medium">
                                            {item?.sku}
                                        </span>
                                    </span>
                                    <span className="ustomtext-neutral-light text-sm">
                                        Disponibilidad:{" "}
                                        <span className="customtext-neutral-dark  font-medium">
                                            {item?.stock > 0
                                                ? "En stock"
                                                : "Agotado"}
                                        </span>
                                    </span>
                                </div>

                                <h1 className="customtext-neutral-dark text-[40px] font-title font-bold mt-2">
                                    {item?.name}
                                </h1>
                            </div>


                            <div className="flex flex-col gap-8 pb-8">
                                {/* Price Section */}
                                <div className=" w-full ">
                                    <div className="flex gap-8">
                                        <div>
                                            <p className="text-sm customtext-neutral-light mb-1 font-bold">
                                                Precio:{" "}
                                                <span className="line-through">
                                                    S/ {item?.price}
                                                </span>
                                            </p>
                                            <div className="flex items-center gap-4 relative customtext-neutral-dark font-extrabold">
                                                <span className="text-[40px] font-bold ">
                                                    S/ {item?.final_price}
                                                </span>

                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-4">
                                            <span className=" bg-[#F93232] text-white font-bold px-3 py-2 rounded-xl">
                                                -
                                                {Number(
                                                    item?.discount_percent
                                                ).toFixed(0)}
                                                %
                                            </span>
                                        </div>
                                    </div>



                                    {/* Add to Cart */}
                                    <button
                                        onClick={() => {

                                            handleClickWhatsAppCotizar();
                                        }}
                                        className="w-full bg-primary text-white py-3 font-bold shadow-lg rounded-full hover:opacity-90 transition-all duration-300 mt-4"
                                    >
                                        Quiero Cotizar
                                    </button>
                                </div>
                                {/* Specifications */}
                                <div className="flex-1 w-full ">
                                    <div className="bg-secondary rounded-lg p-6">
                                        <h3 className="font-bold text-lg mb-4 customtext-neutral-dark">
                                            Especificaciones principales
                                        </h3>
                                        <ul
                                            className={`space-y-2  customtext-neutral-light mb-4 transition-all duration-300 ${expandedSpecificationMain
                                                ? "max-h-full"
                                                : "max-h-24 overflow-hidden"
                                                }`}
                                            style={{ listStyleType: "disc" }}
                                        >
                                            {item?.specifications.map(
                                                (spec, index) =>
                                                    spec.type ===
                                                    "principal" && (
                                                        <li
                                                            key={index}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <CircleCheckIcon className="customtext-primary min-h-4 min-w-4 max-h-4 max-w-4" />
                                                            {spec.description}
                                                        </li>
                                                    )
                                            )}
                                        </ul>
                                        <button
                                            className="customtext-primary text-sm font-semibold hover:underline flex items-center gap-1 transition-all duration-300"
                                            onClick={() =>
                                                setExpanded(
                                                    !expandedSpecificationMain
                                                )
                                            }
                                        >
                                            {expandedSpecificationMain
                                                ? "Ver menos"
                                                : "Ver más especificaciones"}
                                            {expandedSpecificationMain ? (
                                                <ChevronUp className="w-4 h-4" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>


                            </div>
                            {/* Whatsapp */}
                            <motion.div
                                variants={slideUp}
                                className="w-full mt-5"
                            >
                                <motion.div
                                    className="bg-secondary flex flex-row rounded-xl p-5 gap-3"
                                    whileHover={{ y: -2 }}
                                >
                                    <img
                                        src="/assets/img/whatsapp.svg"
                                        onError={(e) =>
                                        (e.target.src =
                                            "assets/img/noimage/no_imagen_circular.png")
                                        }
                                        className="w-12 h-12 object-contain"
                                        loading="lazy"
                                    />
                                    <div className="customtext-neutral-dark cursor-pointer font-font-general text-base 2xl:text-lg font-semibold">
                                        <p>
                                            ¿Tienes dudas sobre este producto?
                                            Haz{" "}
                                            <a
                                                className="underline"
                                                onClick={handleClickWhatsApp}
                                            >
                                                clic aquí
                                            </a>{" "}
                                            y chatea con nosotros por WhatsApp
                                        </p>
                                    </div>
                                </motion.div>
                            </motion.div>

                        </div>
                    </div>
                </div>
                <div className=" grid gap-20 md:grid-cols-2 bg-white rounded-xl p-8 mt-12">
                    {/* Specifications Section */}
                    <div>
                        <h2 className="text-2xl font-bold customtext-neutral-dark mb-4 pb-4">
                            Especificaciones
                        </h2>
                        <div className="space-y-1">
                            {item?.specifications.map(
                                (spec, index) =>
                                    spec.type === "general" && (
                                        <div
                                            key={index}
                                            className={`grid grid-cols-2 gap-4 p-4 ${index % 2 === 0
                                                ? "bg-secondary"
                                                : "bg-white"
                                                }`}
                                        >
                                            <div className="customtext-neutral-light">
                                                {spec.title}
                                            </div>
                                            <div className="customtext-neutral-dark">
                                                {spec.description}
                                            </div>
                                        </div>
                                    )
                            )}
                        </div>
                    </div>

                    {/* Additional Information Section */}
                    <div>
                        <h2 className="text-2xl font-bold customtext-neutral-dark mb-4  pb-4">
                            Información adicional
                        </h2>
                        <div
                            className={`space-y-2 ${!isExpanded
                                ? "max-h-[400px] overflow-hidden"
                                : ""
                                }`}
                        >
                            <h3 className="text-xl font-semibold customtext-neutral-dark mb-4">
                                Acerca de este artículo
                            </h3>
                            <div
                                className="customtext-neutral-dark"
                                dangerouslySetInnerHTML={{
                                    __html: item?.description,
                                }}
                            ></div>
                            <div className={`pl-10`}>
                                <ul className="list-disc pl-5 space-y-2">
                                    {item?.features.map((feature, index) => (
                                        <li
                                            key={index}
                                            className="customtext-neutral-dark"
                                        >
                                            {feature.feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <button
                            variant="ghost"
                            className="border-2 border-primary  w-max px-5 py-3  my-8  rounded-xl flex items-center gap-2 customtext-primary font-semibold cursor-pointer"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            Ver más
                            <ChevronDown
                                className={`transform transition-transform ${isExpanded ? "rotate-180" : ""
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>
            {relationsItems.length > 0 && (
                <ProductNavigationSwiperPaani
                    data={{ title: "Te puede interesar",style_offer: "circle", background: "", backgroundboton: "bg-[linear-gradient(90deg,_#003D52_0%,_#0075A7_118.41%)]" }}
                    items={relationsItems}
                    cart={cart}
                    setCart={setCart}
                    favorites={favorites}
                    setFavorites={setFavorites}
                    textcolor="customtext-neutral-dark"
                />)}
            <CartModal
                data={data}
                cart={cart}
                setCart={setCart}
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
            />
        </>
    );
}
export default ProductDetailPaani;