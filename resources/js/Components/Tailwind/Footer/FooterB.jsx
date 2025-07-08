import React, { useRef, useState } from "react";
import ReactModal from "react-modal";

import Tippy from "@tippyjs/react";
import Swal from "sweetalert2";
import SubscriptionsRest from "../../../Actions/SubscriptionsRest";
import Global from "../../../Utils/Global";
import HtmlContent from "../../../Utils/HtmlContent";
import { CircleCheckBig, X } from "lucide-react";
import { toast } from "sonner";

const FooterB = ({ pages, generals }) => {
    const subscriptionsRest = new SubscriptionsRest();
    const emailRef = useRef();

    const [modalOpen, setModalOpen] = useState(null);
    const [saving, setSaving] = useState();

    const policyItems = {
         privacy_policy: "Políticas de privacidad",
        terms_conditions: "Términos y condiciones",
       
        // 'delivery_policy': 'Políticas de envío',
        saleback_policy: "Políticas de devolucion y cambio",
    };

    const openModal = (index) => setModalOpen(index);
    const closeModal = () => setModalOpen(null);

    const onEmailSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const request = {
            email: emailRef.current.value,
            status: 1,
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
        toast.success("¡Suscrito!", {
            description: `Te has suscrito correctamente al blog de ${Global.APP_NAME}.`,
            icon: <CircleCheckBig className="h-5 w-5 text-green-500" />,
            duration: 3000,
            position: "top-center",
        });

        emailRef.current.value = null;
    };
    return (
        <footer className="bg-accent text-white py-12  text-sm font-font-secondary">
            <div className="px-primary 2xl:px-0 2xl:max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-6  md:gap-12">
                {/* Menu Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:col-span-4 justify-between md:mr-6">
                    {/* Logo Column */}
                    <div>
                        <div className=" -ml-8 md:ml-0 h-14 aspect-[13/4] ">
                            <div
                                className="h-full w-full bg-primary"
                                style={{
                                    maskImage: `url(/assets/resources/logo.png)`,
                                    maskSize: "contain",
                                    maskPosition: "center",
                                    maskRepeat: "no-repeat",
                                }}
                            />
                        </div>
                    </div>

                    {/* Menu Column */}
                    <div>
                        <h3 className="customtext-primary font-bold mb-6 text-base">
                            Menú
                        </h3>
                        <ul className="text-white flex lg:flex-col gap-2 items-center lg:items-start">
                            {pages.map((page, index) =>
                                page.menuable && (
                                    <li key={index}>
                                        <a
                                            href={page.path}
                                            className="hover:customtext-primary hover:font-semibold text-sm cursor-pointer transition-all duration-300"
                                        >
                                            {page.name}
                                        </a>

                                        {index !== pages.filter(p => p.menuable).length + 2 && (
                                            <span className="text-white ml-2 lg:hidden">|</span>
                                        )}
                                    </li>
                                )
                            )}
                        </ul>
                    </div>

                    {/* Policies Column */}
                    <div>
                        <h3 className="customtext-primary font-bold mb-6 text-base">
                            Políticas
                        </h3>
                        <ul className="space-y-3 text-white">
                            <li>
                                <a
                                    onClick={() => openModal(0)}
                                    className="cursor-pointer hover:customtext-primary hover:font-bold transition-all duration-300"
                                >
                                    Políticas de privacidad
                                </a>
                            </li>
                            <li>
                                <a
                                    type="button"
                                    href="#"
                                    onClick={() => openModal(1)}
                                    className="cursor-pointer hover:customtext-primary hover:font-bold transition-all duration-300"
                                >
                                    Términos y Condiciones
                                </a>
                            </li>
                            <li>
                                <a
                                 type="button"
                                    href="#"
                                    onClick={() => openModal(2)}
                                    className="cursor-pointer hover:customtext-primary hover:font-bold transition-all duration-300"
                                >
                                    Políticas de cambio
                                </a>
                            </li>
                            <li>
                                <a
                        
                                 
                                    href="/libro-reclamaciones"
                                    className="cursor-pointer flex flex-col gap-2 items-start  "
                                >
                                    <span className="hover:customtext-primary hover:font-bold transition-all duration-300">
                                        Libro de reclamaciones
                                    </span>
                                    <div className="fill-primary ">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 512 512"
                                            width="34"
                                            height="34"
                                        >
                                            <path
                                                className="s0"
                                                d="m10.5 125.9c-2.2 1-4.8 2.7-5.7 3.7-0.9 1-2.4 3.6-3.2 5.6-1.4 3.4-1.6 20.1-1.6 152.8 0 135.2 0.1 149.3 1.6 152.2 0.9 1.8 2.6 4.4 3.8 5.6 1.1 1.3 3.3 3 4.9 3.8 1.5 0.8 4.8 1.4 7.5 1.5 2.6 0 9-0.9 14.2-2 5.2-1.1 14.9-2.9 21.5-4 6.6-1.1 17.8-2.7 25-3.5 7.2-0.9 21.3-2.1 31.5-2.7 10.2-0.6 26.2-0.8 35.5-0.5 9.3 0.4 23.5 1.4 31.5 2.2 8 0.9 19.4 2.7 25.5 3.9 6.1 1.2 11.2 2 11.5 1.8 0.3-0.3-1.5-2.3-4-4.5-2.5-2.2-8.3-6.6-13-9.7-4.7-3.1-13-7.9-18.5-10.6-5.5-2.6-15.2-6.6-21.5-8.7-6.3-2.1-15.6-4.8-20.5-5.9-4.9-1.1-12.9-2.7-17.8-3.5-4.8-0.8-18.3-2-29.9-2.8-12.1-0.8-23-2.1-25.3-2.9-2.2-0.7-6-2.6-8.5-4-2.5-1.4-6.5-4.5-8.9-6.9-2.4-2.4-5.7-6.3-7.3-8.8-1.6-2.5-3.8-7.4-4.9-11-1.9-6.3-1.9-9.6-1.9-124.8v-118.2c-15.1 0-18.6 0.6-21.5 1.9zm469.5 116.3c0 115.2 0 118.5-1.9 124.8-1.1 3.6-3.3 8.5-4.9 11-1.6 2.5-4.9 6.4-7.3 8.8-2.4 2.4-6.4 5.5-8.9 6.9-2.5 1.4-6.3 3.3-8.5 4-2.3 0.8-13 2.1-25 2.9-11.6 0.7-24.1 1.8-28 2.4-3.9 0.6-11.3 2-16.5 3.1-5.2 1.1-15.1 3.9-22 6.1-6.9 2.2-17.2 6.3-23 9.1-5.8 2.8-14.3 7.7-19 10.8-4.7 3.1-10.5 7.5-13 9.7-2.5 2.2-4.3 4.2-4 4.5 0.3 0.2 5.4-0.6 11.5-1.8 6.1-1.2 17.5-3 25.5-3.9 8-0.8 22.1-1.8 31.5-2.2 9.4-0.3 25.3-0.1 35.5 0.5 10.2 0.6 24.4 1.8 31.5 2.7 7.1 0.8 18.4 2.4 25 3.5 6.6 1.1 16.3 2.9 21.5 4 5.2 1.1 11.6 2 14.3 2 2.6-0.1 5.9-0.7 7.5-1.5 1.5-0.8 3.7-2.5 4.9-3.8 1.2-1.2 2.9-4 3.7-6.1 1.4-3.3 1.6-20.1 1.6-152.4 0-142.3-0.1-149-1.9-152.8-1-2.2-2.7-4.8-3.7-5.7-1-0.9-3.6-2.4-5.6-3.2-2.4-1-6.9-1.6-12.3-1.6h-8.5zm-403.5-181.7c-0.6 0.2-2.3 0.5-3.8 0.9-1.5 0.3-4.3 2-6.3 3.8-1.9 1.8-4.2 5-5 7.2-1.3 3.5-1.4 23.4-1.2 145.7l0.3 141.7c4.8 5.9 7.7 8.5 9.6 9.6 2.7 1.6 6.2 2.1 18.4 2.7 8.2 0.3 17.7 1 21 1.3 3.3 0.4 11.4 1.6 18 2.7 6.6 1.1 16.9 3.2 23 4.8 6 1.6 15.5 4.5 21 6.5 5.5 2.1 14.9 6.2 21 9.2 6 3.1 14.8 8.1 19.5 11.2 4.7 3.1 12.3 8.8 17 12.7 4.7 3.9 9.2 7.9 10 8.8 0.8 1 1.8 1.7 2.2 1.7 0.4 0 0.8-64.5 0.8-143.3-0.1-89.5-0.4-144.8-1-147.2-0.6-2.2-3.2-7.2-5.8-11-2.6-3.9-9.9-12.2-16.2-18.6-7.4-7.4-14.9-13.9-21-17.9-5.2-3.5-14.5-8.8-20.5-11.7-6.1-3-16.4-7.2-23-9.3-6.6-2.2-17.6-5.1-24.5-6.4-6.9-1.4-17.7-3-24-3.6-6.3-0.5-15.3-1.2-20-1.4-4.7-0.2-9-0.2-9.5-0.1zm342 0.5c-7.2 0.4-16.8 1.3-21.5 1.9-4.7 0.6-13.7 2.3-20 3.7-6.3 1.4-16.6 4.3-22.8 6.5-6.2 2.1-15.6 6-21 8.7-5.3 2.7-14 7.7-19.2 11.2-6.1 4.1-13.6 10.4-21 17.9-6.3 6.4-13.7 14.7-16.3 18.6-2.6 3.8-5.2 8.8-5.7 11-0.6 2.4-1 57.7-1 147.2 0 78.8 0.3 143.3 0.7 143.3 0.4 0 1.5-0.7 2.3-1.7 0.8-0.9 5.5-5.1 10.5-9.2 4.9-4.1 12.6-9.9 17-12.7 4.4-2.9 12.9-7.7 19-10.7 6-3.1 15.5-7.2 21-9.3 5.5-2 14.9-4.9 21-6.5 6-1.6 16.4-3.7 23-4.8 6.6-1.1 14.7-2.3 18-2.7 3.3-0.3 12.7-1 21-1.3 12.2-0.6 15.6-1.1 18.4-2.7 1.8-1.1 4.8-3.7 6.5-5.8l3.1-3.8c0.5-237.4 0.2-283.5-0.5-286.1-0.6-2.1-2.3-5.2-3.8-6.9-1.5-1.7-3.8-3.7-5.2-4.4-1.4-0.7-4.3-1.4-6.5-1.7-2.2-0.3-9.9-0.1-17 0.3z"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-[6px] text-white w-1/2 leading-3">
                                        Conforme a lo establecido en el Código
                                        de Protección y Defensa del consumidor
                                        este sitio web cuenta con un Libro de
                                        Reclamaciones a tu disposicón
                                    </p>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Newsletter Column */}
                <div className="mt-4 lg:mt-0 col-span-1 md:col-span-2">
                    <h3 className="customtext-primary font-bold mb-4 text-base ">
                        Únete a nuestro blog
                    </h3>
                    <p className="mb-6 text-white text-sm">
                        Suscríbete y recibe todas nuestras novedades
                    </p>
                    <form onSubmit={onEmailSubmit}>
                        <div className="relative customtext-neutral-dark">
                            <input
                                ref={emailRef}
                                type="email"
                                placeholder="Ingresa tu e-mail"
                                className="w-full customtext-neutral-dark font-semibold  shadow-xl  py-5 pl-5 border  rounded-[20px] md:rounded-full focus:ring-0 focus:outline-none"
                                disabled={saving}
                            />
                            <button
                                disabled={saving}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 py-3 font-bold shadow-xl px-4 bg-primary text-white rounded-xl flex items-center justify-center min-w-[120px]"
                                aria-label="Suscribite"
                            >
                                {saving ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                            />
                                        </svg>
                                        Enviando...
                                    </span>
                                ) : (
                                    "Suscribirme"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                </div>
                {Object.keys(policyItems).map((key, index) => {
                const title = policyItems[key];
                const content =
                    generals.find((x) => x.correlative == key)?.description ??
                    "";
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
                                    className="px-6 py-2 bg-primary text-white rounded-lg  transition-colors duration-200 font-medium"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </ReactModal>
                );
            })}
        </footer>
    );
};
export default FooterB;
