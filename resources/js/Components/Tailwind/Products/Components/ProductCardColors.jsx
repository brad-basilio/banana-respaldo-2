import React from 'react';
import { PlusIcon, ShoppingCart } from 'lucide-react'; // Icono para la cesta
import Swal from 'sweetalert2';
import ItemsRest from "../../../../Actions/ItemsRest";
import { useEffect, useState } from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

const ProductCardColors = ({ product, setCart, cart }) => {

    const itemsRest = new ItemsRest();
    const [variationsItems, setVariationsItems] = useState(product.variants);
    
    const onAddClicked = (product) => {
        const newCart = structuredClone(cart)
        const index = newCart.findIndex(x => x.id == product.id)
        if (index == -1) {
            newCart.push({ ...product, quantity: 1 })
        } else {
            newCart[index].quantity++
        }
        setCart(newCart)

        Swal.fire({
            title: 'Producto agregado',
            text: `Se agregó ${product.name} al carrito`,
            icon: 'success',
            timer: 1500,
        })
    }

    const handleVariations = async (item) => {
        try {
            // Preparar la solicitud
            const request = {
                slug: item?.slug,
                limit: 999,
            };

            const response = await itemsRest.getVariations(request);

            if (!response) {
                setVariationsItems([]);
                return;
            }

            const variations = response;

            setVariationsItems(variations.variants);

        } catch (error) {
            setVariationsItems([]);
            return;
        }
    };


    useEffect(() => {
        // if (product?.id) {
        //     handleVariations(product);
        // }
    }, [product]);

    const inCart = cart?.find(x => x.id == product?.id)
    const finalPrice = product?.discount > 0 ? product?.discount : product?.price
    return (
        <div
            key={product.id}
            className={`group w-full transition-transform duration-300 hover:scale-105 flex-shrink-0 font-font-general customtext-primary cursor-pointer`}
        >
            <div
                className="bg-white p-0"

            >
                <a href={`/item/${product.slug}`}>
                    {/* Imagen del producto y etiqueta de descuento */}
                    <div className="relative">
                        {product.discount != null && !isNaN(product.discount) && (
                            <span className="absolute top-8 right-0 bg-[#F93232] text-white text-base font-bold px-2 py-1 rounded-l-full">
                                -{Math.abs(Number(100 - Number((product?.discount * 100 / product?.price)))).toFixed(0)}%
                            </span>
                        )}
                        <div className="aspect-square rounded-3xl overflow-hidden flex items-center justify-center  bg-secondary border bg-white">
                            <img
                                src={`/storage/images/item/${product.image}`}
                                onError={e => e.target.src = '/assets/img/noimage/no_img.jpg'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                loading='lazy'
                            />
                        </div>
                    </div>
                </a>
                {/* Información del producto */}
                <div className='py-4'>
                    <p className="text-sm sm:text-base font-normal mb-1">
                        {product.category.name}
                    </p>

                    <a href={`/item/${product.slug}`}>
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-2 line-clamp-2 leading-tight">
                            {product.name}
                        </h3>

                        <div className="hidden md:flex gap-2 sm:gap-3 items-center justify-start w-full flex-wrap py-2">

                            {variationsItems?.slice(0, 4).map((variant) => (
                                <Tippy content={variant.color} key={variant.slug}>
                                    <a
                                        href={`/item/${variant.slug}`}
                                        className="variant-option rounded-full border shadow-gray-500 object-fit-cover bg-[#F5F5F5]"
                                    >
                                        <img
                                            className="color-box rounded-full h-7 w-7 sm:h-9 sm:w-9 object-fit-cover"
                                            src={`/storage/images/item/${variant.texture || variant.image}`}
                                            alt={variant.color}
                                            onError={(e) =>
                                            (e.target.src =
                                                "/api/cover/thumbnail/null")
                                            }
                                        />
                                    </a>
                                </Tippy>
                            ))}

                            {variationsItems?.length > 4 && (
                                <Tippy content={`+${variationsItems.length - 4} colores más`}>
                                    <a
                                        key={product.slug}
                                        href={`/item/${product.slug}`}
                                        className="variant-option rounded-full border shadow-gray-500 object-fit-cover bg-[#310619] text-white text-xs font-extrabold"
                                    >
                                        <div className="color-box rounded-full h-7 w-7 sm:h-9 sm:w-9 flex flex-col justify-center items-center">
                                            +{variationsItems.length - 4}
                                        </div>
                                    </a>
                                </Tippy>
                            )}
                        </div>

                        <div className="flex md:hidden gap-2 sm:gap-3 items-center justify-start w-full flex-wrap py-2">

                            {variationsItems?.slice(0, 3).map((variant) => (
                                <Tippy content={variant.color} key={variant.slug}>
                                    <a
                                        href={`/item/${variant.slug}`}
                                        className="variant-option rounded-full border shadow-gray-500  object-fit-cover bg-[#F5F5F5]"
                                    >
                                        <img
                                            className="color-box rounded-full h-7 w-7 sm:h-9 sm:w-9 object-fit-cover"
                                            src={`/storage/images/item/${variant.texture || variant.image}`}
                                            alt={variant.color}
                                            onError={(e) =>
                                            (e.target.src =
                                                "/api/cover/thumbnail/null")
                                            }
                                        />
                                    </a>
                                </Tippy>
                            ))}

                            {variationsItems?.length > 3 && (
                                <Tippy content={`+${variationsItems.length - 3} colores más`}>
                                    <a
                                        key={product.slug}
                                        href={`/item/${product.slug}`}
                                        className="variant-option rounded-full border shadow-gray-500 object-fit-cover bg-[#310619] text-white text-xs font-extrabold"
                                    >
                                        <div className="color-box rounded-full h-7 w-7 sm:h-9 sm:w-9 flex flex-col justify-center items-center">
                                            +{variationsItems.length - 3}
                                        </div>
                                    </a>
                                </Tippy>
                            )}
                        </div>

                        {/* Precio */}
                        <div className="flex items-baseline gap-4 mt-4">
                            <span className="text-lg sm:text-xl md:text-2xl font-bold">
                                S/ {product.final_price}
                            </span>
                            {product.discount != null && !isNaN(product.discount) && (
                                <span className="text-xs sm:text-base font-bold line-through opacity-60">
                                    S/ {product.price}
                                </span>
                            )}
                        </div>
                    </a>
                </div>
            </div >

        </div >
    );
};

export default ProductCardColors;
