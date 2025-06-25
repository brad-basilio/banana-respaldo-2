import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    DotIcon,
    Brush,
    Heart,
} from "lucide-react";

import ItemsRest from "../../../Actions/ItemsRest";
import Swal from "sweetalert2";
import { Notify } from "sode-extend-react";
import ProductInfinite from "../Products/ProductInfinite";
import CartModal from "../Components/CartModal";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import ProductNavigation from "../Products/ProductNavigation";
import ProductBananaLab from "../Products/ProductBananaLab";
import { set } from "lodash";

export default function ProductDetailBananaLab({session, item, data, setCart, cart, setFavorites, favorites }) {
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

    const [isExpanded, setIsExpanded] = useState(false);
    const [associatedItems, setAssociatedItems] = useState([]);
    const [relationsItems, setRelationsItems] = useState([]);
    const [variationsItems, setVariationsItems] = useState([]);
    const inCart = cart?.find((x) => x.id == item?.id);

    useEffect(() => {
        if (item?.id) {
            productosRelacionados(item);
            obtenerCombo(item);
            handleViewUpdate(item);
            handleVariations(item);
        }
    }, [item]);

    // Animaciones
    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } }
    };

    const slideUp = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const handleViewUpdate = async (item) => {
        try {
            const request = {
                id: item?.id,
            };
            const response = await itemsRest.updateViews(request);
            if (!response) {
                return;
            }
        } catch (error) {
            return;
        }
    };

    const obtenerCombo = async (item) => {
        try {
            const request = {
                id: item?.id,
            };
            const response = await itemsRest.verifyCombo(request);
            if (!response) {
                return;
            }
            const associated = response[0].associated_items;
            setAssociatedItems(Object.values(associated));
        } catch (error) {
            return;
        }
    };

    const productosRelacionados = async (item) => {
        try {
            const request = {
                id: item?.id,
            };
            const response = await itemsRest.productsRelations(request);
            if (!response) {
                return;
            }
            const relations = response;
            setRelationsItems(Object.values(relations));
        } catch (error) {
            return;
        }
    };

    const handleVariations = async (item) => {
        try {
            const request = {
                slug: item?.slug,
            };
            const response = await itemsRest.getVariations(request);
            if (!response) {
                return;
            }
            const variations = response;
            setVariationsItems(variations.variants);
        } catch (error) {
            return;
        }
    };

    const total = associatedItems.reduce(
        (sum, product) => sum + parseFloat(product.final_price),
        0
    );

    const addAssociatedItems = () => {
        setCart((prevCart) => {
            const newCart = structuredClone(prevCart);
            [...associatedItems, item].forEach((product) => {
                const index = newCart.findIndex((x) => x.id === product.id);
                if (index === -1) {
                    newCart.push({ ...product, quantity: quantity });
                } else {
                    newCart[index].quantity++;
                }
            });
            return newCart;
        });
        Notify.add({
            icon: "/assets/img/icon.svg",
            title: "Carrito de Compras",
            body: "Se agregaron con éxito los productos",
        });
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

        Swal.fire({
            title: "Producto agregado",
            text: `Se agregó ${product.name} al carrito`,
            icon: "success",
            timer: 1500,
        });
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="px-primary mx-auto py-4 md:py-6 xl:py-8 bg-white font-paragraph"
        >
            <motion.div 
                variants={slideUp}
                className="bg-white rounded-xl p-4 md:p-8"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-20 2xl:gap-32">
                    {/* Left Column - Images and Delivery Options */}
                    <div className="space-y-6">
                        {/* Product Images */}
                        <motion.div 
                            variants={staggerContainer}
                            className="flex flex-col gap-6"
                        >
                            {/* Main Image */}
                            <motion.div 
                                variants={slideUp}
                                className="flex-1"
                            >
                                <motion.img
                                    src={
                                        selectedImage.type === "main"
                                            ? `/storage/images/item/${selectedImage.url}`
                                            : `/storage/images/item/${selectedImage.url}`
                                    }
                                    onError={(e) =>
                                        (e.target.src = "/api/cover/thumbnail/null")
                                    }
                                    alt="Product main"
                                    className="w-full h-auto object-contain"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                />
                            </motion.div>

                            {/* Thumbnails */}
                            <motion.div 
                                variants={slideUp}
                                className="flex flex-row gap-2"
                            >
                                <motion.button
                                    onClick={() =>
                                        setSelectedImage({
                                            url: item?.image,
                                            type: "main",
                                        })
                                    }
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`w-16 h-16 rounded-lg p-1 border-2 ${
                                        selectedImage.url === item?.image
                                            ? "border-primary "
                                            : "border-gray-200"
                                    }`}
                                >
                                    <img
                                        src={`/storage/images/item/${item?.image}`}
                                        alt="Main Thumbnail"
                                        className="w-full h-full object-cover"
                                        onError={(e) =>
                                            (e.target.src = "/api/cover/thumbnail/null")
                                        }
                                    />
                                </motion.button>
                                {item?.images.map((image, index) => (
                                    <motion.button
                                        key={index}
                                        onClick={() =>
                                            setSelectedImage({
                                                url: image.url,
                                                type: "gallery",
                                            })
                                        }
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`w-16 h-16 border-2 rounded-lg p-1 ${
                                            selectedImage.url === image.url
                                                ? "border-primary"
                                                : "border-gray-200"
                                        }`}
                                    >
                                        <img
                                            src={`/storage/images/item/${image.url}`||"/api/cover/thumbnail/null"}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) =>
                                                (e.target.src = "/api/cover/thumbnail/null")
                                            }
                                        />
                                    </motion.button>
                                ))}
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Right Column - Product Info */}
                    <motion.div 
                        variants={staggerContainer}
                        className="flex flex-col gap-2"
                    >
                        {/* Brand and Title */}
                        <motion.div 
                            variants={slideUp}
                            className="font-font-general"
                        >
                            {item?.brand && (
                                <p className="customtext-neutral-light text-sm 2xl:text-lg">
                                    Marca:{" "}
                                    <span className="customtext-neutral-dark">
                                        {item?.brand.name}
                                    </span>
                                </p>
                            )}
                            <motion.h1 
                                className="customtext-neutral-dark text-3xl lg:text-4xl 2xl:text-5xl font-bold mt-2"
                                whileHover={{ x: 5 }}
                            >
                                {item?.name}
                            </motion.h1>
                        </motion.div>

                        {/* SKU and Availability */}
                        <motion.div 
                            variants={slideUp}
                            className="flex flex-wrap customtext-neutral-light items-center gap-y-2 gap-x-8 text-sm font-font-general"
                        >
                            <span className="customtext-neutral-light text-sm 2xl:text-base">
                                SKU:{" "}
                                <span className="customtext-neutral-dark font-bold">
                                    {item?.sku}
                                </span>
                            </span>
                            <span className="customtext-neutral-light text-sm 2xl:text-base">
                                Disponibilidad:{" "}
                                <span className="customtext-neutral-dark font-bold">
                                    {item?.stock > 0 ? "En stock" : "Agotado"}
                                </span>
                            </span>
                        </motion.div>

                        {/* Price Section */}
                        <motion.div 
                            variants={slideUp}
                            className="flex flex-col w-full xl:w-1/2 !font-font-general max-w-xl mt-5"
                        >
                            <p className="text-sm 2xl:text-base customtext-neutral-light">
                                Precio:{" "}
                                <span className="line-through">
                                    S/ {item?.price}
                                </span>
                            </p>
                            <div className="flex flex-row items-center gap-4 relative">
                                <motion.span 
                                    className="text-[40px] font-bold customtext-neutral-dark"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    S/ {item?.final_price}
                                </motion.span>
                                <motion.span 
                                    className="bg-[#F93232] text-white font-bold px-3 py-2 rounded-xl text-base"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    -
                                    {Number(item?.discount_percent).toFixed(1)}
                                    %
                                </motion.span>
                            </div>
                        </motion.div>

                        {/* Selector de variantes */}
                        <motion.div 
                            variants={slideUp}
                            className="variants-selector flex flex-col gap-3"
                        >
                            <h3 className="w-full block opacity-85 customtext-neutral-dark text-sm 2xl:text-base">
                                Colores
                            </h3>

                            <div className="flex gap-3 items-center justify-start w-full flex-wrap">
                                {/* Variante actual (principal) */}
                                <Tippy content={item.color}>
                                    <motion.a
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={`variant-option rounded-full object-fit-cover ${
                                            !variationsItems.some(
                                                (v) => v.slug === item.slug
                                            )
                                                ? "active p-[2px] border-[1.5px] border-neutral-dark"
                                                : ""
                                        }`}
                                    >
                                        <img
                                            className="color-box rounded-full h-9 w-9 object-fit-cover"
                                            src={`/storage/images/item/${item.texture}`}
                                            onError={(e) =>
                                                (e.target.src = "/api/cover/thumbnail/null")
                                            }
                                        />
                                    </motion.a>
                                </Tippy>    
                                {/* Otras variantes */}
                                {variationsItems.map((variant) => (
                                    <Tippy content={variant.color} key={variant.slug}>
                                        <motion.a
                                            href={`/product/${variant.slug}`}
                                            className="variant-option rounded-full object-fit-cover"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <img
                                                className="color-box rounded-full h-9 w-9 object-fit-cover"
                                                src={`/storage/images/item/${variant.texture}`}
                                            />
                                        </motion.a>
                                    </Tippy>
                                ))}
                            </div>
                        </motion.div>

                        {/* Quantity */}
                        <motion.div 
                            variants={slideUp}
                            className="flex flex-col mt-8"
                        >
                            <div className="flex items-center gap-4 mb-2">
                                <div className="flex items-center space-x-4 customtext-neutral-light text-sm 2xl:text-base">
                                    <span className="opacity-85">
                                        Cantidad
                                    </span>
                                    <motion.div 
                                        className="relative flex items-center border rounded-md px-2 py-1"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={handleChange}
                                            min="1"
                                            max="10"
                                            className="w-10 py-1 customtext-neutral-dark text-center bg-transparent outline-none appearance-none"
                                        />
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Create and Edit Buttons */}
                        <motion.div 
                            variants={slideUp}
                            className="flex flex-col"
                        >
                            <motion.button
                                onClick={async () => {
                                    // Check if user is authenticated
                                    if (!session) {
                                        Swal.fire({
                                            icon: 'info',
                                            title: 'Inicia sesión',
                                            text: 'Necesitas iniciar sesión para usar el editor de diseño',
                                            confirmButtonText: 'Iniciar sesión',
                                            showCancelButton: true,
                                            cancelButtonText: 'Cancelar'
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                window.location.href = '/login';
                                            }
                                        });
                                    } else {
                                        // Validar que el item tenga canvas_preset_id
                                        if (!item.canvas_preset_id) {
                                            Swal.fire({
                                                icon: 'warning',
                                                title: 'Producto no compatible',
                                                text: 'Este producto no tiene editor de diseño disponible.'
                                            });
                                            return;
                                        }

                                        // Crear el álbum/proyecto antes de ir al editor
                                        try {
                                            Swal.fire({
                                                title: 'Creando proyecto...',
                                                text: 'Preparando tu editor personalizado',
                                                allowOutsideClick: false,
                                                didOpen: () => {
                                                    Swal.showLoading();
                                                }
                                            });

                                            // Verificar que el CSRF token existe
                                            const csrfToken = document.querySelector('meta[name="csrf-token"]');
                                            if (!csrfToken) {
                                                throw new Error('CSRF token no encontrado');
                                            }

                                            console.log('📦 Enviando datos:', {
                                                item_id: item.id,
                                                canvas_preset_id: item.canvas_preset_id,
                                                name: `Proyecto ${item.name}`
                                            });

                                            const response = await fetch('/api/canvas/create-project', {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Accept': 'application/json',
                                                    'X-CSRF-TOKEN': csrfToken.content,
                                                },
                                                credentials: 'same-origin',
                                                body: JSON.stringify({
                                                    item_id: item.id,
                                                    canvas_preset_id: item.canvas_preset_id,
                                                    name: `Proyecto ${item.name}`
                                                })
                                            });

                                            console.log('📡 Respuesta del servidor:', response.status, response.statusText);

                                            if (response.ok) {
                                                const project = await response.json();
                                                console.log('✅ Proyecto creado exitosamente:', project);
                                                Swal.close();
                                                
                                                // Redirigir al editor con el ID del proyecto
                                                window.location.href = `/canvas/editor?project=${project.id}`;
                                            } else {
                                                // Intentar obtener el mensaje de error del servidor
                                                let errorMessage = 'Error al crear el proyecto';
                                                try {
                                                    const errorData = await response.json();
                                                    errorMessage = errorData.error || errorData.message || errorMessage;
                                                    console.error('❌ Error del servidor:', errorData);
                                                } catch (e) {
                                                    console.error('❌ Error al parsear respuesta de error:', e);
                                                }
                                                
                                                throw new Error(`${errorMessage} (Código: ${response.status})`);
                                            }
                                        } catch (error) {
                                            console.error('❌ Error completo:', error);
                                            Swal.fire({
                                                icon: 'error',
                                                title: 'Error',
                                                text: error.message || 'No se pudo crear el proyecto. Inténtalo de nuevo.',
                                                footer: 'Si el problema persiste, contacta con soporte.'
                                            });
                                        }
                                    }
                                }}
                                className="w-full flex gap-4 items-center justify-center font-paragraph text-base 2xl:text-lg bg-primary text-white py-3 font-semibold rounded-3xl hover:opacity-90 transition-all duration-300 mt-3"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Crea y edita tu regalo
                                <Brush width={20} />
                            </motion.button>
                            <motion.button
                                onClick={() => {
                                    onAddClicked(item);
                                }}
                                className="w-full flex gap-4 items-center justify-center font-paragraph text-base 2xl:text-lg bg-white border-2 border-primary customtext-primary py-3 font-semibold rounded-3xl hover:opacity-90 transition-all duration-300 mt-3"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Lista de deseos
                                <Heart width={20} />
                            </motion.button>
                        </motion.div>

                        {/* Whatsapp */}
                        <motion.div 
                            variants={slideUp}
                            className="w-full mt-5"
                        >
                            <motion.div 
                                className="bg-[#F7F9FB] flex flex-row rounded-xl p-5 gap-3"
                                whileHover={{ y: -2 }}
                            >
                                <img
                                    src="/assets/img/salafabulosa/whatsapp.png"
                                    onError={(e) =>
                                        (e.target.src = "assets/img/noimage/no_imagen_circular.png")
                                    }
                                    className="w-12 h-12 object-contain"
                                    loading="lazy"
                                />
                                <div className="customtext-neutral-dark font-font-general text-base 2xl:text-xl font-semibold">
                                    <p>
                                        ¿Tienes dudas sobre este producto? Haz{" "}
                                        <span className="underline">
                                            clic aquí
                                        </span>{" "}
                                        y chatea con nosotros por WhatsApp
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            <motion.div 
                variants={slideUp}
                className="grid gap-10 lg:gap-20 md:grid-cols-2 bg-white rounded-xl p-4 sm:p-8 font-font-general"
            >
                {/* Specifications Section */}
                {item?.specifications?.length > 0 && (
                    <motion.div variants={slideUp}>
                        <h2 className="text-2xl font-bold customtext-neutral-dark mb-4 border-b pb-3">
                            Especificaciones
                        </h2>
                        <div className="space-y-1">
                            {item.specifications.map(
                                (spec, index) =>
                                    spec.type === "general" && (
                                        <motion.div
                                            key={index}
                                            className={`grid grid-cols-2 gap-4 p-3 ${
                                                index % 2 === 0
                                                    ? "bg-[#F7F9FB]"
                                                    : "bg-white"
                                            }`}
                                            whileHover={{ x: 5 }}
                                        >
                                            <div className="customtext-neutral-light opacity-85">
                                                {spec.title}
                                            </div>
                                            <div className="customtext-neutral-dark">
                                                {spec.description}
                                            </div>
                                        </motion.div>
                                    )
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Additional Information Section */}
                <motion.div variants={slideUp} className="font-font-general">
                    {item?.description?.replace(/<[^>]+>/g, '') && (
                        <h2 className="text-2xl font-bold customtext-neutral-dark mb-4 border-b pb-3">
                            Información adicional
                        </h2>
                    )}

                    <motion.div
                        className={`space-y-2 ${
                            !isExpanded ? "max-h-[400px] overflow-hidden" : ""
                        }`}
                    >
                        {item?.description?.replace(/<[^>]+>/g, '') && (
                            <>
                                <h3 className="text-xl font-semibold customtext-neutral-dark mb-4">
                                    Acerca de este artículo
                                </h3>
                                <motion.div
                                    className="customtext-neutral-dark"
                                    dangerouslySetInnerHTML={{
                                        __html: item?.description,
                                    }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                ></motion.div>
                            </>
                        )}
                        
                        {item?.features?.length > 0 && (
                            <motion.div 
                                className="pl-10"
                                variants={staggerContainer}
                            >
                                <ul className="list-disc pl-5 space-y-2">
                                    {item?.features.map((feature, index) => (
                                        <motion.li
                                            key={index}
                                            className="customtext-neutral-dark"
                                            variants={slideUp}
                                        >
                                            {feature.feature}
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Productos relacionados */}
            {relationsItems.length > 0 && (
                <motion.div 
                    className="my-10"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <ProductBananaLab
                        data={{ title: "Productos relacionados", link_catalog: "/catalogo" }}
                        items={relationsItems}
                        cart={cart}
                        setCart={setCart}
                        setFavorites={setFavorites}
                        favorites={favorites}
                    />      
                </motion.div>
            )}             
            
            <CartModal
                cart={cart}
                setCart={setCart}
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
            />
        </motion.div>
    );
}