import React, { useEffect } from "react";
import ReactModal from "react-modal";
import CartItemRow from "./CartItemRow";
import Number2Currency from "../../../Utils/Number2Currency";
import { motion, AnimatePresence } from "framer-motion";

ReactModal.setAppElement("#app");

const CartModal = ({ data, cart, setCart, modalOpen, setModalOpen }) => {
    
    useEffect(() => {
        if (modalOpen) {
            document.body.classList.add("overflow-hidden");
            document.documentElement.classList.add("overflow-hidden");
        } else {
            document.body.classList.remove("overflow-hidden");
            document.documentElement.classList.remove("overflow-hidden");
        }
    }, [modalOpen]);

    const totalPrice = cart.reduce((acc, item) => acc + (item.final_price * item.quantity), 0);
    const isEmpty = cart.length === 0;

    return (
        <ReactModal
            isOpen={modalOpen}
            onRequestClose={() => setModalOpen(false)}
            contentLabel="Carrito de compras"
            closeTimeoutMS={300}
            className="fixed z-[99999] inset-0 md:inset-auto md:top-0 md:right-0 bg-white p-6 shadow-2xl w-full max-w-[480px] h-[100dvh] max-h-[100dvh] lg:h-screen flex flex-col outline-none md:rounded-l-xl animate-slide-in"
            overlayClassName="fixed inset-0 bg-black/50 z-[200] backdrop-blur-sm transition-opacity"
        >
            <div className="flex flex-col flex-1 h-full">
                {/* Header */}
                <div className="flex-shrink-0 flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <motion.h2 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-bold text-gray-900"
                    >
                        Tu Carrito
                    </motion.h2>
                    <button 
                        onClick={() => setModalOpen(false)}
                        className="p-2 rounded-full hover:bg-gray-50 transition-colors"
                    >
                        <i className="mdi mdi-close text-2xl text-gray-500 hover:text-gray-700 transition-colors"></i>
                    </button>
                </div>

                {/* Contenido desplazable - Altura optimizada para móvil */}
                <div className="flex-1 overflow-y-auto min-h-0 mb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <AnimatePresence mode="wait">
                        {isEmpty ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center h-full text-center p-8 min-h-[300px]"
                            >
                                <div className="mb-6 text-gray-300">
                                    <i className="mdi mdi-cart-outline text-7xl"></i>
                                </div>
                                <p className="text-gray-500 text-lg font-medium mb-4">
                                    Tu carrito está vacío
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="items"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4 pr-2 pb-4"
                            >
                                {cart.map((item, index) => (
                                    <CartItemRow
                                        key={item.id}
                                        {...item}
                                        setCart={setCart}
                                        index={index}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer - Siempre visible y fijo en la parte inferior */}
                <div className="flex-shrink-0 pt-4 border-t border-gray-100 bg-white sticky bottom-0 z-10">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-gray-900">Total:</span>
                        <span className="text-xl font-bold text-gray-900">
                            S/. {Number2Currency(totalPrice)}
                        </span>
                    </div>
                    <a
                        href={data?.link_cart || '/cart'}
                        disabled={isEmpty}
                        className={`w-full block text-center py-4 rounded-xl font-semibold transition-all duration-300 ${
                            isEmpty 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-primary text-white hover:shadow-lg hover:scale-[1.02] active:scale-100'
                        }`}
                    >
                        Ir al carrito
                    </a>
                </div>
            </div>
        </ReactModal>
    );
};

export default CartModal;