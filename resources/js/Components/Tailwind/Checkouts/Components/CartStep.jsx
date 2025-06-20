import { useState } from "react";
import Number2Currency from "../../../../Utils/Number2Currency";
import ButtonPrimary from "./ButtonPrimary";
import ButtonSecondary from "./ButtonSecondary";
import CardItem from "./CardItem";

export default function CartStep({ cart, setCart, onContinue, subTotal, envio, igv, totalFinal, openModal }) {
    const isCartEmpty = cart.length === 0;

    return (
        <div className="grid lg:grid-cols-5 gap-4 md:gap-8">
            {/* Product List */}
            <div className="lg:col-span-3 space-y-4 md:space-y-6">
                {isCartEmpty ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                        <svg className="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">Tu carrito está vacío</h3>
                        <p className="text-gray-500">¡Explora nuestros productos y encuentra algo especial!</p>
                    </div>
                ) : (
                    cart.map((item, index) => (
                        <CardItem key={index} {...item} setCart={setCart} />
                    ))
                )}
            </div>

            {/* Checkout Summary */}
            <div className="lg:col-span-2 bg-[#F7F9FB] rounded-xl shadow-lg p-4 md:p-6 h-max mt-4 md:mt-0">
                <h3 className="text-xl md:text-2xl font-bold pb-4 md:pb-6">Resumen</h3>
                <div className="space-y-3 md:space-y-4">
                    <div className="flex justify-between">
                        <span className="customtext-neutral-dark">Subtotal</span>
                        <span className="font-semibold">S/ {Number2Currency(subTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="customtext-neutral-dark">IGV</span>
                        <span className="font-semibold">S/ {Number2Currency(igv)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="customtext-neutral-dark">Envío</span>
                        <span className="font-semibold">S/ {Number2Currency(envio)}</span>
                    </div>
                    <div className="py-3 border-y-2 mt-4 md:mt-6">
                        <div className="flex justify-between font-bold text-lg md:text-[20px] items-center">
                            <span>Total</span>
                            <span>S/ {Number2Currency(totalFinal)}</span>
                        </div>
                    </div>
                    <div className="space-y-2 pt-3 md:pt-4">
                        <ButtonPrimary 
                            onClick={onContinue} 
                            className="w-full"
                            disabled={isCartEmpty}
                        >
                            {isCartEmpty ? 'Carrito Vacío' : 'Continuar Compra'}
                        </ButtonPrimary>
                        <ButtonSecondary href="/" className="w-full">
                            {isCartEmpty ? 'Ir a Comprar' : 'Cancelar'}
                        </ButtonSecondary>
                    </div>
                    <div>
                        <p className="text-xs md:text-sm customtext-neutral-dark">
                            Al realizar tu pedido, aceptas los <a href="#" onClick={() => openModal(1)} className="customtext-primary font-bold">Términos y Condiciones</a>, y que nosotros usaremos sus datos personales de acuerdo con nuestra <a href="#" onClick={() => openModal(0)} className="customtext-primary font-bold">Política de Privacidad</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}