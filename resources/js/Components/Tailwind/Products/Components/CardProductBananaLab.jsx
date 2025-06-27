import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircleIcon, ChevronRightCircle, Heart, ShoppingCart } from "lucide-react";
import Swal from "sweetalert2";
import ItemsRest from "../../../../Actions/ItemsRest";
import CartModal from "../../Components/CartModal";
import { toast, Toaster } from "sonner";
import CartModalBananaLab from "../../Components/CartModalBananaLab";
import Tippy from "@tippyjs/react";

const CardProductBananaLab = ({
    data,
    product,
    widthClass = "lg:w-1/4",
    setCart,
    cart,
    setFavorites,
    favorites,
}) => {
    const itemsRest = new ItemsRest();
    const [modalOpen, setModalOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [variationsItems, setVariationsItems] = useState([]);
    const isFavorite = favorites.some((x) => x.id === product.id);

    // Mejorar lógica: por defecto "square"
    const styleOffer = data?.style_offer || "square";

    const onAddClicked = (e, product) => {
        e.preventDefault();
        e.stopPropagation();

        const newCart = structuredClone(cart);
        const index = newCart.findIndex((x) => x.id == product.id);

        if (index == -1) {
            newCart.push({ ...product, quantity: 1 });
        } else {
            newCart[index].quantity++;
        }

        setCart(newCart);

        toast.success("Producto agregado", {
            description: `${product.name} se ha añadido al carrito.`,
            icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
            duration: 3000,
            position: "bottom-center",
        });
    };

    const onAddFavoritesClicked = (e, product) => {
        e.preventDefault();
        e.stopPropagation();

        const newFavorites = structuredClone(favorites);
        const index = newFavorites.findIndex((x) => x.id == product.id);

        if (index == -1) {
            newFavorites.push({ ...product, quantity: 1 });
            toast.success("Producto agregado", {
                description: `${product.name} se ha añadido a los favoritos.`,
                icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
                duration: 3000,
                position: "bottom-center",
            });
        } else {
            newFavorites.splice(index, 1);
            toast.info("Producto removido", {
                description: `${product.name} se ha quitado de los favoritos.`,
                icon: <CheckCircleIcon className="h-5 w-5 text-blue-500" />,
                duration: 3000,
                position: "bottom-center",
            });
        }

        setFavorites(newFavorites);
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

    useEffect(() => {
        if (product?.id) {
            handleVariations(product);
        }
    }, [product]);

    return (
        <>
            <motion.a
                href={`/product/${product.slug}`}
                initial={{
                    scale: 1,
                  
                }}
                whileHover={{
                    scale: 1.02,
                   
                    transition: { duration: 0.3 },
                }}
              
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="bg-white rounded-md lg:p-4 h-full flex flex-col relative">
                    {/* Imagen del producto y etiqueta de descuento */}
                    <div className="relative">
                        {product.discount != null &&
                            !isNaN(product.discount) && (
                                styleOffer === "square" ? (
                                    <span className="absolute top-3 -right-1 lg:-right-2 bg-[#F93232] text-white text-xs font-bold px-2 py-2 shadow-md z-20">
                                        Oferta
                                    </span>
                                ) : (
                                    <span className="absolute top-2 right-2 bg-[#F93232] text-white text-base font-medium px-2 py-1 rounded-full z-20">
                                        -
                                        {Number(
                                            100 -
                                            Number(
                                                (product?.discount * 100) /
                                                product?.price
                                            )
                                        ).toFixed(0)}
                                        %
                                    </span>
                                )
                            )}
                        <motion.div
                            className="aspect-square overflow-hidden flex items-center justify-center"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                        >
                            <img
                                src={`/storage/images/item/${product.image}`}
                                onError={(e) =>
                                    (e.target.src = "/api/cover/thumbnail/null")
                                }
                                alt={product.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </motion.div>
                    </div>

                    {/* Información del producto */}
                    <div className="p-3 flex-grow flex flex-col">
                        <div className="flex gap-1">
                            {/* ...existing code... */}
                        </div>
                        <div className="flex justify-between items-start w-full mt-2">
                            <h3 className={` customtext-neutral-dark text-xs lg:text-[15px] leading-4 font-semibold mb-2 line-clamp-3 ${data?.support_favorite ? "w-11/12 lg:w-10/12" : "w-full"}`}>
                                {product.name}
                            </h3>
                            {data?.support_favorite &&
                                <button
                                    onClick={(e) =>
                                        onAddFavoritesClicked(e, product)
                                    }
                                    className="customtext-primary brightness-125 hover:brightness-100 hover:customtext-primary fill-primary transition-colors duration-200"
                                >
                                    {isFavorite ? (
                                        <Heart
                                            width={18}
                                            strokeWidth={3}
                                            fill="current"
                                        />
                                    ) : (
                                        <Heart width={18} strokeWidth={1.5} />
                                    )}
                                </button>}
                        </div>
                        {/* Precio */}
                        <div className="flex flex-col lg:flex-row lg:justify-between items-baseline mt-1">
                            <span className="customtext-neutral-dark text-[20px] md:text-2xl font-bold">
                                S/ {product.final_price}
                            </span>
                            {/* ...existing code... */}
                        </div>

                        <div className="mt-3 overflow-hidden block lg:hidden">
                            <a
                                href={`/product/${product.slug}`}
                               // onClick={(e) => onAddClicked(e, product)}
                                className="w-full text-[10px] font-light lg:font-normal flex items-center justify-center bg-primary text-white lg:text-sm py-2 lg:py-3 px-4 rounded-full shadow-md hover:bg-primary-dark transition-all duration-300"
                            >
                              <span className="mr-2">Ver detalle</span>
                                <ChevronRightCircle
                                    className="w-3 h-3 lg:w-4 lg:h-4"
                                    strokeWidth={2}
                                />
                            </a>
                        </div>
                        {/* Botón de acción - justo debajo del precio, solo visible en hover en desktop */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                                opacity: isHovered ? 1 : 0,
                                y: isHovered ? 0 : 10,
                                pointerEvents: isHovered ? 'auto' : 'none',
                            }}
                            transition={{ duration: 0.2 }}
                            className="hidden lg:flex items-center justify-center mt-3"
                        >
                            <a
                                //onClick={(e) => onAddClicked(e, product)}
                                href={`/product/${product.slug}`}
                                className="w-full text-[10px] font-light lg:font-normal flex items-center justify-center bg-primary text-white lg:text-sm py-2 lg:py-3 px-4 rounded-full shadow-md hover:bg-primary-dark transition-all duration-300"
                            >
                                <span className="mr-2">Ver detalle</span>
                                <ChevronRightCircle
                                    className="w-3 h-3 lg:w-4 lg:h-4"
                                    strokeWidth={2}
                                />
                            </a>
                        </motion.div>
                    </div>
                </div>
            </motion.a>
            <CartModalBananaLab
                data={data}
                cart={cart}
                setCart={setCart}
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
            />
        </>
    );
};

export default CardProductBananaLab;
