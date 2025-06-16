import { useEffect, useState } from "react";
import Number2Currency from "../../../../Utils/Number2Currency";
import { recoveryOrderData } from "../../../../Actions/recoveryOrderData";
import ButtonPrimary from "./ButtonPrimary";
import { Local } from "sode-extend-react";
import Global from "../../../../Utils/Global";


export default function ConfirmationStepSF({setCart, cart, code, delivery }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await recoveryOrderData({code});
                setOrder(response.order);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        if (code) {
            fetchOrderDetails();
            Local.delete(`${Global.APP_CORRELATIVE}_cart`);
            Local.set(`${Global.APP_CORRELATIVE}_cart`,[]);
        }
    }, [code]);

    if (loading) {
        return (
            <div className="mx-auto">
                <div className="bg-white rounded-lg shadow p-6 font-font-general text-center">
                    <p>Cargando detalles de la orden...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto">
                <div className="bg-white rounded-lg shadow p-6 font-font-general text-center text-red-500">
                    <p>Error al cargar la orden: {error}</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="mx-auto">
                <div className="bg-white rounded-lg shadow p-6 font-font-general text-center">
                    <p>No se encontraron datos de la orden</p>
                </div>
            </div>
        );
    }
    
    const totalPrice = order?.items?.reduce((acc, item) => {
        const itemPrice = item.price || 0; 
        const quantity = item.quantity || 0; 
        return acc + (itemPrice * quantity);
    }, 0) || 0;

    // Calcular el subtotal sin IGV (precio base)
    const subTotal = (totalPrice / 1.18).toFixed(2);

    // Calcular el IGV (18% del subtotal)
    const igv = (subTotal * 0.18).toFixed(2);

    // Calcular el total final (subtotal sin IGV + IGV + envío)
    const totalFinal = parseFloat(subTotal) + parseFloat(igv) + parseFloat(order.delivery) - parseFloat(order.coupon_discount || 0);
    console.log(order.delivery, "order.coupon_discount");
    return (
        <div className="mx-auto">
            <div className="bg-white rounded-lg shadow p-6 font-font-general">
                <div className="text-center space-y-2">
                    <h2 className="text-base xl:text-xl customtext-neutral-light">Gracias por tu compra 🎉</h2>
                    <p className="customtext-neutral-dark text-2xl xl:text-5xl font-semibold">Tu orden ha sido recibida</p>

                    <div className="py-4">
                        <div className=" customtext-neutral-light">Código de pedido</div>
                        <div className="customtext-neutral-dark text-lg font-semibold">#{order.code}</div>
                    </div>

                    <div className="space-y-4 max-w-lg bg-[#F7F9FB] mx-auto p-8 rounded-xl">
                        <div className="space-y-6 border-b-2 pb-6">
                        {order.items.map((item, index) => (
                                <div key={index} className="rounded-lg">
                                    <div className="flex gap-4">
                                        <div className="bg-white rounded-xl w-max">
                                            <img
                                                src={item.image ? `/storage/images/item/${item.image}` : '/assets/img/noimage/no_img.jpg'}
                                                alt={item.name}
                                                className="w-20 h-20 object-cover rounded"
                                                onError={(e) => (e.target.src = "/assets/img/noimage/no_img.jpg")}
                                            />
                                        </div>
                                        <div className="text-start">
                                            <h3 className="font-medium text-lg">
                                                {item.name}
                                            </h3>
                                            <p className="text-sm customtext-neutral-light">
                                                Color: <span className="customtext-neutral-dark">{item.color}</span>
                                            </p>
                                            <p className="text-sm customtext-neutral-light">
                                                Cantidad: <span className="customtext-neutral-dark">{parseInt(item.quantity)}</span> - 
                                                Precio: <span className="customtext-neutral-dark"> S/ {Number2Currency(item.price)}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 mt-6">
                            <div className="flex justify-between">
                                <span className="customtext-neutral-dark">Subtotal</span>
                                <span className="font-semibold">S/ {Number2Currency(subTotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="customtext-neutral-dark">IGV</span>
                                <span className="font-semibold">S/ {Number2Currency(igv)}</span>
                            </div>
                            {order.coupon_id && (
                                <div className="mb-2 mt-2 flex justify-between items-center border-b pb-2 text-sm font-bold">
                                    <span>
                                        Cupón aplicado{" "}
                                    </span>
                                    <span>
                                        S/ -
                                        {Number2Currency(
                                           order.coupon_discount
                                        )}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="customtext-neutral-dark">Envío</span>
                                <span className="font-semibold">S/ {Number2Currency(order.delivery)}</span>
                            </div>
                            <div className="py-3 border-y-2 mt-6">
                                <div className="flex justify-between font-bold text-[20px] items-center">
                                    <span>Total</span>
                                    <span>S/ {Number2Currency(totalFinal)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="pt-3">
                            <ButtonPrimary href="/catalogo" >  Seguir Comprando</ButtonPrimary>

                        </div>

                    </div>


                </div>
            </div>
        </div>
    )
}

