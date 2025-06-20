import React from 'react';
import { PlusIcon, ShoppingCart } from 'lucide-react'; // Icono para la cesta
import Swal from 'sweetalert2';
import ItemsRest from "../../../../Actions/ItemsRest";
import { useEffect, useState } from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import TextWithHighlight from '../../../../Utils/TextWithHighlight';
import html2string from '../../../../Utils/html2string';

const ProductCardFull = ({ product, setCart, cart }) => {

    const itemsRest = new ItemsRest();
    const [variationsItems, setVariationsItems] = useState([]);
    console.log(product);
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

    const inCart = cart?.find(x => x.id == product?.id)
    const finalPrice = product?.discount > 0 ? product?.discount : product?.price

    return (
        <div
            key={product.id}
            className={`flex flex-col lg:flex-row   w-full font-font-general customtext-primary`}
        >
            <div
                className="w-full lg:w-2/5 p-0 flex flex-col justify-end items-start"
            >
                <div className="relative">
                    <div className="w-full max-w-[450px] lg:max-w-none lg:min-w-[500px] 2xl:min-w-[700px] overflow-hidden flex items-center justify-center">
                        <img
                            src={`/storage/images/item/${product.banner}`}
                            onError={e => {
                                e.target.src = `/storage/images/item/${product.image}`;
                                e.target.onerror = () => {
                                    e.target.src = '/assets/img/noimage/no_img.jpg';
                                };
                            }}
                            alt={product.name}
                            className="w-full lg:min-w-[500px] 2xl:min-w-[700px] h-full object-cover object-left"
                            loading='lazy'
                        />
                    </div>
                    <div className='absolute bottom-[7%] left-1/2 -translate-x-1/2 flex flex-row items-center justify-center w-full'>
                        <a className='bg-accent text-base lg:text-lg customtext-neutral-light px-10 py-2.5 rounded-lg'>
                            Ver video Xlerator
                        </a>
                    </div>
                </div>
               
            </div >

            <div className="w-full lg:w-3/5 flex flex-col justify-center items-center px-[5%] lg:px-[10%] mx-auto py-10 md:py-12 2xl:py-14">
                <div className='flex flex-col gap-6'>
                    <h3 className="text-center text-3xl sm:text-4xl lg:text-[40px] 2xl:text-5xl font-medium tracking-normal customtext-neutral-dark leading-normal font-title">
                        {product?.name}
                    </h3>

                    <p className="text-lg 2xl:text-xl tracking-normal font-light font-title customtext-neutral-dark text-center">
                        {product?.summary ?? html2string(product?.description)}
                    </p>

                    <div className='grid grid-cols-2 gap-3 lg:gap-10'>
                       
                        {product?.specifications?.length > 0 && (
                            product.specifications.map(
                                (spec, index) =>
                                    spec.type === "icono" && (
                                        <div key={index} className="text-base 2xl:text-lg gap-2 customtext-primary flex flex-col items-center justify-center text-center">
                                            <div className='bg-[#FF7F00] rounded-full overflow-hidden'>
                                                <img
                                                    src={`/storage/images${spec.title}`}
                                                    alt={spec.description}
                                                    className="w-14 h-14 object-contain p-2" 
                                                    // onError={e => e.target.src = '/assets/img/noimage/no_img.jpg'}
                                                />
                                            </div>
                                            <h2>{spec.description}</h2>
                                            
                                        </div>
                                    )
                                )
                        )}
                    
                    </div>

                    <div className='flex flex-row items-center justify-center w-full'>
                        <a className='bg-secondary text-base lg:text-lg customtext-neutral-light px-10 py-2.5 rounded-lg'>
                            Solicitar cotizacion
                        </a>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ProductCardFull;
