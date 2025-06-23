import { useEffect, useState } from "react";
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
    
} from "lucide-react";

import ItemsRest from "../../../Actions/ItemsRest";
import Swal from "sweetalert2";
import { Notify } from "sode-extend-react";
import ProductInfinite from "../Products/ProductInfinite";
import CartModal from "../Components/CartModal";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import ProductNavigationSwiper from "../Products/ProductNavigationSwiper";
import em from "../../../Utils/em";
import ProductNavigationSwiperSimple from "../Products/ProductNavigationSwiperSimple";

export default function ProductDetailAko({ item, data, setCart, cart, textstatic, contacts}) {
    
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

    const getContact = (correlative) => {
        return (
            contacts.find((contacts) => contacts.correlative === correlative)
                ?.description || ""
        );
      };
    
    /*TEXTOS */
    const textProductRelation = textstatic.find(x => x.correlative == 'detailproduct-relation-title')?.title ?? '';
    
    /*ESPECIFICACIONES */
    const [isExpanded, setIsExpanded] = useState(false);

    // const onAddClicked = (product) => {
    //     const newCart = structuredClone(cart);
    //     const index = newCart.findIndex((x) => x.id == product.id);
    //     if (index == -1) {
    //         newCart.push({ ...product, quantity: quantity });
    //     } else {
    //         newCart[index].quantity++;
    //     }
    //     setCart(newCart);

    //     Swal.fire({
    //         title: "Producto agregado",
    //         text: `Se agregó ${product.name} al carrito`,
    //         icon: "success",
    //         timer: 1500,
    //     });
    // };
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
            showCancelButton: true,
            confirmButtonText: "Abrir mini carrito",
            cancelButtonText: "Seguir comprando",
            reverseButtons: true,
            timer: 5000,
        }).then((result) => {
            if (result.isConfirmed) {
                setModalOpen(!modalOpen);
                
            }
        });
    };

    

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
            
        } catch (error) {
            return;
            // Mostrar un mensaje de error al usuario si es necesario
        }
    };

    const handleVariations = async (item) => {
        try {
            // Preparar la solicitud
            const request = {
                slug: item?.slug,
            };
            
            // Llamar al backend para verificar el combo
            const response = await itemsRest.getVariations(request);

            // Verificar si la respuesta es válida
            if (!response) {
                return;
            }

            // Actualizar el estado con los productos asociados
            const variations = response;
            
            setVariationsItems(variations.variants);
            
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

    return (
        <>
            <div className="px-primary mx-auto pt-4 md:pt-6 xl:pt-8 bg-white">
                <div className="bg-white rounded-xl p-4 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-20 2xl:gap-32">
                        
                        {/* Left Column - Images and Delivery Options */}
                        <div className="space-y-6">
                            {/* Product Images */}
                            <div className="flex flex-col gap-6">

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

                                {/* Thumbnails */}
                                <div className="flex flex-row gap-2">
                                    <button
                                        onClick={() =>
                                            setSelectedImage({
                                                url: item?.image,
                                                type: "main",
                                            })
                                        }
                                        className={`w-16 h-16  rounded-lg p-1 border-2 ${
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
                                                (e.target.src =
                                                    "/api/cover/thumbnail/null")
                                            }
                                        />
                                    </button>
                                    {item?.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() =>
                                                setSelectedImage({
                                                    url: image.url,
                                                    type: "gallery",
                                                })
                                            }
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
                                                    (e.target.src =
                                                        "/api/cover/thumbnail/null")
                                                }
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Product Info */}
                        <div className="flex flex-col gap-2">
                            
                            {/* Brand and Title */}

                            <div className="font-title">
                                {/* {item?.brand && (
                                    <p className="customtext-neutral-dark text-sm 2xl:text-lg font-semibold">
                                        Marca:{" "}
                                        <span className="customtext-neutral-dark font-normal">
                                            {item?.brand.name}
                                        </span>
                                    </p>
                                )} */}
                                <h1 className="customtext-neutral-dark text-3xl lg:text-4xl 2xl:text-5xl font-semibold">
                                    {item?.name}
                                </h1>
                            </div>

                            {/* SKU and Availability */}

                            {/* <div className="flex flex-wrap customtext-neutral-light items-center gap-y-2  gap-x-8 text-sm font-font-general">
                                <span className="customtext-neutral-light text-sm 2xl:text-base">
                                    SKU:{" "}
                                    <span className="customtext-neutral-dark font-bold">
                                        {item?.sku}
                                    </span>
                                </span>
                                <span className="customtext-neutral-light text-sm 2xl:text-base">
                                    Disponibilidad:{" "}
                                    <span className="customtext-neutral-dark font-bold">
                                        {item?.stock > 0
                                            ? "En stock"
                                            : "Agotado"}
                                    </span>
                                </span>
                            </div> */}

                            {/* Descripcion corta */}

                            {item?.summary && (
                                <div className="flex flex-col customtext-neutral-dark font-title text-base 2xl:text-lg mt-1">
                                    <p>{item?.summary}</p>       
                                </div>
                            )}

                            <div className='grid grid-cols-1 gap-3 my-3'>
                                {item?.specifications?.length > 0 && ( 
                                    item.specifications.map(
                                        (spec, index) =>
                                            spec.type === "icono" && (
                                                <div key={index} className="text-base 2xl:text-lg gap-3 customtext-primary flex flex-row items-center justify-start text-left">
                                                    <div className='bg-[#0082CA] rounded-full overflow-hidden min-w-12'>
                                                        <img
                                                            src={`/storage/images${spec.title}`}
                                                            alt={spec.description}
                                                            className="w-12 h-12 object-contain p-2" 
                                                            onError={e => e.target.src = '/assets/img/noimage/noicon.png'}
                                                        />
                                                    </div>
                                                    <h2>{spec.description} </h2>
                                                </div>
                                            )
                                        )
                                    )}
                            </div>

                            {/* Price Section */}

                            <div className="flex flex-col w-full xl:w-1/2 font-title max-w-xl mt-3 gap-1">
                                    {item?.final_price < item?.price && item?.final_price > 0 ? (
                                        <>
                                            <p className="text-base 2xl:text-lg customtext-neutral-dark font-medium">
                                                Precio:{" "}
                                                <span className="line-through font-normal">
                                                    S/ {item?.price}
                                                </span>
                                            </p>
                                            <div className="flex flex-row items-center gap-4 relative">
                                                <span className="text-3xl md:text-4xl 2xl:text-5xl font-semibold customtext-neutral-dark">
                                                    S/ {item?.final_price}
                                                </span>
                                                <span className="bg-[#F93232] text-white font-semibold px-3 py-2 rounded-xl text-base">
                                                    -{Number(item?.discount_percent).toFixed(1)}%
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-3xl md:text-4xl 2xl:text-5xl font-semibold customtext-neutral-dark">
                                            S/ {item?.price}
                                        </span>
                                    )}
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4 md:gap-6">
                                    <a target="_blank" href={`https://api.whatsapp.com/send?phone=${getContact("phone_whatsapp")}&text=${encodeURIComponent(
                                        `Hola, deseo mayor información acerca del producto: ${item?.name}`
                                        )}`}
                                        className='bg-accent w-full text-base lg:text-lg customtext-neutral-light px-5 text-center py-2.5 rounded-lg'>
                                        Solicitar cotizacion
                                    </a>
                                
                                    <a className='bg-secondary w-full text-base lg:text-lg customtext-neutral-light px-5 text-center py-2.5 rounded-lg'>
                                        Descargar ficha técnica
                                    </a>
                            </div>

                            {/* {(variationsItems.length > 1) && (
                                <div className="variants-selector flex flex-col gap-3">
                                    <h3 className="w-full block opacity-85 customtext-neutral-dark text-sm 2xl:text-base">
                                        Colores
                                    </h3>

                                    <div className="flex gap-3 items-center justify-start w-full flex-wrap">
                                        Variante actual (principal)
                                        <Tippy content={item.color}>
                                            <a
                                                className={`variant-option rounded-full object-fit-cover  ${
                                                    !variationsItems.some(
                                                        (v) => v.slug === item.slug
                                                    )
                                                        ? "active p-[2px] border-[1.5px] border-neutral-dark"
                                                        : ""
                                                }`}
                                            >
                                                <img
                                                    className="color-box rounded-full h-9 w-9 object-fit-cover "
                                                    src={`/storage/images/item/${item.texture || item.image}`}
                                                    onError={(e) =>
                                                        (e.target.src =
                                                            "/api/cover/thumbnail/null")
                                                    }
                                                />
                                            </a>
                                        </Tippy>    
                                        Otras variantes

                                        {variationsItems.map((variant) => (
                                            <Tippy content={variant.color}>
                                            <a
                                                key={variant.slug}
                                                href={`/item/${variant.slug}`}
                                                className="variant-option  rounded-full object-fit-cover "
                                            >
                                                <img
                                                    className="color-box rounded-full h-9 w-9 object-fit-cover "
                                                    src={`/storage/images/item/${variant.texture || variant.image}`}
                                                />
                                            </a>
                                            </Tippy>
                                        ))}
                                    </div>
                                </div>
                            )} */}

                            {/* Quantity */}
                            
                            {/* <div className="flex flex-col mt-8">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="flex items-center space-x-4 customtext-neutral-light text-sm 2xl:text-base">
                                        <span className="opacity-85">
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
                                    </div>
                                </div>
                            </div> */}

                            {/* Add to Cart */}
                            
                            {/* <div className="flex flex-col">
                                <button
                                    onClick={() => {
                                        onAddClicked(item);
                                        setModalOpen(!modalOpen);
                                    }}
                                    className="w-full font-font-general text-base 2xl:text-lg bg-primary text-white py-3 font-semibold rounded-3xl hover:opacity-90 transition-all duration-300 mt-3"
                                >
                                    Agregar al carrito
                                </button>
                                <button className="w-full font-font-general text-base 2xl:text-lg customtext-neutral-dark border border-neutral-dark py-3 font-semibold rounded-3xl hover:opacity-90 transition-all duration-300 mt-4">
                                    Comprar
                                </button>
                            </div> */}


                            {/* Specifications */}

                            {/* {item?.specifications?.length > 0 && (
                                <div className="flex-1 w-full">
                                    <div className="bg-[#F7F9FB] rounded-xl p-6">
                                        <h3 className="font-semibold text-lg xl:text-xl 2xl:text-2xl mb-4 customtext-neutral-dark font-font-general">
                                            Especificaciones principales
                                        </h3>
                                        <ul
                                            className={`space-y-1  customtext-neutral-light  mb-4 list-disc transition-all duration-300 ${
                                                expandedSpecificationMain
                                                    ? "max-h-full"
                                                    : "max-h-20 overflow-hidden"
                                            }`}
                                            style={{ listStyleType: "disc" }}
                                        >
                                            {item?.specifications.map(
                                                (spec, index) =>
                                                    spec.type === "principal" && (
                                                        <li
                                                            key={index}
                                                            className="gap-2 customtext-primary opacity-85 flex flex-row items-center"
                                                        >   
                                                            <CircleCheckIcon className="customtext-primary w-4 h-4" />
                                                            {spec.description}
                                                        </li>
                                                    )
                                            )}
                                        </ul>
                                        <button
                                            className="font-semibold flex flex-row gap-2 items-center text-base xl:text-[17px] 2xl:text-xl mb-4 customtext-neutral-dark font-font-general pb-2 border-b border-neutral-dark"
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
                            )} */}

                        </div>
                    </div>
                </div>

                <div className="grid gap-10 lg:gap-20 md:grid-cols-2 bg-white rounded-xl p-4 sm:p-8 font-title">
                    
                    {/* Additional Information Section */}
                        <div className="font-title">
                            {item?.description?.replace(/<[^>]+>/g, '') && (
                                <h2 className="text-2xl font-semibold customtext-neutral-dark mb-4 border-secondary border-b pb-3">
                                    Información adicional
                                </h2>
                            )}

                            <div
                                className={`space-y-2 ${
                                    !isExpanded
                                        ? "max-h-none overflow-hidden"
                                        : ""
                                }`}
                            >
                                {item?.description?.replace(/<[^>]+>/g, '') && (
                                    <>
                                    <h3 className="text-xl font-semibold customtext-neutral-dark mb-4">
                                        Acerca de este artículo
                                    </h3>
                                    <div
                                        className="customtext-neutral-dark 2xl:text-lg"
                                        dangerouslySetInnerHTML={{
                                            __html: item?.description,
                                        }}
                                    ></div>
                                    </>
                                )}
                                
                                {item?.features?.length > 0 && (
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
                                )}
                                
                            </div>
                        </div>

                    {/* Specifications Section */}
                        {item?.specifications?.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold customtext-neutral-dark mb-4 border-b pb-3">
                                    Especificaciones
                                </h2>
                                <div className="space-y-1">
                                    {item.specifications.map(
                                        (spec, index) =>
                                            spec.type === "general" && (
                                                <div
                                                    key={index}
                                                    className={`grid grid-cols-2 gap-4 p-3 ${
                                                        index % 2 === 0
                                                            ? "bg-[#F7F9FB]"
                                                            : "bg-white"
                                                    }`}
                                                >
                                                    <div className="customtext-neutral-dark ">
                                                        {spec.title}
                                                    </div>
                                                    <div className="customtext-neutral-dark opacity-85">
                                                        {spec.description}
                                                    </div>
                                                </div>
                                            )
                                    )}
                                </div>
                            </div>
                        )}
                </div>
            </div>

            {/* Productos relacionados */}
            {relationsItems.length > 0 && (
                
                    <ProductNavigationSwiperSimple
                        data={{ title: "Productos %relacionados%"}}
                        items={relationsItems}
                        cart={cart}
                        setCart={setCart}
                    />      
                
            )}             
            
            <CartModal
                cart={cart}
                data={data}
                setCart={setCart}
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
            />
        </>
    );
}
