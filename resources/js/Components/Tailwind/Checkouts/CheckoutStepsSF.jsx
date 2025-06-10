import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CartStepSF from "./Components/CartStepSF";
import ShippingStepSF from "./Components/ShippingStepSF";
import ConfirmationStepSF from "./Components/ConfirmationStepSF";
import Global from "../../../Utils/Global";
import { Local } from "sode-extend-react";
import ProductNavigationSwiper from "../Products/ProductNavigationSwiper";

export default function CheckoutStepsSF({ cart, setCart, user, prefixes, ubigeos, items, contacts }) {
   
    const [currentStep, setCurrentStep] = useState(1);

    // Calcular el precio total incluyendo IGV
    const totalPrice = cart.reduce((acc, item) => {
        const finalPrice = item.final_price;
        return acc + finalPrice * item.quantity; // Sumar el precio total por cantidad
    }, 0);

    // Estado para el costo de envío
    const [envio, setEnvio] = useState(0);

    // Calcular el subtotal sin IGV (precio base)
    const subTotal = (totalPrice / 1.18);
    
    // Calcular el IGV (18% del subtotal)
    const igv = (subTotal * 0.18).toFixed(2);

    // Calcular el total final (subtotal sin IGV + IGV + envío)
    const totalFinal = (parseFloat(subTotal) + parseFloat(igv) + parseFloat(envio)).toFixed(2);
    
    const [sale, setSale] = useState([]);
    const [code, setCode] = useState([]);
    const [delivery, setDelivery] = useState([]);

    // useEffect(() => {
    //     const script = document.createElement("script");
    //     script.src = "https://checkout.culqi.com/js/v4";
    //     script.async = true;
    //     script.onload = () => {
    //         console.log("✅ Culqi cargado correctamente.");

    //         // 🔹 Definir culqi() en window para capturar el token
    //         window.culqi = function () {
    //             if (window.Culqi.token) {
    //                 console.log("✅ Token recibido:", window.Culqi.token.id);
    //                 // Aquí puedes enviar el token a tu backend
    //             } else if (window.Culqi.order) {
    //                 console.log("✅ Orden recibida:", window.Culqi.order);
    //             } else {
    //                 console.error("❌ Error en Culqi:", window.Culqi.error);
    //             }
    //         };
    //     };

    //     document.body.appendChild(script);

    //     return () => {
    //         document.body.removeChild(script);
    //     };

    //     return null;
    // }, []);

    // Efecto para detectar el código en la URL
    
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlCode = params.get("code");
        if (urlCode) {
            setCode(urlCode);
            setCurrentStep(3);
        }
    }, [window.location.search]);

    useEffect(() => {
        if (code) {
            Local.delete(`${Global.APP_CORRELATIVE}_cart`);
        }
    }, [code]);

    useEffect(() => {
        // Cargar script de MercadoPago
        const loadMercadoPagoScript = () => {
            const script = document.createElement("script");
            script.src = "https://sdk.mercadopago.com/js/v2";
            script.async = true;
            document.body.appendChild(script);
        };

        loadMercadoPagoScript();
    }, []);

    return (
        <div className="min-h-screen bg-white pt-6 px-primary lg:-mb-10">
            <div className="bg-white pt-8 sm:p-8 rounded-xl">
                {/* Steps indicator */}
                <div
                    className={`mb-4 xl:mb-8 grid lg:grid-cols-5 !font-font-general ${
                        currentStep === 3 ? "mx-auto max-w-3xl" : ""
                    } `}
                >
                    <div className={`flex items-center justify-between  mx-1 gap-2 lg:mx-5 ${ currentStep === 3 ? "lg:col-span-5" : "lg:col-span-3" }  text-center`}>
                        <div
                            className={`text-sm sm:text-base 2xl:text-lg tracking-tight ${
                                currentStep === 1
                                    ? "customtext-primary font-semibold"
                                    : "customtext-neutral-dark"
                            }`}
                        >
                            Carrito de compra
                        </div>
                        <div
                            className={`text-sm sm:text-base 2xl:text-lg tracking-tight ${
                                currentStep === 2
                                    ? "customtext-primary font-semibold"
                                    : "customtext-neutral-dark"
                            }`}
                        >
                            Detalles de envío
                        </div>
                        <div
                            className={`text-sm sm:text-base 2xl:text-lg tracking-tight ${
                                currentStep === 3
                                    ? "customtext-primary font-semibold"
                                    : "customtext-neutral-dark"
                            }`}
                        >
                            Orden confirmada
                        </div>
                    </div>
                    <div
                        className={`mt-4 h-1 max-w-3xl bg-gray-200 ${
                            currentStep === 3
                                ? "lg:col-span-5"
                                : "lg:col-span-3"
                        } `}
                    >
                        <div
                            className="h-1 bg-primary transition-all duration-500"
                            style={{
                                width: `${((currentStep - 1) / 2) * 100}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Steps content */}
                {currentStep === 1 && (
                    <CartStepSF
                        cart={cart}
                        setCart={setCart}
                        onContinue={() => setCurrentStep(2)}
                        subTotal={subTotal}
                        totalPrice={totalPrice}
                        envio={envio}
                        igv={igv}
                        totalFinal={totalFinal}
                    />
                )}

                {currentStep === 2 && (
                    <ShippingStepSF
                        setCode={setCode}
                        setDelivery={setDelivery}
                        cart={cart}
                        setSale={setSale}
                        setCart={setCart}
                        onContinue={() => setCurrentStep(3)}
                        noContinue={() => setCurrentStep(1)}
                        subTotal={subTotal}
                        totalPrice={totalPrice}
                        envio={envio}
                        setEnvio={setEnvio}
                        igv={igv}
                        totalFinal={totalFinal}
                        user={user}
                        prefixes={prefixes}
                        contacts={contacts}
                        ubigeos={ubigeos}
                        items={items}
                    />
                )}

                {currentStep === 3 && (
                    <ConfirmationStepSF
                        code={code}
                        setCart={setCart}
                        delivery={delivery}
                        cart={sale}
                        subTotal={subTotal}
                        totalPrice={totalPrice}
                        envio={envio}
                        igv={igv}
                        totalFinal={totalFinal}
                    />
                )}
            </div>

            {/* <section className="px-[5%] xl:px-[8%] bg-white py-12 xl:py-16 font-paragraph">
                <div className="flex flex-col md:flex-row justify-start items-center bg-gradient-to-br from-[#FFFFFF] to-[#91502D1A] w-full rounded-3xl relative">
                    <div className="flex flex-col gap-5 py-8 px-5 lg:pl-16 xl:pl-20  justify-start items-start w-full 2xl:w-3/5 max-w-xl 2xl:max-w-5xl text-white text-left">
                        <h1 className="customtext-primary text-opacity-20 font-bold text-3xl md:text-4xl xl:text-5xl">
                            ¡Tu compra merece un envío GRATIS!
                        </h1>

                        <p className="customtext-primary  font-normal text-base xl:text-lg 2xl:text-xl">
                        Llévate tus regalos favoritos y obtén envío gratis en compras mayores a S/100.
                        </p>

                        <div className="flex flex-col">
                            <a className="w-auto bg-primary px-6 py-3 2xl:py-4 2xl:px-8 rounded-3xl text-white font-font-general leading-none text-base 2xl:text-xl">
                                Seguir comprando
                            </a>
                        </div>
                    </div>

                    <div className="xl:absolute right-0 bottom-0 flex flex-col ml-5 w-full items-end  md:w-6/12 2xl:w-2/5 mt-0 md:-mb-14 ">
                        <img
                            src={"/assets/img/backgrounds/resources/image-cart.png"}
                            onError={(e) =>
                                (e.target.src =
                                    "/assets/img/noimage/no_img.jpg")
                            }
                            className="object-contain min-h-[300px] max-h-[500px] md:object-contain  xl:max-h-[400px]  md:max-h-none w-full object-bottom"
                        />
                    </div>
                </div>
            </section> */}
        </div>
    );
}
