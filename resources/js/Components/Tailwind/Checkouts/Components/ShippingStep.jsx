import { useCallback, useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import Number2Currency from "../../../../Utils/Number2Currency";
import DeliveryPricesRest from "../../../../Actions/DeliveryPricesRest";
import { processCulqiPayment } from "../../../../Actions/culqiPayment";
import ButtonPrimary from "./ButtonPrimary";
import ButtonSecondary from "./ButtonSecondary";
import InputForm from "./InputForm";
import OptionCard from "./OptionCard";
import { InfoIcon, UserRoundX, XOctagonIcon } from "lucide-react";
import { Notify } from "sode-extend-react";
import { debounce } from "lodash";
import { toast } from "sonner";

export default function ShippingStep({
    cart,
    setSale,
    setCode,
    setDelivery,
    setCart,
    onContinue,
    noContinue,
    subTotal,
    igv,
    totalFinal,
    user,
    setEnvio,
    envio,
    ubigeos = [],
    openModal,
}) {
    const [selectedUbigeo, setSelectedUbigeo] = useState(null);
    const [defaultUbigeoOption, setDefaultUbigeoOption] = useState(null);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        lastname: user?.lastname || "",
        email: user?.email || "",
        department: user?.department || "",
        province: user?.province || "",
        district: user?.district || "",
        address: user?.address || "",
        number: user?.number || "",
        comment: "",
        reference: user?.reference || "",
        ubigeo: user?.ubigeo || null,
    });
   
    useEffect(() => {
        if (user?.ubigeo && user?.district && user?.province && user?.department) {
          const defaultOption = {
            value: user.ubigeo,
            label: `${user.district}, ${user.province}, ${user.department}`,
            data: {
              reniec: user.ubigeo,
              departamento: user.department,
              provincia: user.province,
              distrito: user.district
            }
          };
          setDefaultUbigeoOption(defaultOption);
          setSelectedUbigeo(defaultOption); // Actualiza el estado del ubigeo seleccionado
          handleUbigeoChange(defaultOption);
        }
      }, [user]);

    const [loading, setLoading] = useState(false);
    const [shippingOptions, setShippingOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [costsGet, setCostsGet] = useState(null);
    const [errors, setErrors] = useState({});
    const [searchInput, setSearchInput] = useState("");

    // Función de validación mejorada
    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.name.trim()) newErrors.name = "Nombre es requerido";
        if (!formData.lastname.trim()) newErrors.lastname = "Apellido es requerido";
        if (!formData.email.trim()) {
            newErrors.email = "Email es requerido";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Email inválido";
        }
        if (!formData.ubigeo) newErrors.ubigeo = "Ubicación es requerida";
        if (!formData.address) newErrors.address = "Dirección es requerida";
        if (!selectedOption) newErrors.shipping = "Seleccione un método de envío";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUbigeoChange = async (selected) => {
        if (!selected) return;
        
        setErrors(prev => ({ ...prev, ubigeo: "" }));
        const { data } = selected;

        setFormData(prev => ({
            ...prev,
            department: data.departamento,
            province: data.provincia,
            district: data.distrito,
            ubigeo: data.reniec,
        }));

        setLoading(true);
        try {
            const response = await DeliveryPricesRest.getShippingCost({
                ubigeo: data.reniec,
            });

            const options = [];
            if (response.data.is_free) {
                options.push({
                    type: "free",
                    price: 0,
                    description: response.data.standard.description,
                    deliveryType: response.data.standard.type,
                    characteristics: response.data.standard.characteristics,
                });

                if (response.data.express.price > 0) {
                    options.push({
                        type: "express",
                        price: response.data.express.price,
                        description: response.data.express.description,
                        deliveryType: response.data.express.type,
                        characteristics: response.data.express.characteristics,
                    });
                }
            } else if (response.data.is_agency) {
                options.push({
                    type: "agency",
                    price: 0,
                    description: response.data.agency.description,
                    deliveryType: response.data.agency.type,
                    characteristics: response.data.agency.characteristics,
                });
            } else {
                options.push({
                    type: "standard",
                    price: response.data.standard.price,
                    description: response.data.standard.description,
                    deliveryType: response.data.standard.type,
                    characteristics: response.data.standard.characteristics,
                });
            }

            setShippingOptions(options);
            setSelectedOption(options[0].type);
            setEnvio(options[0].price);
        } catch (error) {
            console.error("Error al obtener precios de envío:", error);
            toast.error("Sin cobertura", {
                description: `No realizamos envíos a esta ubicación.`,
                icon: <XOctagonIcon className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: "bottom-center",
            });
          
            setShippingOptions([]);
            setSelectedOption(null);
            setEnvio(0);
        }
        setLoading(false);
    };

    const handlePayment = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error("Acceso requerido", {
                description: `Debe iniciar sesión para continuar.`,
                icon: <UserRoundX className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: "bottom-center",
            });
          
            return;
        }

        if (!validateForm()) {
            const firstErrorKey = Object.keys(errors)[0];
            if (firstErrorKey) {
                document.querySelector(`[name="${firstErrorKey}"]`)?.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }
            return;
        }

        try {
            const request = {
                user_id: user.id,
                ...formData,
                fullname: `${formData.name} ${formData.lastname}`,
                country: "Perú",
                amount: totalFinal,
                delivery: envio,
                cart: cart,
            };

            const response = await processCulqiPayment(request);

            if (response.status) {
                setSale(response.sale);
                setDelivery(response.delivery);
                setCode(response.code);
                setCart([]);
                onContinue();
            } else {
             
            
                toast.error("Error en el pago", {
                    description: response.message || "Pago rechazado",
                    icon: <ShoppingCart className="h-5 w-5 text-red-500" />,
                    duration: 3000,
                    position: "bottom-center",
                })
            }
        } catch (error) {
            toast.error("Lo sentimos, no puede continuar con la compra", {
                description: `Ocurrió un error al procesar el pedido.`,
                icon: <XOctagonIcon className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: "bottom-center",
            });
           
        }
    };

    const loadOptions = useCallback(
        debounce((inputValue, callback) => {
            if (inputValue.length < 3) {
                callback([]);
                return;
            }

            fetch(`/api/ubigeo/search?q=${encodeURIComponent(inputValue)}`)
                .then((response) => {
                    if (!response.ok) throw new Error("Error en la respuesta");
                    return response.json();
                })
                .then((data) => {
                    const options = data.map((item) => ({
                        value: item.reniec,
                        label: `${item.distrito}, ${item.provincia}, ${item.departamento}`,
                        data: {
                            inei: item.inei,
                            reniec: item.reniec,
                            departamento: item.departamento,
                            provincia: item.provincia,
                            distrito: item.distrito,
                        },
                    }));
                    callback(options);
                })
                .catch((error) => {
                    console.error("Error:", error);
                    callback([]);
                });
        }, 300),
        []
    );

    useEffect(() => {
        // Limpiar errores cuando los campos son modificados
        setErrors(prev => {
            const newErrors = { ...prev };
            Object.keys(formData).forEach(key => {
                if (formData[key]) delete newErrors[key];
            });
            return newErrors;
        });
    }, [formData]);

    const selectStyles = (hasError) => ({
        control: (base) => ({
            ...base,
            border: `1px solid ${hasError ? '#ef4444' : '#e5e7eb'}`, // Added default border color
            boxShadow: 'none',
            minHeight: '50px',
            '&:hover': { borderColor: hasError ? '#ef4444' : '#6b7280' },
            borderRadius: '0.75rem',
            padding: '2px 8px',
        }),
        menu: (base) => ({
            ...base,
            zIndex: 9999,
            marginTop: '4px',
            borderRadius: '8px',
        }),
        option: (base) => ({
            ...base,
            color: '#1f2937',
            backgroundColor: 'white',
            '&:hover': { backgroundColor: '#f3f4f6' },
            padding: '12px 16px',
        }),
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 md:gap-8">
            <div className="lg:col-span-3">
                <form className="space-y-4 md:space-y-6 bg-white p-4 md:p-6 rounded-xl shadow-sm" onSubmit={handlePayment}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputForm
                            name="name"
                            label="Nombres"
                            value={formData.name}
                            error={errors.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                            className="border-gray-200"
                        />
                        <InputForm
                            name="lastname"
                            label="Apellidos"
                            value={formData.lastname}
                            error={errors.lastname}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastname: e.target.value }))}
                            required
                            className="border-gray-200"
                        />
                    </div>

                    <InputForm
                        name="email"
                        label="Correo electrónico"
                        type="email"
                        value={formData.email}
                        error={errors.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="border-gray-200"
                    />

                    <div className="form-group">
                        <label className="block text-sm 2xl:text-base mb-2 font-medium customtext-neutral-dark">
                            Ubicación de entrega (Distrito)*
                        </label>
                        <AsyncSelect
                            name="ubigeo"
                            cacheOptions
                            value={selectedUbigeo}
                            loadOptions={loadOptions}
                            onChange={(selected) => {
                                setSelectedUbigeo(selected);
                                handleUbigeoChange(selected);
                                setSearchInput(""); // Limpiar input al seleccionar
                            }}
                            inputValue={searchInput}
                            onInputChange={(value, { action }) => {
                                if (action === "input-change") setSearchInput(value);
                            }}
                            onFocus={() => {
                                setSelectedUbigeo(null); // Limpiar selección al enfocar
                                setSearchInput("");      // Limpiar input de búsqueda
                            }}
                            onMenuOpen={() => {
                                if (selectedUbigeo) {
                                    setSelectedUbigeo(null);
                                    setSearchInput("");
                                }
                            }}
                            placeholder="Buscar por Distrito ..."
                            loadingMessage={() => "Buscando ubicaciones..."}
                            noOptionsMessage={({ inputValue }) =>
                                inputValue.length < 3
                                    ? "Buscar por Distrito ..."
                                    : "No se encontraron resultados"
                            }
                            isLoading={loading}
                            styles={selectStyles(!!errors.ubigeo)}
                            formatOptionLabel={({ data }) => (
                                <div className="text-sm py-1">
                                    <div className="font-medium">{data.distrito}</div>
                                    <div className="text-gray-500">
                                        {data.provincia}, {data.departamento}
                                    </div>
                                </div>
                            )}
                            className="w-full rounded-xl transition-all duration-300"
                            menuPortalTarget={document.body}
                            isClearable={true}
                        />
                        {errors.ubigeo && <div className="text-red-500 text-sm mt-1">{errors.ubigeo}</div>}
                    </div>

                    <InputForm
                        name="address"
                        label="Dirección *"
                        value={formData.address}
                        error={errors.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        required
                        className="border-gray-200"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputForm
                            label="Número"
                            value={formData.number}
                            onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                            className="border-gray-200"
                        />
                        <InputForm
                            label="Referencia"
                            value={formData.reference}
                            onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                            className="border-gray-200"
                        />
                    </div>

                    {shippingOptions.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Método de envío</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {shippingOptions.map((option) => (
                                    <OptionCard
                                        key={option.type}
                                        title={option.deliveryType}
                                        price={option.price}
                                        description={option.description}
                                        selected={selectedOption === option.type}
                                        onSelect={() => {
                                            setSelectedOption(option.type);
                                            setEnvio(option.price);
                                            setErrors(prev => ({ ...prev, shipping: '' }));
                                        }}
                                    />
                                ))}
                            </div>
                            {selectedOption && shippingOptions.length > 0 && (
                                <div className="space-y-3 mt-4">
                                    {shippingOptions
                                        .find((o) => o.type === selectedOption)
                                        ?.characteristics?.map((char, index) => (
                                            <div key={`char-${index}`} className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                                                <div className="w-5 flex-shrink-0">
                                                    <InfoIcon className="customtext-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium customtext-neutral-dark">{char}</p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    {!noContinue && (
                        <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-4 mt-6">
                            <ButtonSecondary type="button" onClick={() => window.history.back()} className="w-full md:w-auto">
                                Regresar
                            </ButtonSecondary>
                            <ButtonPrimary type="submit" loading={loading} className="w-full md:w-auto">
                                Continuar
                            </ButtonPrimary>
                        </div>
                    )}
                </form>
            </div>

            {/* Resumen de compra */}
            <div className="bg-[#F7F9FB] rounded-xl shadow-lg p-6 col-span-2 h-max">
                <h3 className="text-2xl font-bold pb-6">Resumen</h3>

                <div className="space-y-4 border-b-2 pb-6">
                    {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                            <img
                                src={`/storage/images/item/${item.image}`}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div>
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                                <p className="text-sm text-gray-600">S/ {Number2Currency(item.price)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-4 mt-6">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>S/ {Number2Currency(subTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>IGV (18%):</span>
                        <span>S/ {Number2Currency(igv)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Envío:</span>
                        <span>S/ {Number2Currency(envio)}</span>
                    </div>

                    <div className="pt-4 border-t-2">
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span>S/ {Number2Currency(totalFinal)}</span>
                        </div>
                    </div>

                    <ButtonPrimary onClick={handlePayment} className="w-full mt-6">
                        Ir a Pagar
                    </ButtonPrimary>

                    <p className="text-xs md:text-sm customtext-neutral-dark">
                            Al realizar tu pedido, aceptas los <a href="#" onClick={() => openModal(1)} className="customtext-primary font-bold">Términos y Condiciones</a>, y que nosotros usaremos sus datos personales de acuerdo con nuestra <a href="#" onClick={() => openModal(0)} className="customtext-primary font-bold">Política de Privacidad</a>.
                        </p>
                </div>
            </div>
        </div>
    );
}