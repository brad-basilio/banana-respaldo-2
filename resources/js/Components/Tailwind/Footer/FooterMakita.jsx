import React, { useRef, useState } from "react";
import ReactModal from "react-modal";
import { CircleCheckBig, X } from "lucide-react";
import { toast } from "sonner";
import SubscriptionsRest from "../../../Actions/SubscriptionsRest";
import Global from "../../../Utils/Global";
import HtmlContent from "../../../Utils/HtmlContent";

const FooterMakita = ({ pages, generals }) => {
    const subscriptionsRest = new SubscriptionsRest();
    const emailRef = useRef();

    const [modalOpen, setModalOpen] = useState(null);
    const [saving, setSaving] = useState(false);

    const policyItems = {
        terms_conditions: "Términos y condiciones",
        privacy_policy: "Políticas de privacidad",
        saleback_policy: "Políticas de devolución y cambio",
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

        toast.success("¡Suscrito!", {
            description: `Te has suscrito correctamente al blog de ${Global.APP_NAME}.`,
            icon: <CircleCheckBig className="h-5 w-5 text-green-500" />,
            duration: 3000,
            position: "top-center",
        });

        emailRef.current.value = null;
    };

    return (
        <footer className="bg-[#0e6984] text-white py-16">
            <div className="container mx-auto px-4 md:px-[5%]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Column 1: Logo and company info */}
                    <div>
                        <img
                            src="/assets/img/logo-makita-white.png"
                            alt="Makita"
                            className="h-10 mb-4"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 50'%3E%3Ctext x='10' y='30' font-family='Arial' font-size='24' fill='white'%3EMakita%3C/text%3E%3C/svg%3E";
                            }}
                        />
                        <p className="mb-4 text-sm">
                            La línea más completa de herramientas y accesorios.
                        </p>
                        <div className="mb-2">
                            <p className="text-sm font-medium mb-1">Teléfono</p>
                            <p className="text-sm">+51 993 763 928</p>
                        </div>
                        <div className="mb-6">
                            <p className="text-sm font-medium mb-1">Correo electrónico</p>
                            <p className="text-sm">soporte@makita.com.pe</p>
                        </div>
                        <p className="text-sm mb-2">Siga a Makita:</p>
                        <div className="flex space-x-4">
                            <a
                                href="#"
                                className="text-white hover:text-[#27b6cc]"
                                aria-label="Facebook"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className="text-white hover:text-[#27b6cc]"
                                aria-label="Instagram"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className="text-white hover:text-[#27b6cc]"
                                aria-label="YouTube"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Products */}
                    <div>
                        <h3 className="text-xl font-medium mb-6">Productos</h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-[#27b6cc] transition-colors"
                                >
                                    A batería
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-[#27b6cc] transition-colors"
                                >
                                    A cable
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-[#27b6cc] transition-colors"
                                >
                                    Jardín / Forestal
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-[#27b6cc] transition-colors"
                                >
                                    Limpieza Profesional
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-[#27b6cc] transition-colors"
                                >
                                    Trabajos en metal
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center hover:text-[#27b6cc] transition-colors"
                                >
                                    Ver más
                                    <svg
                                        className="h-4 w-4 ml-1"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Resources */}
                    <div>
                        <h3 className="text-xl font-medium mb-6">Recursos</h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-[#27b6cc] transition-colors"
                                >
                                    Distribuidores
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-[#27b6cc] transition-colors"
                                >
                                    Servicios Técnicos
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-[#27b6cc] transition-colors"
                                >
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-[#27b6cc] transition-colors"
                                >
                                    Cotizar productos
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="flex items-center hover:text-[#27b6cc] transition-colors"
                                >
                                    Ver más
                                    <svg
                                        className="h-4 w-4 ml-1"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div>
                        <h3 className="text-xl font-medium mb-4">Recibe novedades</h3>
                        <form onSubmit={onEmailSubmit}>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Nombre completo"
                                    className="w-full p-3 rounded border border-gray-300 bg-white text-gray-800"
                                />

                                <input
                                    type="email"
                                    ref={emailRef}
                                    placeholder="Correo electrónico"
                                    className="w-full p-3 rounded border border-gray-300 bg-white text-gray-800"
                                    required
                                />

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full bg-[#27b6cc] hover:bg-[#1d9baf] text-white font-medium py-3 px-4 rounded transition-colors"
                                >
                                    {saving ? "Enviando..." : "Registrarme"}
                                </button>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        className="mr-2"
                                        required
                                    />
                                    <label
                                        htmlFor="terms"
                                        className="text-sm"
                                    >
                                        Acepto los{" "}
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                openModal(0);
                                            }}
                                            className="underline hover:text-[#27b6cc]"
                                        >
                                            Términos y condiciones
                                        </a>
                                        .
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modals for policies */}
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
                        className="absolute left-1/2 -translate-x-1/2 bg-white p-6 rounded-xl shadow-lg w-[95%] max-w-4xl my-8"
                        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
                    >
                        <button
                            onClick={closeModal}
                            className="float-right text-red-500 hover:text-red-700 transition-all duration-300"
                        >
                            <X width="2rem" strokeWidth="4px" />
                        </button>
                        <h2 className="text-2xl font-bold mb-4">{title}</h2>
                        <HtmlContent className="prose" html={content} />
                    </ReactModal>
                );
            })}
        </footer>
    );
};

export default FooterMakita;
