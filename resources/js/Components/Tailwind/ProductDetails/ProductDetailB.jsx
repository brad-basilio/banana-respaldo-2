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
    MessageCircle,
    Truck,
    X,
    ZoomIn,
} from "lucide-react";

import ItemsRest from "../../../Actions/ItemsRest";
import Swal from "sweetalert2";
import { Notify } from "sode-extend-react";
import ProductInfinite from "../Products/ProductInfinite";
import CartModal from "../Components/CartModal";
import { motion } from "framer-motion";

import { Navigation, Grid, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/grid";
import { Swiper, SwiperSlide } from "swiper/react";
import ReactModal from "react-modal";
import HtmlContent from "../../../Utils/HtmlContent";





const ProductDetail = ({ item, data, setCart, cart, generals }) => {
    console.log(item);
    const itemsRest = new ItemsRest();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState({
        url: item?.image,
        type: "main",
    });

    // Estados para la funcionalidad de zoom
    const [isZoomEnabled, setIsZoomEnabled] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
    const imageRef = useRef(null);

    const [quantity, setQuantity] = useState(1);
    const handleChange = (e) => {
        let value = parseInt(e.target.value, 10);
        if (isNaN(value) || value < 1) value = 1;
        if (value > 10) value = 10;
        setQuantity(value);
    };
    /*ESPECIFICACIONES */
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSpecificationsExpanded, setIsSpecificationsExpanded] = useState(false);

    // Referencias para medir contenido
    const descriptionRef = useRef(null);
    const specificationsRef = useRef(null);

    // Estados para controlar si se necesita "Ver más"
    const [needsDescriptionExpand, setNeedsDescriptionExpand] = useState(false);
    const [needsSpecificationsExpand, setNeedsSpecificationsExpand] = useState(false);

    // Estados para modal de políticas de envío
    const [deliveryPolicyModalOpen, setDeliveryPolicyModalOpen] = useState(false);

    // Funciones para manejar el zoom de la imagen
    const handleZoomClick = () => {
        console.log('Zoom clicked, current state:', isZoomEnabled);
        setIsZoomEnabled(!isZoomEnabled);
        if (!isZoomEnabled) {
            // Centrar la imagen cuando se activa el zoom
            setZoomPosition({ x: 50, y: 50 });
        }
        setIsDragging(false);
    };

    const handleMouseDown = (e) => {
        if (!isZoomEnabled) return;
        setIsDragging(true);
        setLastMousePosition({ x: e.clientX, y: e.clientY });
        e.preventDefault();
    };

    const handleMouseMove = (e) => {
        if (!isZoomEnabled || !imageRef.current) return;

        if (isDragging) {
            // Modo arrastre: mover el zoom basado en el delta del mouse
            const deltaX = e.clientX - lastMousePosition.x;
            const deltaY = e.clientY - lastMousePosition.y;
            
            setZoomPosition(prev => {
                // Ajustar la sensibilidad para movimiento más suave
                const sensitivity = 0.3; // Reducir para movimiento más suave
                const newX = Math.max(0, Math.min(100, prev.x - deltaX * sensitivity));
                const newY = Math.max(0, Math.min(100, prev.y - deltaY * sensitivity));
                return { x: newX, y: newY };
            });
            
            setLastMousePosition({ x: e.clientX, y: e.clientY });
        } else {
            // Modo hover: seguir el cursor suavemente cuando no se arrastra
            const rect = imageRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            const limitedX = Math.max(10, Math.min(90, x)); // Evitar bordes extremos
            const limitedY = Math.max(10, Math.min(90, y));
            
            // Interpolación muy suave para el hover
            setZoomPosition(prev => ({
                x: prev.x + (limitedX - prev.x) * 0.1,
                y: prev.y + (limitedY - prev.y) * 0.1
            }));
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        // No desactivar el zoom automáticamente, permitir que el usuario lo controle
    };

    // WhatsApp configuration
    const phone_whatsapp = generals?.find(
        (general) => general.correlative === "phone_whatsapp"
    );

    const numeroWhatsApp = phone_whatsapp?.description;
    const mensajeWhatsApp = encodeURIComponent(
        `¡Hola! Tengo dudas sobre este producto: ${item?.name}`
    );
    const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeWhatsApp}`;

    const handleClickWhatsApp = () => {
        window.open(linkWhatsApp, "_blank");
    };

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

    const [associatedItems, setAssociatedItems] = useState([]);
    const [relationsItems, setRelationsItems] = useState([]);
    const inCart = cart?.find((x) => x.id == item?.id);

    useEffect(() => {
        if (item?.id) {
            productosRelacionados(item);
            obtenerCombo(item);
            handleViewUpdate(item);
        }
    }, [item]); // Agregar `item` como dependencia

    // useEffect para verificar si se necesita el botón "Ver más"
    useEffect(() => {
        const checkContentHeight = () => {
            // Verificar descripción
            if (descriptionRef.current) {
                const contentHeight = descriptionRef.current.scrollHeight;
                const maxHeight = 400; // 400px que es nuestra altura máxima
                setNeedsDescriptionExpand(contentHeight > maxHeight);
            }

            // Verificar especificaciones
            if (specificationsRef.current) {
                const contentHeight = specificationsRef.current.scrollHeight;
                const maxHeight = 400; // 400px que es nuestra altura máxima
                setNeedsSpecificationsExpand(contentHeight > maxHeight);
            }
        };

        // Verificar después de que el contenido se haya renderizado
        setTimeout(checkContentHeight, 100);

        // También verificar cuando cambie el tamaño de la ventana
        window.addEventListener('resize', checkContentHeight);

        return () => {
            window.removeEventListener('resize', checkContentHeight);
        };
    }, [item]); // Ejecutar cuando cambie el item
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

    const obtenerCombo = async (item) => {
        try {
            // Preparar la solicitud
            const request = {
                id: item?.id,
            };

            // Llamar al backend para verificar el combo
            const response = await itemsRest.verifyCombo(request);

            // Verificar si la respuesta es válida
            if (!response) {
                return;
            }

            // Actualizar el estado con los productos asociados
            const associated = response[0].associated_items;

            setAssociatedItems(Object.values(associated));
        } catch (error) {
            return;
            // Mostrar un mensaje de error al usuario si es necesario
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
    const total = associatedItems.reduce(
        (sum, product) => sum + parseFloat(product.final_price),
        0
    );
    const [expandedSpecificationMain, setExpanded] = useState(false);

    const addAssociatedItems = () => {
        setCart((prevCart) => {
            const newCart = structuredClone(prevCart); // Clona el estado anterior

            [...associatedItems, item].forEach((product) => {
                const index = newCart.findIndex((x) => x.id === product.id);
                if (index === -1) {
                    newCart.push({ ...product, quantity: quantity });
                } else {
                    newCart[index].quantity++;
                }
            });

            return newCart; // Devuelve el nuevo estado acumulado
        });
        Notify.add({
            icon: "/assets/img/icon.svg",
            title: "Carrito de Compras",
            body: "Se agregaron con éxito los productos",
        });
    };

    // Swiper Refs
    const mainSwiperRef = useRef(null);
    const thumbSwiperRef = useRef(null);
    const navigationPrevRef = useRef(null);
    const navigationNextRef = useRef(null);

    // useEffect para manejar eventos globales del mouse (para el drag)
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            setIsDragging(false);
        };

        const handleGlobalMouseMove = (e) => {
            if (isDragging && isZoomEnabled && imageRef.current) {
                const deltaX = e.clientX - lastMousePosition.x;
                const deltaY = e.clientY - lastMousePosition.y;
                
                setZoomPosition(prev => {
                    // Sensibilidad ajustada para movimiento más suave y controlado
                    const sensitivity = 0.25;
                    const newX = Math.max(5, Math.min(95, prev.x - deltaX * sensitivity));
                    const newY = Math.max(5, Math.min(95, prev.y - deltaY * sensitivity));
                    return { x: newX, y: newY };
                });
                
                setLastMousePosition({ x: e.clientX, y: e.clientY });
            }
        };

        if (isDragging) {
            document.addEventListener('mouseup', handleGlobalMouseUp);
            document.addEventListener('mousemove', handleGlobalMouseMove);
        }

        return () => {
            document.removeEventListener('mouseup', handleGlobalMouseUp);
            document.removeEventListener('mousemove', handleGlobalMouseMove);
        };
    }, [isDragging, isZoomEnabled, lastMousePosition]);

    return (
        <>
            {/* Versión Mobile */}
            <div className="md:hidden bg-gray-50 min-h-screen">
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
                <div className="p-4 pb-24">
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
                                    index === self.findIndex((img) => img?.url === image?.url)
                                )
                                .map((img, i) => (
                                    <SwiperSlide key={i}>
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                            <img
                                                src={`/storage/images/item/${img?.url || img}`}
                                                className="w-full h-full object-cover aspect-square"
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
                                <div className="text-xs customtext-neutral-light mt-1">SKU: {item?.sku}</div>
                            </div>
                            <div className="bg-secondary customtext-primary px-3 py-1 rounded-full text-sm">
                                {Number(item?.discount_percent).toFixed(0)}% OFF
                            </div>
                        </div>
                    </div>

                    {/* Selector Cantidad */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Cantidad</span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-8 h-8 rounded-full bg-secondary customtext-primary flex items-center justify-center"
                                >
                                    -
                                </button>
                                <span className="w-8 text-center font-medium">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                                    className="w-8 h-8 rounded-full bg-secondary customtext-primary flex items-center justify-center"
                                >
                                    +
                                </button>
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

                    {/* Entrega y Soporte */}
                      {/* Delivery Options - Mejoradas */}
                            <div className="border rounded-lg overflow-hidden flex flex-col mt-8 justify-center">
                                <button
                                    onClick={() => setDeliveryPolicyModalOpen(true)}
                                    className="w-full p-6 hover:bg-gray-50 transition-colors duration-200 flex items-center  gap-4"
                                >
                                    <div className=" flex gap-2 items-center">
                                        <div className="bg-secondary min-w-12 min-h-12 rounded-full mx-auto mb-2 flex items-center justify-center">
                                            <Truck className="w-8 h-8 customtext-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm customtext-neutral-dark">Envío a domicilio</p>
                                            <p className="text-start text-xs customtext-neutral-light mt-1" style={{textDecoration:'underline', textDecorationStyle:'dashed', textUnderlineOffset:'2px'}}>Consultar </p>
                                        </div>
                                    </div>

                                </button>

                                {/* Support - Mejorado */}
                                <motion.div

                                   className="w-full p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200 flex items-center  gap-4"
                                >
                                    <motion.div
                                        className=" flex flex-row rounded-xl gap-3"
                                      
                                    >

                                        <div className="bg-secondary min-w-12 max-w-12 min-h-12 max-h-12 flex items-center justify-center rounded-full flex-shrink-0">
                                            <svg
                                                className="w-8 h-8 customtext-primary"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.531 3.488" />
                                            </svg>
                                        </div>
                                        <div className="font-semibold text-sm customtext-neutral-dark cursor-pointer">
                                            <p>
                                                ¿Tienes dudas?
                                                Haz{" "}
                                                <a
                                                    className="underline"
                                                    onClick={handleClickWhatsApp}
                                                >
                                                    clic aquí
                                                </a>{" "}
                                                y chatea con nosotros
                                            </p>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </div>
                </div>

                {/* Bottom Navigation */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-[99]">
                    <div className="p-4 flex gap-4">
                        <button onClick={() => { onAddClicked(item); window.location.href = "/cart" }} className="flex-1 bg-primary text-white py-3 rounded-xl font-medium active:scale-95 transition-transform">
                            Comprar ahora
                        </button>
                        <button
                            onClick={() => onAddClicked(item)}
                            className="flex-1 bg-gray-100 customtext-primary py-3 rounded-xl font-medium border border-primary active:scale-95 transition-transform"
                        >
                            Añadir al carrito
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop View */}
            <div className="px-primary mx-auto py-12 bg-[#F7F9FB] hidden md:block ">
                <div className="bg-white rounded-xl p-4 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column - Images and Delivery Options */}
                        <div className="space-y-6">
                            <div className="mb-6 md:hidden">
                                <p className="customtext-neutral-light text-sm">
                                    Marca:{" "}
                                    <span className="customtext-neutral-dark">
                                        {item?.brand.name}
                                    </span>
                                </p>
                                <h1 className="customtext-neutral-dark text-[28px] md:text-[40px] font-bold mt-2">
                                    {item?.name}
                                </h1>
                            </div>

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
                                        className={`w-16 h-16  rounded-lg p-1 border-2 ${selectedImage.url === item?.image
                                            ? "border-primary "
                                            : "border-gray-200"
                                            }`}
                                    >
                                        <img
                                            src={`/storage/images/item/${item?.image}`}
                                            alt="Main Thumbnail"
                                            className="w-full h-full object-cover rounded-lg aspect-square"
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
                                                    url: image?.url,
                                                    type: "gallery",
                                                })
                                            }
                                            className={`w-16 h-16 border-2 rounded-lg p-1 ${selectedImage.url === image.url
                                                ? "border-primary"
                                                : "border-gray-200"
                                                }`}
                                        >
                                            <img
                                                src={`/storage/images/item/${image?.url}`}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="w-full h-full object-cover rounded-lg aspect-square"
                                                onError={(e) =>
                                                (e.target.src =
                                                    "/api/cover/thumbnail/null")
                                                }
                                            />
                                        </button>
                                    ))}
                                </div>

                                {/* Main Image */}
                                <div className="flex-1 relative group">
                                    {/* Zoom Icon */}
                                    <button
                                        onClick={handleZoomClick}
                                        className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-lg transition-all duration-200 ${
                                            isZoomEnabled 
                                                ? 'bg-primary text-white opacity-100' 
                                                : 'bg-white/90 hover:bg-white text-gray-700 hover:text-primary group-hover:opacity-100 opacity-60'
                                        }`}
                                        title={isZoomEnabled ? "Desactivar zoom" : "Activar zoom"}
                                    >
                                        <ZoomIn className="w-5 h-5" />
                                    </button>

                                    <div
                                        className={`relative overflow-hidden rounded-lg select-none ${
                                            isZoomEnabled 
                                                ? isDragging 
                                                    ? 'cursor-grabbing' 
                                                    : 'cursor-grab'
                                                : 'cursor-pointer'
                                        }`}
                                        onMouseMove={handleMouseMove}
                                        onMouseDown={handleMouseDown}
                                        onMouseUp={handleMouseUp}
                                        onMouseLeave={handleMouseLeave}
                                        onClick={() => !isZoomEnabled && handleZoomClick()}
                                        style={{
                                            height: 'auto',
                                            position: 'relative'
                                        }}
                                    >
                                        <img
                                            ref={imageRef}
                                            src={
                                                selectedImage.type === "main"
                                                    ? `/storage/images/item/${selectedImage?.url}`
                                                    : `/storage/images/item/${selectedImage?.url}`
                                            }
                                            onError={(e) =>
                                            (e.target.src =
                                                "/api/cover/thumbnail/null")
                                            }
                                            alt="Product main"
                                            className="w-full rounded-lg object-cover aspect-square"
                                            style={{
                                                ...(isZoomEnabled
                                                    ? {
                                                          transform: `scale(2.5)`,
                                                          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                                          transition: isDragging 
                                                              ? 'none' 
                                                              : 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform-origin 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                      }
                                                    : {
                                                          transform: 'scale(1)',
                                                          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                                      }),
                                                userSelect: 'none',
                                                pointerEvents: 'auto'
                                            }}
                                            draggable={false}
                                        />
                                        
                                        {/* Overlay visual para indicar que se puede hacer zoom */}
                                        {!isZoomEnabled && (
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-lg flex items-center justify-center">
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/75 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                                                     Click para activar zoom
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Indicador cuando el zoom está activo */}
                                        {isZoomEnabled && (
                                            <div className="absolute bottom-3 left-3 bg-primary text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg border border-white/20">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                    <span>
                                                        {isDragging ? 'Arrastrando vista...' : 'Mantén presionado y arrastra'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Indicador de posición con mini-mapa */}
                                        {isZoomEnabled && (
                                            <div className="absolute top-4 left-4 bg-black/20 text-white p-2 rounded-lg shadow-lg">
                                                <div className="flex flex-col items-center gap-2">
                                                    {/* Mini mapa */}
                                                    <div className="relative w-12 h-12 bg-white/20 border border-white/40 rounded">
                                                        <div 
                                                            className="absolute w-3 h-3 bg-primary border border-white rounded-sm shadow-sm transition-all duration-200"
                                                            style={{
                                                                left: `${(zoomPosition.x / 100) * (48 - 12)}px`,
                                                                top: `${(zoomPosition.y / 100) * (48 - 12)}px`,
                                                            }}
                                                        />
                                                    </div>
                                                    
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex lg:hidden flex-col customtext-neutral-light justify-start items-start gap-2 text-sm mb-6">
                                <span className="customtext-neutral-light text-sm">
                                    SKU:{" "}
                                    <span className="customtext-neutral-dark">
                                        {item?.sku}
                                    </span>
                                </span>
                                <span className="ustomtext-neutral-light text-sm">
                                    Disponibilidad:{" "}
                                    <span className="customtext-neutral-dark">
                                        {item?.stock > 0
                                            ? "En stock"
                                            : "Agotado"}
                                    </span>
                                </span>
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
                                        <div className="flex flex-col gap-3">
                                            <span className="customtext-neutral-dark text-sm font-medium">
                                                Cantidad
                                            </span>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                                                    <button
                                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 customtext-neutral-dark font-semibold text-lg"
                                                        disabled={quantity <= 1}
                                                    >
                                                        −
                                                    </button>
                                                    <div className="w-12 h-10 flex items-center justify-center border-x border-gray-300 bg-gray-50">
                                                        <span className="customtext-neutral-dark font-medium text-sm">
                                                            {quantity}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => setQuantity(Math.min(10, quantity + 1))}
                                                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 customtext-neutral-dark font-semibold text-lg"
                                                        disabled={quantity >= 10}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <span className="customtext-neutral-light text-xs">
                                                    Máximo 10 unidades
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Add to Cart */}
                                    <button
                                        onClick={() => {
                                            onAddClicked(item);
                                            setModalOpen(!modalOpen);
                                        }}
                                        className="w-full bg-primary text-white py-3 font-bold shadow-lg rounded-xl hover:opacity-90 transition-all duration-300 mt-4"
                                    >
                                        Agregar al carrito
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

                            <div className="block lg:hidden mt-8 ">
                                <div className="flex items-center gap-2 mb-6">
                                    <ShoppingCart className="w-6 h-6 customtext-primary" />
                                    <h2 className="text-base font-semibold">
                                        Completa tu compra con estos productos
                                    </h2>
                                </div>

                                <div className=" flex gap-4">
                                    <div className="w-2/3 flex gap-2">
                                        {associatedItems.map(
                                            (product, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2"
                                                >
                                                    <img
                                                        src={`/storage/images/item/${product.image}`}
                                                        className=" rounded-lg aspect-square w-24 h-24 object-cover bg-[#F7F9FB]"
                                                        onError={(e) =>
                                                        (e.target.src =
                                                            "/api/cover/thumbnail/null")
                                                        }
                                                    />
                                                    {index <
                                                        associatedItems.length -
                                                        1 && (
                                                            <span className="text-2xl font-bold">
                                                                <Plus />
                                                            </span>
                                                        )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>

                                {associatedItems.map((product, index) => (
                                    <div
                                        key={index}
                                        className="flex mt-4 gap-4 p-4 border rounded-lg items-center"
                                    >
                                        <CheckSquare className="w-5 h-5 customtext-primary" />
                                        <div className="flex-1 font-semibold">
                                            <span className="text-[10px] customtext-neutral-dark block">
                                                {product.brand.name}
                                            </span>
                                            <p className="text-sm customtext-neutral-light font-medium">
                                                {product.name}
                                            </p>
                                        </div>
                                        <p className="font-bold customtext-neutral-dark">
                                            S/{" "}
                                            {parseFloat(
                                                product.final_price
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                ))}

                                <div className=" w-full flex flex-col justify-start items-start bg-gray-50 p-4 rounded-lg mt-4">
                                    <span className="text-xs font-semibold customtext-neutral-light">
                                        Total
                                    </span>

                                    <p className="font-bold mb-2 customtext-neutral-dark">
                                        S/ {total.toFixed(2)}
                                    </p>
                                    <button
                                        onClick={() => addAssociatedItems()}
                                        className="bg-primary text-xs font-semibold text-white w-max py-3 px-6 rounded-xl hover:opacity-90 transition-all duration-300 hover:shadow-md"
                                    >
                                        Agregar al carrito
                                    </button>
                                </div>
                            </div>
                            {/* Delivery Options - Mejoradas */}
                            <div className="border rounded-lg overflow-hidden flex justify-center">
                                <button
                                    onClick={() => setDeliveryPolicyModalOpen(true)}
                                    className="w-full p-6 hover:bg-gray-50 transition-colors duration-200 flex items-center  gap-4"
                                >
                                    <div className=" flex gap-2 items-center">
                                        <div className="bg-secondary min-w-12 min-h-12 rounded-full mx-auto mb-2 flex items-center justify-center">
                                            <Truck className="w-8 h-8 customtext-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm customtext-neutral-dark">Envío a domicilio</p>
                                            <p className="text-start text-xs customtext-neutral-light mt-1" style={{textDecoration:'underline', textDecorationStyle:'dashed', textUnderlineOffset:'2px'}}>Consultar </p>
                                        </div>
                                    </div>

                                </button>

                                {/* Support - Mejorado */}
                                <motion.div

                                   className="w-full p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200 flex items-center  gap-4"
                                >
                                    <motion.div
                                        className=" flex flex-row rounded-xl gap-3"
                                      
                                    >

                                        <div className="bg-secondary min-w-12 max-w-12 min-h-12 max-h-12 flex items-center justify-center rounded-full flex-shrink-0">
                                            <svg
                                                className="w-8 h-8 customtext-primary"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.531 3.488" />
                                            </svg>
                                        </div>
                                        <div className="font-semibold text-sm customtext-neutral-dark cursor-pointer">
                                            <p>
                                                ¿Tienes dudas?
                                                Haz{" "}
                                                <a
                                                    className="underline"
                                                    onClick={handleClickWhatsApp}
                                                >
                                                    clic aquí
                                                </a>{" "}
                                                y chatea con nosotros
                                            </p>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </div>


                        </div>

                        {/* Right Column - Product Info */}
                        <div className="hidden md:block">
                            {/* Brand and Title */}
                            <div className="mb-6">
                                <p className="customtext-neutral-light text-sm">
                                    Marca:{" "}
                                    <span className="customtext-neutral-dark">
                                        {item?.brand.name}
                                    </span>
                                </p>
                                <h1 className="customtext-neutral-dark text-[40px] font-bold mt-2">
                                    {item?.name}
                                </h1>
                            </div>

                            {/* SKU and Availability */}
                            <div className="flex customtext-neutral-light items-center gap-8 text-sm mb-6">
                                <span className="customtext-neutral-light text-sm">
                                    SKU:{" "}
                                    <span className="customtext-neutral-dark">
                                        {item?.sku}
                                    </span>
                                </span>
                                <span className="ustomtext-neutral-light text-sm">
                                    Disponibilidad:{" "}
                                    <span className="customtext-neutral-dark">
                                        {item?.stock > 0
                                            ? "En stock"
                                            : "Agotado"}
                                    </span>
                                </span>
                            </div>
                            <div className="flex gap-8 border-b-2 pb-8">
                                {/* Specifications */}
                                <div className="flex-1 w-7/12 ">
                                    <div className="bg-[#F7F9FB] rounded-lg p-6">
                                        <h3 className="font-medium text-sm mb-4">
                                            Especificaciones principales
                                        </h3>
                                        <ul
                                            className={`space-y-2  customtext-neutral-light mb-4 transition-all duration-300 ${expandedSpecificationMain
                                                ? "max-h-full"
                                                : "max-h-28 overflow-hidden"
                                                }`}
                                            style={{ listStyleType: "disc" }}
                                        >
                                            {item?.specifications.map(
                                                (spec, index) =>
                                                    spec.type ===
                                                    "principal" && (
                                                        <li
                                                            key={index}
                                                            className="flex gap-2 items-start"
                                                        >
                                                            <CircleCheckIcon className="customtext-primary min-w-5 min-h-5 max-w-5 max-h-5 mt-1" />
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

                                {/* Price Section */}
                                <div className=" w-5/12 ">
                                    <p className="text-sm customtext-neutral-light mb-1">
                                        Precio:{" "}
                                        <span className="line-through">
                                            S/ {item?.price}
                                        </span>
                                    </p>
                                    <div className="flex items-center gap-4 relative ">
                                        <span className="text-[36px] font-bold ">
                                            S/ {item?.final_price}
                                        </span>
                                        <span className=" absolute text-sm -top-8 right-0 bg-[#F93232] text-white font-bold px-3 py-2 rounded-xl">
                                            -
                                            {Number(
                                                item?.discount_percent
                                            ).toFixed(1)}
                                            %
                                        </span>
                                    </div>

                                    {/* Quantity */}
                                    <div className="mt-4">
                                        <div className="flex flex-col gap-3">
                                            <span className="customtext-neutral-dark text-sm font-medium">
                                                Cantidad
                                            </span>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                                                    <button
                                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 customtext-neutral-dark font-semibold text-lg"
                                                        disabled={quantity <= 1}
                                                    >
                                                        −
                                                    </button>
                                                    <div className="w-12 h-10 flex items-center justify-center border-x border-gray-300 bg-gray-50">
                                                        <span className="customtext-neutral-dark font-medium text-sm">
                                                            {quantity}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => setQuantity(Math.min(10, quantity + 1))}
                                                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 customtext-neutral-dark font-semibold text-lg"
                                                        disabled={quantity >= 10}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <span className="customtext-neutral-light text-xs">
                                                    Máximo 10 unidades
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Add to Cart */}
                                    <button
                                        onClick={() => {
                                            onAddClicked(item);
                                            setModalOpen(!modalOpen);
                                        }}
                                        className="w-full bg-primary text-white py-3 font-bold shadow-lg rounded-xl hover:opacity-90 transition-all duration-300 mt-4"
                                    >
                                        Agregar al carrito
                                    </button>
                                </div>
                            </div>

                            {/* Complementary Products */}
                            {associatedItems && associatedItems.length > 0 && (
                                <div className="mt-8 ">
                                    <div className="flex items-center gap-2 mb-6">
                                        <ShoppingCart className="w-6 h-6 customtext-primary" />
                                        <h2 className="text-base font-semibold">
                                            Completa tu compra con estos
                                            productos
                                        </h2>
                                    </div>

                                    <div className=" flex gap-4">
                                        <div className="w-2/3 flex gap-2">
                                            {associatedItems.map(
                                                (product, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <img
                                                            src={`/storage/images/item/${product.image}`}
                                                            className=" rounded-lg aspect-square w-24 h-24 object-cover bg-[#F7F9FB]"
                                                            onError={(e) =>
                                                            (e.target.src =
                                                                "/api/cover/thumbnail/null")
                                                            }
                                                        />
                                                        {index <
                                                            associatedItems.length -
                                                            1 && (
                                                                <span className="text-2xl font-bold">
                                                                    <Plus />
                                                                </span>
                                                            )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                        <div className=" w-1/3 flex flex-col justify-between items-end bg-gray-50 p-4 rounded-lg mt-4">
                                            <span className="text-xs font-semibold customtext-neutral-light">
                                                Total
                                            </span>

                                            <p className="font-bold mb-2 customtext-neutral-dark">
                                                S/ {total.toFixed(2)}
                                            </p>
                                            <button
                                                onClick={() =>
                                                    addAssociatedItems()
                                                }
                                                className="bg-primary text-xs font-semibold text-white w-full py-3 rounded-xl hover:opacity-90 transition-all duration-300 hover:shadow-md"
                                            >
                                                Agregar al carrito
                                            </button>
                                        </div>
                                    </div>

                                    {associatedItems.map((product, index) => (
                                        <div
                                            key={index}
                                            className="flex mt-4 gap-4 p-4 border rounded-lg items-center"
                                        >
                                            <CheckSquare className="w-5 h-5 customtext-primary" />
                                            <div className="flex-1 font-semibold">
                                                <span className="text-[10px] customtext-neutral-dark block">
                                                    {product.brand.name}
                                                </span>
                                                <p className="text-sm customtext-neutral-light font-medium">
                                                    {product.name}
                                                </p>
                                            </div>
                                            <p className="font-bold customtext-neutral-dark">
                                                S/{" "}
                                                {parseFloat(
                                                    product.final_price
                                                ).toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className=" grid gap-32 md:grid-cols-2 bg-white rounded-xl p-8 mt-12">
                    {/* Specifications Section */}
                    <div>
                        <h2 className="text-2xl font-bold customtext-neutral-dark mb-4 border-b pb-4">
                            Especificaciones
                        </h2>
                        <div
                            ref={specificationsRef}
                            className={`space-y-1 transition-all duration-300 ${!isSpecificationsExpanded
                                ? "max-h-[400px] overflow-hidden"
                                : ""
                                }`}
                        >
                            {item?.specifications.map(
                                (spec, index) =>
                                    spec.type === "general" && (
                                        <div
                                            key={index}
                                            className={`grid grid-cols-2 gap-4 px-4 py-1 ${index % 2 === 0
                                                ? "bg-[#F7F9FB]"
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
                        {needsSpecificationsExpand && (
                            <button
                                className="border-2 border-primary w-max px-5 py-3 my-8 rounded-xl flex items-center gap-2 customtext-primary font-semibold cursor-pointer hover:bg-primary hover:text-white transition-all duration-300"
                                onClick={() => setIsSpecificationsExpanded(!isSpecificationsExpanded)}
                            >
                                {isSpecificationsExpanded ? "Ver menos" : "Ver más especificaciones"}
                                <ChevronDown
                                    className={`transform transition-transform ${isSpecificationsExpanded ? "rotate-180" : ""
                                        }`}
                                />
                            </button>
                        )}
                    </div>

                    {/* Additional Information Section */}
                    <div>
                        <h2 className="text-2xl font-bold customtext-neutral-dark mb-4 border-b pb-4">
                            Información adicional
                        </h2>
                        <div
                            ref={descriptionRef}
                            className={`space-y-2 transition-all duration-300 ${!isExpanded
                                ? "max-h-[400px] overflow-hidden"
                                : ""
                                }`}
                        >
                            <h3 className="text-xl font-semibold customtext-neutral-dark mb-4">
                                Acerca de este artículo
                            </h3>
                            <div
                                className="customtext-neutral-dark prose prose-base"
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
                        {needsDescriptionExpand && (
                            <button
                                className="border-2 border-primary w-max px-5 py-3 my-8 rounded-xl flex items-center gap-2 customtext-primary font-semibold cursor-pointer hover:bg-primary hover:text-white transition-all duration-300"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {isExpanded ? "Ver menos" : "Ver más"}
                                <ChevronDown
                                    className={`transform transition-transform ${isExpanded ? "rotate-180" : ""
                                        }`}
                                />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {relationsItems.length > 0 && (
                <ProductInfinite
                    data={{ title: "Productos relacionados" }}
                    items={relationsItems}
                    cart={cart}
                    setCart={setCart}
                />)}

            {/* Modal de Políticas de Envío */}
            {deliveryPolicyModalOpen && (
                   <ReactModal
                        
                        isOpen={deliveryPolicyModalOpen}
                          onRequestClose={() => setDeliveryPolicyModalOpen(false)}
                        contentLabel={"Políticas de Envío"}
                        className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center p-4 z-50"
                        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-[999]"
                        ariaHideApp={false}
                    >
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-900 pr-4">Políticas de Envío</h2>
                                <button
                                    onClick={() => setDeliveryPolicyModalOpen(false)}
                                    className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 hover:bg-gray-100 rounded-full"
                                    aria-label="Cerrar modal"
                                >
                                    <X size={24} strokeWidth={2} />
                                </button>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="prose prose-gray max-w-none">
                                    <HtmlContent html={generals?.find(g => g.correlative === 'delivery_policy')?.description} />
                                </div>
                            </div>
                            
                            {/* Footer */}
                            <div className="flex justify-end p-6 border-t border-gray-200">
                                <button
                                    onClick={() => setDeliveryPolicyModalOpen(false)}
                                    className="px-6 py-2 bg-primary text-white rounded-lg  transition-colors duration-200 font-medium"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </ReactModal>

          
            )}

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
export default ProductDetail;