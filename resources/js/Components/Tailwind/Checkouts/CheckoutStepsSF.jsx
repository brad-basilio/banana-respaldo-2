import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CartStepSF from "./Components/CartStepSF";
import ShippingStepSF from "./Components/ShippingStepSF";
import ConfirmationStepSF from "./Components/ConfirmationStepSF";
import Global from "../../../Utils/Global";
import { Local } from "sode-extend-react";
import ProductNavigationSwiper from "../Products/ProductNavigationSwiper";
import ReactModal from "react-modal";
import HtmlContent from "../../../Utils/HtmlContent";
import { X } from "lucide-react";

export default function CheckoutStepsSF({ cart, setCart, user, prefixes, ubigeos, items, contacts, generals = [] }) {
   
    const [currentStep, setCurrentStep] = useState(1);
    const [descuentofinal, setDescuentoFinal] = useState(null);
    
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
    const totalFinal = (parseFloat(subTotal) + parseFloat(igv) + parseFloat(envio) - descuentofinal).toFixed(2);
    
    const [sale, setSale] = useState([]);
    const [code, setCode] = useState([]);
    const [delivery, setDelivery] = useState([]);

    // Estados para los modales de políticas
    const [modalOpen, setModalOpen] = useState(null);
    
    // Function to handle step changes and scroll to top
    const handleStepChange = (newStep) => {
        setCurrentStep(newStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const openModal = (index) => setModalOpen(index);
    const closeModal = () => setModalOpen(null);

    const policyItems = {
        privacy_policy: "Políticas de privacidad",
        terms_conditions: "Términos y condiciones",
        saleback_policy: "Políticas de devolución y cambio",
    };

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
        <div className="min-h-screen bg-[#F7F9FB] py-4 md:py-12 px-2 sm:px-primary 2xl:px-0 2xl:max-w-7xl mx-auto">
            <div className="bg-white p-3 md:p-8 rounded-lg md:rounded-xl shadow-sm">
                {/* Steps indicator */}
                <div className="mb-4 md:mb-8">
                    <div className="flex items-center justify-between gap-1 md:gap-4 max-w-3xl mx-auto">
                        <div className={`flex flex-col items-center md:flex-row md:items-center gap-1 md:gap-2 ${currentStep === 1 ? "customtext-primary font-medium" : "customtext-neutral-dark"}`}>
                            <span className="bg-primary text-white w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs md:text-sm">1</span>
                            <span className="text-[10px] md:text-sm text-center">Carrito</span>
                        </div>
                        <div className="mb-4 lg:mb-0 flex-1 h-[2px] bg-gray-200 relative">
                            <div className="absolute inset-0 bg-primary transition-all duration-500" style={{ width: currentStep > 1 ? "100%" : "0%" }} />
                        </div>
                        <div className={`flex flex-col items-center md:flex-row md:items-center gap-1 md:gap-2 ${currentStep > 1 ? "customtext-primary font-medium" : "customtext-neutral-dark"}`}>
                            <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs md:text-sm ${currentStep > 1 ? "bg-primary text-white" : "bg-white customtext-primary"}`}>2</span>
                            <span className="text-[10px] md:text-sm text-center">Envío</span>
                        </div>
                        <div className="mb-4 lg:mb-0 flex-1 h-[2px] bg-gray-200 relative">
                            <div className="absolute inset-0 bg-primary transition-all duration-500" style={{ width: currentStep > 2 ? "100%" : "0%" }} />
                        </div>
                        <div className={`flex flex-col items-center md:flex-row md:items-center gap-1 md:gap-2 ${currentStep === 3 ? "customtext-primary font-medium" : "customtext-neutral-dark"}`}>
                            <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs md:text-sm ${currentStep === 3 ? "bg-primary text-white" : "bg-white customtext-primary"}`}>3</span>
                            <span className="text-[10px] md:text-sm text-center">Confirmación</span>
                        </div>
                    </div>
                </div>

                {/* Steps content */}
                {currentStep === 1 && (
                    <CartStepSF
                        cart={cart}
                        setCart={setCart}
                        onContinue={() => handleStepChange(2)}
                        subTotal={subTotal}
                        totalPrice={totalPrice}
                        envio={envio}
                        igv={igv}
                        totalFinal={totalFinal}
                        openModal={openModal}
                    />
                )}

                {currentStep === 2 && (
                    <ShippingStepSF
                        setCode={setCode}
                        setDelivery={setDelivery}
                        cart={cart}
                        setSale={setSale}
                        setCart={setCart}
                        onContinue={() => handleStepChange(3)}
                        noContinue={() => handleStepChange(1)}
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
                        descuentofinal={descuentofinal}
                        setDescuentoFinal={setDescuentoFinal}
                        openModal={openModal}
                        generals={generals}
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
                        descuentofinal={descuentofinal}
                        setDescuentoFinal={setDescuentoFinal}
                    />
                )}
            </div>

            {/* Modales de políticas */}
            {Object.keys(policyItems).map((key, index) => {
                const title = policyItems[key];
                const content = generals.find((x) => x.correlative == key)?.description ?? "";
                return (
                    <ReactModal
                        key={index}
                        isOpen={modalOpen === index}
                        onRequestClose={closeModal}
                        contentLabel={title}
                        className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center p-4 z-50"
                        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-[999]"
                        ariaHideApp={false}
                    >
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-900 pr-4">{title}</h2>
                                <button
                                    onClick={closeModal}
                                    className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 hover:bg-gray-100 rounded-full"
                                    aria-label="Cerrar modal"
                                >
                                    <X size={24} strokeWidth={2} />
                                </button>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="prose prose-gray max-w-none">
                                    <HtmlContent html={content} />
                                </div>
                            </div>
                            
                            {/* Footer */}
                            <div className="flex justify-end p-6 border-t border-gray-200">
                                <button
                                    onClick={closeModal}
                                    className="px-6 py-2 bg-primary text-white rounded-lg transition-colors duration-200 font-medium"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </ReactModal>
                );
            })}
        </div>
    );
}
