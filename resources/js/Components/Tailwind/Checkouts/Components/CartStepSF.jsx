import { useState } from "react";
import Number2Currency from "../../../../Utils/Number2Currency";

import ButtonPrimary from "./ButtonPrimary";
import ButtonSecondary from "./ButtonSecondary";
import CardItemSF from "./CardItemSF";




export default function CartStepSF({ cart, setCart, onContinue, subTotal, envio, igv, totalFinal, openModal }) {

    // Estado vacío del carrito
    if (!cart || cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="max-w-md w-full text-center">
                    {/* Icono del carrito vacío */}
                    <div className="mb-8">
                        <div className="mx-auto w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                            </svg>
                        </div>
                    </div>
                    
                    {/* Mensaje principal */}
                    <h2 className="text-3xl font-bold customtext-neutral-dark mb-4">
                        Tu carrito está vacío
                    </h2>
                    
                    {/* Mensaje secundario */}
                    <p className="text-base text-gray-600 mb-8 leading-relaxed">
                        ¡Descubre nuestros increíbles productos y comienza a llenar tu carrito con tus favoritos!
                    </p>
                    
                  
                    
                    {/* Botón de acción */}
                    <div className="space-y-3">
                        <ButtonPrimary className={'rounded-2xl xl:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 w-full'} href="/">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Explorar productos
                        </ButtonPrimary>
                        
                    
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-y-8 md:gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-3 flex flex-row w-full">
                {/* Versión desktop (tabla) */}
                <div className="hidden md:block overflow-x-auto rounded-2xl shadow-lg border border-gray-200 w-full">
                    <table className="min-w-full divide-y divide-gray-200 bg-white">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr className="!font-font-general">
                                <th scope="col" className="px-6 py-4 text-left text-sm 2xl:text-base font-bold customtext-neutral-dark">
                                    Producto
                                </th>
                                <th scope="col" className="px-6 py-4 text-center text-sm 2xl:text-base font-bold customtext-neutral-dark">
                                    Cantidad
                                </th>
                                <th scope="col" className="px-6 py-4 text-center text-sm 2xl:text-base font-bold customtext-neutral-dark">
                                    Precio
                                </th>
                                <th scope="col" className="px-6 py-4 text-center text-sm 2xl:text-base font-bold customtext-neutral-dark">
                                    Subtotal
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {cart.map((item, index) => (
                                <CardItemSF key={index} {...item} setCart={setCart} />
                            ))}
                        </tbody>
                    </table>
                </div>
                 {/* Versión mobile (tarjetas) - Se muestra automáticamente en móviles */}
                <div className="md:hidden space-y-4 w-full">
                    {cart.map((item, index) => (
                            <CardItemSF key={index} {...item} setCart={setCart} />
                    ))}
                </div>
            </div>

            {/* Resumen de compra */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-8 col-span-2 h-max font-font-general">
                <h3 className="text-2xl 2xl:text-3xl font-bold pb-6 customtext-neutral-dark flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    Resumen de compra
                </h3>
                
                <div className="space-y-3 py-2">
                    <div className="flex justify-between items-center py-1">
                        <span className="customtext-neutral-dark text-base 2xl:text-base">Subtotal ({cart.length} {cart.length === 1 ? 'producto' : 'productos'})</span>
                        <span className="font-bold text-base 2xl:text-xl">S/ {Number2Currency(subTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <span className="customtext-neutral-dark text-base 2xl:text-base">IGV (18%)</span>
                        <span className="font-bold text-base 2xl:text-xl">S/ {Number2Currency(igv)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <div className="flex items-center gap-2">
                            <span className="customtext-neutral-dark text-base 2xl:text-base">Envío</span>
                           
                        </div>
                        <span className="font-bold text-base 2xl:text-xl">
                            S/ {Number2Currency(envio)}
                        </span>
                    </div>
                </div>
                
                <div className="py-4 border-y-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg ">
                    <div className="flex justify-between font-bold text-2xl 2xl:text-2xl items-center">
                        <span className="customtext-primary">Total</span>
                        <span className="customtext-primary">S/ {Number2Currency(totalFinal)}</span>
                    </div>
                  
                </div>
                
                <div className="space-y-3 pt-6">
                    <ButtonPrimary className={'rounded-2xl py-4 xl:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300'} onClick={onContinue}>
                        Continuar compra
                    </ButtonPrimary>

                    <ButtonSecondary className={'rounded-2xl py-4 xl:rounded-3xl'} href="/"> 
                        Seguir comprando
                    </ButtonSecondary>
                </div>
                
                <div className="pt-4">
                    <div className="  rounded-xl ">
                        <div className="flex items-start gap-3">
                           
                            <div>
                                <p className="text-sm customtext-neutral-dark leading-relaxed">
                                    Al realizar tu pedido, aceptas los{" "}
                                    <button 
                                        onClick={() => openModal && openModal(1)}
                                        className="customtext-primary font-bold hover:underline cursor-pointer"
                                    >
                                        Términos y Condiciones
                                    </button>
                                    , y que nosotros usaremos tus datos personales de acuerdo con nuestra{" "}
                                    <button 
                                        onClick={() => openModal && openModal(0)}
                                        className="customtext-primary font-bold hover:underline cursor-pointer"
                                    >
                                        Política de Privacidad
                                    </button>
                                    .
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}