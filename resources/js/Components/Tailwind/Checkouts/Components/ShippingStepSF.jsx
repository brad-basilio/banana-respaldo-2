import { useCallback, useEffect, useState, useRef } from "react";
import Number2Currency from "../../../../Utils/Number2Currency";
import ubigeoData from "../../../../../../storage/app/utils/ubigeo.json";
import DeliveryPricesRest from "../../../../Actions/DeliveryPricesRest";
import { processCulqiPayment } from "../../../../Actions/culqiPayment";
import { processMercadoPagoPayment } from "../../../../Actions/mercadoPagoPayment"
import ButtonPrimary from "./ButtonPrimary";
import ButtonSecondary from "./ButtonSecondary";
import InputForm from "./InputForm";
import SelectForm from "./SelectForm";
import OptionCard from "./OptionCard";
import { CheckCircleIcon, CircleX, InfoIcon } from "lucide-react";
import { Notify } from "sode-extend-react";
import { renderToString } from "react-dom/server";
import { debounce } from "lodash";
import { useUbigeo } from "../../../../Utils/useUbigeo";
import AsyncSelect from "react-select/async";
import PaymentModal from "./PaymentModal";
import UploadVoucherModalYape from "./UploadVoucherModalYape";
import UploadVoucherModalBancs from "./UploadVoucherModalBancs";
import { toast } from "sonner";
import Global from "../../../../Utils/Global";
import CouponsRest from "../../../../Actions/CouponsRest";
import Tippy from "@tippyjs/react";

const couponRest = new CouponsRest();

export default function ShippingStepSF({
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
    prefixes,
    ubigeos = [],
    contacts,
    totalPrice,
}) {
    const couponRef = useRef(null);
    const [coupon, setCoupon] = useState(null);
    const [selectedUbigeo, setSelectedUbigeo] = useState(null);
    const [defaultUbigeoOption, setDefaultUbigeoOption] = useState(null);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        lastname: user?.lastname || "",
        email: user?.email || "",
        phone_prefix: user?.phone_prefix || "51", //telf
        phone: user?.phone || "",   //telf
        department: user?.department || "",
        province: user?.province || "",
        district: user?.district || "",
        address: user?.address || "",
        number: user?.number || "",
        comment: user?.comment || "",
        /*reference: user?.reference || "",*/
        shippingOption: "delivery", // Valor predeterminado
        ubigeo: user?.ubigeo || null,
        invoiceType: user?.invoiceType || "boleta", // Nuevo campo para tipo de comprobante
        documentType: user?.documentType || "dni", 
        document: user?.dni || "", 
        businessName: user?.businessName || "", // Nuevo campo para Razón Social
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

    const getContact = (correlative) => {
    return (
            contacts.find((contact) => contact.correlative === correlative)
                ?.description || ""
        );
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Si cambia el tipo de comprobante, actualizar el tipo de documento por defecto
        if (name === "invoiceType") {
            setFormData(prev => ({
                ...prev,
                documentType: value === "factura" ? "ruc" : "dni",
                document: "",
                businessName: value === "factura" ? prev.businessName : ""
            }));
        }
    };

    // Estados para manejar los valores seleccionados
    // const [departamento, setDepartamento] = useState("");
    // const [provincia, setProvincia] = useState("");
    // const [distrito, setDistrito] = useState("");

    // Estados para las opciones dinámicas
    // const [departamentos, setDepartamentos] = useState([]);
    // const [provincias, setProvincias] = useState([]);
    // const [distritos, setDistritos] = useState([]);
    
    // Estado para el precio de envío
    const [shippingCost, setShippingCost] = useState(0);

    // Estado para el ubigeo
    const [loading, setLoading] = useState(false);
    const [shippingOptions, setShippingOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [costsGet, setCostsGet] = useState(null);
    const [errors, setErrors] = useState({});

    // Cargar los departamentos al iniciar el componente
    // useEffect(() => {
    //     const uniqueDepartamentos = [
    //         ...new Set(ubigeoData.map((item) => item.departamento)),
    //     ];
    //     setDepartamentos(uniqueDepartamentos);
    // }, []);
    const numericSubTotal = typeof subTotal === 'number' ? subTotal : parseFloat(subTotal) || 0;
    const numericIgv = typeof igv === 'number' ? igv : parseFloat(igv) || 0;
    const hasShippingFree = parseFloat(getContact("shipping_free"));
   
    const subFinal = numericSubTotal + numericIgv;
    
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
            
            const isFreeShipping = subFinal >= hasShippingFree;
            
            if (isFreeShipping) {
                options.push({
                    type: "free",
                    price: 0,
                    description: `Compra mayor a S/ ${hasShippingFree}`,
                    deliveryType: "Envío gratuito",
                });
            } else if (response.data.is_free) { // Si no aplica envío gratuito por monto, verifica otras opciones
                options.push({
                    type: "free",
                    price: 0,
                    description: response.data.standard.description,
                    deliveryType: response.data.standard.type,
                    characteristics: response.data.standard.characteristics,
                });
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

            // Solo muestra opción express si no es envío gratuito por monto
            if (response.data.express?.price > 0 && response.data.is_free && !isFreeShipping) {
                options.push({
                    type: "express",
                    price: response.data.express.price,
                    description: response.data.express.description,
                    deliveryType: response.data.express.type,
                    characteristics: response.data.express.characteristics,
                });
            }

            if (options.length === 0) {
                throw new Error("No hay opciones de envío disponibles");
            }

            setShippingOptions(options);
            setSelectedOption(options[0].type);
            setEnvio(options[0].price);
           
        } catch (error) {
            console.error("Error al obtener precios de envío:", error);
            toast.success('Sin cobertura', {
                description: `No realizamos envíos a esta ubicación`,
                icon: <CircleX className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: 'top-right',
            });
            
            setShippingOptions([]);
            setSelectedOption(null);
            setEnvio(0);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (selectedUbigeo) {
            handleUbigeoChange(selectedUbigeo);
        }
    }, [cart, subTotal]);

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

    // Filtrar provincias cuando se selecciona un departamento
    // useEffect(() => {
    //     if (departamento) {
    //         const filteredProvincias = [
    //             ...new Set(
    //                 ubigeoData
    //                     .filter((item) => item.departamento === departamento)
    //                     .map((item) => item.provincia)
    //             ),
    //         ];
    //         setProvincias(filteredProvincias);
    //         setProvincia(""); // Reiniciar provincia
    //         setDistrito(""); // Reiniciar distrito
    //         setDistritos([]); // Limpiar distritos
    //         setFormData((prev) => ({
    //             ...prev,
    //             department: departamento,
    //             province: "",
    //             district: "",
    //         }));
    //     }
    // }, [departamento]);

    // Filtrar distritos cuando se selecciona una provincia
    // useEffect(() => {
    //     if (provincia) {
    //         const filteredDistritos = ubigeoData
    //             .filter(
    //                 (item) =>
    //                     item.departamento === departamento &&
    //                     item.provincia === provincia
    //             )
    //             .map((item) => item.distrito);
    //         setDistritos(filteredDistritos);
    //         setDistrito(""); // Reiniciar distrito
    //         setFormData((prev) => ({
    //             ...prev,
    //             province: provincia,
    //             district: "",
    //         }));
    //     }
    // }, [provincia]);

    // Consultar el precio de envío cuando se selecciona un distrito
    // useEffect(() => {
    //     if (distrito) {
    //         setFormData((prev) => ({ ...prev, district: distrito }));

    //         // Llamar a la API para obtener el precio de envío
    //         const fetchShippingCost = async () => {
    //             try {
    //                 const response = await DeliveryPricesRest.getShippingCost({
    //                     department: departamento,
    //                     district: distrito,
    //                 });
    //                 setEnvio(response.data.price);
    //                 if (Number2Currency(response.data.price) > 0) {
    //                     setSelectedOption("express");
    //                 } else {
    //                     setSelectedOption("free");
    //                 }
    //             } catch (error) {
    //                 console.error("Error fetching shipping cost:", error);
    //                 alert("No se pudo obtener el costo de envío.");
    //             }
    //         };

    //         fetchShippingCost();
    //     }
    // }, [distrito]);

    const handlePayment = async (e) => {
        
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        if (!user) {
            toast.error("Acceso requerido", {
                description: `Debe iniciar sesión para continuar.`,
                icon: <UserRoundX className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: "bottom-center",
            });


            return;
        }

        if (
            !formData.name ||
            !formData.lastname ||
            !formData.email ||
            !formData.address ||
            !formData.phone ||
            !formData.ubigeo || 
            !formData.number 
        ) {
            Notify.add({
                icon: "/assets/img/icon.svg",
                title: "Campos incompletos",
                body: "Complete todos los campos obligatorios",
                type: "danger",
            });

            return;
        }

        if (!selectedOption) {
            Notify.add({
                icon: "/assets/img/icon.svg",
                title: "Seleccione envío",
                body: "Debe elegir un método de envío",
                type: "danger",
            });
            return;
        }

        if (!window.MercadoPago) {
            console.error("❌ MercadoPago aún no se ha cargado.")
            return
        }

        try {
            const request = {
                user_id: user?.id || "",
                name: formData?.name || "",
                lastname: formData?.lastname || "",
                fullname: `${formData?.name} ${formData?.lastname}`,
                phone_prefix: formData?.phone_prefix || "51",
                email: formData?.email || "",
                phone: `${formData.phone_prefix}${formData.phone}`,
                country: "Perú",
                department: formData?.department || "",
                province: formData?.province || "",
                district: formData?.district || "",
                ubigeo: formData?.ubigeo || "",
                address: formData?.address || "",
                number: formData?.number || "",
                comment: formData?.comment || "",
                /*reference: formData?.reference || "",*/
                amount: totalFinal || 0,
                delivery: envio,
                cart: cart,
                invoiceType: formData.invoiceType || "",
                documentType: formData.documentType || "",
                document: formData.document || "",
                businessName: formData.businessName || "",
            };
           
            const response = await processMercadoPagoPayment(request)
            const data = response;
            
            if (data.status) {
                setSale(data.sale);
                setDelivery(data.delivery);
                setCode(data.code);
                
            } else {
                Notify.add({
                    icon: "/assets/img/icon.svg",
                    title: "Error en el Pago",
                    body: "El pago ha sido rechazado",
                    type: "danger",
                });
            }
        } catch (error) {
            console.log(error);
            Notify.add({
                icon: "/assets/img/icon.svg",
                title: "Error en el Pago",
                body: "No se llegó a procesar el pago",
                type: "danger",
            });
        }
    };

    useEffect(() => {
        const htmlTemplate = (data) => {
          const prefix = data.element.dataset.code
          const flag = data.element.dataset.flag
          return renderToString(<span>
            <span className="inline-block w-8 font-emoji text-center">{flag}</span>
            <b className="me-1">{data.text}</b>
            <span className="text-sm text-opacity-20">{prefix}</span>
          </span>)
        }
        $('.select2-prefix-selector').select2({
          dropdownCssClass: 'py-1',
          containerCssClass: '!border !border-gray-300 !rounded p-2 !h-[42px]',
          arrowCssClass: '!text-primary top-1/2 -translate-y-1/2"',
          //minimumResultsForSearch: -1,
          templateResult: function (data) {
            if (!data.id) {
              return data.text;
            }
            var $container = $(htmlTemplate(data));
            return $container;
          },
          templateSelection: function (data) {
            if (!data.id) {
              return data.text;
            }
            var $container = $(htmlTemplate(data));
            return $container;
          },
          matcher: function (params, data) {
            if (!params.term || !data.element) return data;
      
            const country = data.element.dataset.country || '';
            const text = data.text || '';
      
            if (country.toLowerCase().includes(params.term.toLowerCase()) ||
                text.toLowerCase().includes(params.term.toLowerCase())) {
              return data;
            }
      
            return null;
          }
        });
    }, [formData.phone_prefix])


    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [showVoucherModalBancs, setShowVoucherModalBancs] = useState(false);
    const [currentPaymentMethod, setCurrentPaymentMethod] = useState(null);
    const [paymentRequest, setPaymentRequest] = useState(null);

    const handleContinueClick = (e) => {
        e.preventDefault();
        
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        // if (!user) {
        //     toast.success('Iniciar Sesión', {
        //         description: `Se requiere que incie sesión para realizar la compra`,
        //         icon: <CircleX className="h-5 w-5 text-red-500" />,
        //         duration: 3000,
        //         position: 'top-right',
        //     });
        //     return;
        // }

        if (!validateForm()) {
            return;
        }
    
        if (!selectedOption) {
            toast.success('Seleccione envío', {
                description: `Debe elegir un método de envío`,
                icon: <CircleX className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: 'top-right',
            });
            return;
        }
        
        setShowPaymentModal(true);
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Validación de campos
        if (!formData.name) newErrors.name = "Nombre es requerido";
        if (!formData.lastname) newErrors.lastname = "Apellido es requerido";
        if (!formData.email) newErrors.email = "Email es requerido";
        if (!formData.phone) newErrors.phone = "Teléfono es requerido";
        if (!formData.ubigeo) newErrors.ubigeo = "Ubigeo es requerido";
        if (!formData.address) newErrors.address = "Dirección es requerida";
        if (!formData.document) newErrors.document = "Documento es requerido";
        if (!formData.number) newErrors.number = "Numero es requerido";
    
        setErrors(newErrors);
    
        // Función de smooth scroll personalizada
        const smoothScroll = (targetElement, duration = 800) => {
            const targetPosition =
                targetElement.getBoundingClientRect().top +
                window.pageYOffset -
                window.innerHeight / 2 +
                targetElement.offsetHeight / 2;
        
            const startPosition = window.pageYOffset;
            let startTime = null;
        
            const animation = (currentTime) => {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
        
                const easeInOutQuad = (t, b, c, d) => {
                    t /= d / 2;
                    if (t < 1) return (c / 2) * t * t + b;
                    t--;
                    return (-c / 2) * (t * (t - 2) - 1) + b;
                };
        
                const run = easeInOutQuad(
                    timeElapsed,
                    startPosition,
                    targetPosition - startPosition,
                    duration
                );
                window.scrollTo(0, run);
        
                if (timeElapsed < duration) {
                    requestAnimationFrame(animation);
                } else {
                    if (
                        ["INPUT", "SELECT", "TEXTAREA"].includes(
                            targetElement.tagName
                        )
                    ) {
                        targetElement.focus();
                    }
                }
            };
        
            requestAnimationFrame(animation);
        };
    
        // Si hay errores, hacer scroll al primero
        if (Object.keys(newErrors).length > 0) {
            const firstErrorKey = Object.keys(newErrors)[0];
            
            setTimeout(() => {
                let targetElement = null;
                
                if (firstErrorKey === 'ubigeo') {
                    targetElement = document.getElementById('ubigeo-select-container');
                } else if (firstErrorKey === 'phone_prefix') {
                    targetElement = document.querySelector('.select2-prefix-selector')?.parentElement;
                } else {
                    targetElement = document.querySelector(`[name="${firstErrorKey}"]`);
                }
    
                if (targetElement) {
                    // Aplicar clase de error temporal
                    targetElement.classList.add('highlight-error');
                    setTimeout(() => targetElement.classList.remove('highlight-error'), 2000);
                    
                    // Scroll personalizado
                    smoothScroll(targetElement, 600);
                }
            }, 100);
        }
    
        return Object.keys(newErrors).length === 0;
    };

    const handlePaymentComplete = async (paymentMethod) => {  // Cambiado de 'method' a 'paymentMethod'
        try {
            
            setShowPaymentModal(false);
            setCurrentPaymentMethod(paymentMethod);

            if (paymentMethod === "tarjeta") {
                // Procesar pago con tarjeta (MercadoPago)
                if (!window.MercadoPago) {
                    console.error("❌ MercadoPago aún no se ha cargado.")
                    return
                }

                const request = {
                    user_id: user?.id || "",
                    name: formData?.name || "",
                    lastname: formData?.lastname || "",
                    fullname: `${formData?.name} ${formData?.lastname}`,
                    phone_prefix: formData?.phone_prefix || "51",
                    email: formData?.email || "",
                    phone: `${formData.phone_prefix}${formData.phone}`,
                    country: "Perú",
                    department: formData?.department || "",
                    province: formData?.province || "",
                    district: formData?.district || "",
                    ubigeo: formData?.ubigeo || "",
                    address: formData?.address || "",
                    number: formData?.number || "",
                    comment: formData?.comment || "",
                    /*reference: formData?.reference || "",*/
                    amount: totalPrice || 0,
                    delivery: envio,
                    cart: cart,
                    invoiceType: formData.invoiceType || "",
                    documentType: formData.documentType || "",
                    document: formData.document || "",
                    businessName: formData.businessName || "",
                    payment_method: paymentMethod || null,
                };
                
                try {
                    const response = await processMercadoPagoPayment(request)
                    const data = response;
                    
                    if (data.status) {
                        setSale(data.sale);
                        setDelivery(data.delivery);
                        setCode(data.code);
                        
                    } else {
                        toast.success('Error en el Pago', {
                            description: `El pago ha sido rechazado`,
                            icon: <CircleX className="h-5 w-5 text-red-500" />,
                            duration: 3000,
                            position: 'top-right',
                        });
                    }
                } catch (error) {
                    console.log(error);
                    toast.success('Error en el Pago', {
                        description: `No se llegó a procesar el pago`,
                        icon: <CircleX className="h-5 w-5 text-red-500" />,
                        duration: 3000,
                        position: 'top-right',
                    });
                }
            }else if(paymentMethod === "yape") {

                const request = {
                    user_id: user?.id || "",
                    name: formData?.name || "",
                    lastname: formData?.lastname || "",
                    fullname: `${formData?.name} ${formData?.lastname}`,
                    phone_prefix: formData?.phone_prefix || "51",
                    email: formData?.email || "",
                    phone: `${formData.phone_prefix}${formData.phone}`,
                    country: "Perú",
                    department: formData?.department || "",
                    province: formData?.province || "",
                    district: formData?.district || "",
                    ubigeo: formData?.ubigeo || "",
                    address: formData?.address || "",
                    number: formData?.number || "",
                    comment: formData?.comment || "",
                    amount: totalFinal || 0,
                    delivery: envio,
                    cart: cart,
                    invoiceType: formData.invoiceType || "",
                    documentType: formData.documentType || "",
                    document: formData.document || "",
                    businessName: formData.businessName || "",
                    payment_method: paymentMethod || null,
                    payment_proof: null, // Se actualizará después con el voucher
                };

                setPaymentRequest(request);
                setShowVoucherModal(true);
            }else if(paymentMethod === "transferencia") {

                const request = {
                    user_id: user?.id || "",
                    name: formData?.name || "",
                    lastname: formData?.lastname || "",
                    fullname: `${formData?.name} ${formData?.lastname}`,
                    phone_prefix: formData?.phone_prefix || "51",
                    email: formData?.email || "",
                    phone: `${formData.phone_prefix}${formData.phone}`,
                    country: "Perú",
                    department: formData?.department || "",
                    province: formData?.province || "",
                    district: formData?.district || "",
                    ubigeo: formData?.ubigeo || "",
                    address: formData?.address || "",
                    number: formData?.number || "",
                    comment: formData?.comment || "",
                    amount: totalFinal || 0,
                    delivery: envio,
                    cart: cart,
                    invoiceType: formData.invoiceType || "",
                    documentType: formData.documentType || "",
                    document: formData.document || "",
                    businessName: formData.businessName || "",
                    payment_method: paymentMethod || null,
                    payment_proof: null, // Se actualizará después con el voucher
                };
                setPaymentRequest(request);
                setShowVoucherModalBancs(true);
            }
        } catch (error) {
            console.error("Error en el pago:", error);
            toast.success('Error en el Pago', {
                description: `No se llegó a procesar el pago`,
                icon: <CircleX className="h-5 w-5 text-red-500" />,
                duration: 3000,
                position: 'top-right',
            });
        }
    };

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

    const customStyles = {
        control: (provided, state) => ({
          ...provided,
          padding: '0.5rem',
          borderColor: state.isFocused ? '#d1d5db' : '#d1d5db', // gray-300
          borderRadius: '0.75rem', // rounded-xl
          boxShadow: 'none',
          '&:hover': {
            borderColor: '#9ca3af', // gray-400
          },
        }),
        input: (provided) => ({
          ...provided,
          color: '#374151', // gray-700
        }),
        option: (provided, state) => ({
          ...provided,
          backgroundColor: state.isSelected ? '#3b82f6' : 'white', // blue-500 when selected
          color: state.isSelected ? 'white' : '#374151', // gray-700
          '&:hover': {
            backgroundColor: '#e5e7eb', // gray-200
          },
        }),
        singleValue: (provided) => ({
          ...provided,
          color: '#374151', // gray-700
        }),
      };

    const planDiscount = totalFinal * 0;

    const couponDiscount =
        ((totalFinal - planDiscount) * (coupon?.amount || 0)) / 100;

    const onCouponApply = (e) => {
        e.preventDefault();
        const coupon = (couponRef.current.value || "").trim().toUpperCase();
        if (!coupon) return;
        couponRest
            .save({
                coupon,
                amount: totalFinal,
                email: "basiliohinostroza2003bradneve@gmail.com",
            })
            .then((result) => {
              
                if (result && result.id) { 
                    setCoupon(result); 
                } else {
                    setCoupon(null);
                }
                
            });
            
    };

    const onCouponKeyDown = (e) => {
        if (e.key == "Enter") onCouponApply(e);
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-y-8 lg:gap-8 ">
                <div className="lg:col-span-3">
                    {/* Formulario */}
                    <form
                        className="space-y-6 bg-[#f9f9f9] py-6 px-4 sm:px-6 rounded-2xl font-font-general"
                        onSubmit={(e) => e.preventDefault()}
                    >
                        <div className="sectionInformation space-y-3.5">
                            <h3 className={`block text-xl 2xl:text-2xl font-bold mb-4 customtext-neutral-dark `}>
                                Información del contacto
                            </h3>
                            <div className="grid lg:grid-cols-2 gap-4">
                                {/* Nombres */}
                            
                                <InputForm
                                    type="text"
                                    label="Nombres"
                                    name="name"
                                    value={formData.name}
                                    error={errors.name}
                                    onChange={handleChange}
                                    placeholder="Nombres"
                                    required
                                />
                                {/* Apellidos */}
                                <InputForm
                                    label="Apellidos"
                                    type="text"
                                    name="lastname"
                                    value={formData.lastname}
                                    error={errors.lastname}
                                    onChange={handleChange}
                                    placeholder="Apellidos"
                                    required
                                />
                            </div>
                    
                            <div className="grid lg:grid-cols-2 gap-4 ">
                            
                                {/* Correo electrónico */}
                                <InputForm
                                    label="Correo electrónico"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    error={errors.email}
                                    onChange={handleChange}
                                    placeholder="Ej. hola@gmail.com"
                                    required
                                />

                                {/* Celular */}
                                <div className="w-full">
                                    <label htmlFor="phone" className="block text-sm mb-1">
                                        Celular <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="flex gap-2 w-full">
                                        <select
                                            className="select2-prefix-selector max-w-[120px] p-2 border border-gray-300 rounded"
                                            onChange={(e) => setSelectedPrefix(e.target.value)}
                                            name="phone_prefix"
                                            value={formData.phone_prefix}
                                            styles={customStyles}
                                            classNamePrefix="select"
                                        >
                                            <option value="">Selecciona un país</option>
                                            {
                                            prefixes
                                                .sort((a, b) => a.country.localeCompare(b.country))
                                                .map((prefix, index) => (
                                                <option
                                                    key={index}
                                                    value={prefix.realCode}
                                                    data-code={prefix.beautyCode}
                                                    data-flag={prefix.flag}
                                                    data-country={prefix.country}
                                                >
                                                </option>
                                                ))
                                            }
                                        </select>
                                        <InputForm
                                            type="text"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            error={errors.phone}
                                            onChange={handleChange}
                                            placeholder="000 000 000"
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="bg-[#66483966] py-[0.6px]"></div>    

                        <div className="sectionDelivery space-y-3.5">
                            
                            <h3 className={`block text-xl 2xl:text-2xl font-bold mb-4 customtext-neutral-dark`}>
                                Dirección de envío
                            </h3>

                            <div id="ubigeo-select-container" className="form-group">
                                <label
                                    className={`block text-sm 2xl:text-base mb-1 customtext-neutral-dark `}
                                >
                                    Ubicación de entrega (Distrito)
                                </label>
                                <AsyncSelect
                                    name="ubigeo"
                                    cacheOptions
                                    value={selectedUbigeo}
                                    loadOptions={loadOptions}
                                    onChange={(selected) => {
                                        setSelectedUbigeo(selected);
                                        handleUbigeoChange(selected);
                                    }}
                                    placeholder="Buscar por distrito | provincia | departamento ..."
                                    loadingMessage={() => "Buscando ubicaciones..."}
                                    noOptionsMessage={({ inputValue }) =>
                                        inputValue.length < 3
                                            ? "Ingrese al menos 3 caracteres..."
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
                                    components={{
                                    ClearIndicator: (props) => (
                                        <div {...props.innerProps} className="p-1 cursor-pointer">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-red-400 hover:text-red-600"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                        </div>
                                    ),
                                    }}
                                />
                                {errors.ubigeo && <div className="text-red-500 text-sm mt-1">{errors.ubigeo}</div>}
                            </div>

                            {/* Departamento */}
                            {/* <SelectForm
                                label="Departamento"
                                options={departamentos}
                                placeholder="Selecciona un Departamento"
                                onChange={(value) => {
                                    setDepartamento(value);
                                    setFormData((prev) => ({
                                        ...prev,
                                        department: departamento,
                                    }));
                                }}
                            /> */}

                            {/* Provincia */}
                            {/* <SelectForm
                                disabled={!departamento}
                                label="Provincia"
                                options={provincias}
                                placeholder="Selecciona una Provincia"
                                onChange={(value) => {
                                    setProvincia(value);
                                    setFormData((prev) => ({
                                        ...prev,
                                        province: provincia,
                                    }));
                                }}
                            /> */}

                            {/* Distrito */}

                            {/* <SelectForm
                                disabled={!provincia}
                                label="Distrito"
                                options={distritos}
                                placeholder="Selecciona un Distrito"
                                onChange={(value) => {
                                    setDistrito(value);
                                    setFormData((prev) => ({
                                        ...prev,
                                        district: distrito,
                                    }));
                                }}
                            /> */}

                            {/* Dirección */}
                            <InputForm
                                label="Avenida / Calle / Jirón"
                                type="text"
                                name="address"
                                value={formData.address}
                                error={errors.address}
                                onChange={handleChange}
                                placeholder="Ingresa el nombre de la calle"
                                required
                            />

                            <div className="grid lg:grid-cols-2 gap-4">
                                <InputForm
                                    label="Número"
                                    type="text"
                                    name="number"
                                    value={formData.number}
                                    error={errors.number}
                                    onChange={handleChange}
                                    placeholder="Ingresa el número de la calle"
                                    required
                                />

                                <InputForm
                                    label="Dpto./ Interior/ Piso/ Lote/ Bloque (opcional)"
                                    type="text"
                                    name="comment"
                                    value={formData.comment}
                                    onChange={handleChange}
                                    placeholder="Ej. Casa 3, Dpto 101"
                                />
                            </div>

                            {/* Referencia */}

                            {/* <InputForm
                                label="Referencia"
                                type="text"
                                name="reference"
                                value={formData.reference}
                                onChange={handleChange}
                                placeholder="Ejem. Altura de la avenida..."
                            /> */}
                        
                            {shippingOptions.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="block text-xl 2xl:text-2xl font-bold mb-4 customtext-neutral-dark">
                                        Método de envío
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {shippingOptions.map((option) => (
                                            <OptionCard
                                                key={option.type}
                                                title={
                                                    option.type === "free"
                                                        ? option.deliveryType
                                                        : option.type === "express"
                                                        ? option.deliveryType
                                                        : option.type === "agency"
                                                        ? option.deliveryType
                                                        : option.deliveryType
                                                }
                                                price={option.price}
                                                description={option.description}
                                                selected={
                                                    selectedOption === option.type
                                                }
                                                onSelect={() => {
                                                    setSelectedOption(option.type);
                                                    setEnvio(option.price);
                                                }}
                                            />
                                        ))}
                                    </div>
                                    {console.log(
                                        shippingOptions.find(
                                            (o) => o.type === selectedOption
                                        )
                                    )}

                                    {selectedOption && shippingOptions.length > 0 && (
                                        <div className="space-y-4 mt-4">
                                            {shippingOptions
                                                .find((o) => o.type === selectedOption)
                                                ?.characteristics?.map(
                                                    (char, index) => (
                                                        <div
                                                            key={`char-${index}`}
                                                            className="flex items-start gap-4 bg-[#F7F9FB] p-4 rounded-xl"
                                                        >
                                                            <div className="w-5 flex-shrink-0">
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="20"
                                                                    height="20"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    className="lucide lucide-info customtext-primary"
                                                                >
                                                                    <circle
                                                                        cx="12"
                                                                        cy="12"
                                                                        r="10"
                                                                    />
                                                                    <path d="M12 16v-4" />
                                                                    <path d="M12 8h.01" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium customtext-neutral-dark">
                                                                    {char}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="bg-[#66483966] py-[0.6px]"></div>      

                        {/* Tipo de comprobante */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium customtext-neutral-dark">
                                Tipo de comprobante
                            </label>
                            <div className="flex gap-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio"
                                        name="invoiceType"
                                        value="boleta"
                                        checked={formData.invoiceType === "boleta"}
                                        onChange={handleChange}
                                    />
                                    <span className="ml-2">Boleta</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio"
                                        name="invoiceType"
                                        value="factura"
                                        checked={formData.invoiceType === "factura"}
                                        onChange={handleChange}
                                    />
                                    <span className="ml-2">Factura</span>
                                </label>
                            </div>
                        </div>

                        {/* Documento */}
                        <InputForm
                                label={formData.documentType === "dni" ? "DNI" : "RUC"}
                                type="text"
                                name="document"
                                value={formData.document}
                                error={errors.document}
                                onChange={handleChange}
                                placeholder={`Ingrese su ${formData.documentType === "dni" ? "DNI" : "RUC"}`}
                                maxLength={formData.documentType === "dni" ? "8" : "11"}
                                required
                        />
                        
                        {/* Razón Social (solo para factura) */}
                        {formData.invoiceType === "factura" && (
                            <InputForm
                                label="Razón Social"
                                type="text"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                placeholder="Ingrese la razón social"
                            />
                        )}    

                    </form>
                </div>
                {/* Resumen de compra */}
                <div className="bg-[#F7F9FB] rounded-xl shadow-lg p-6 col-span-2 h-max font-font-general">
                    <h3 className="text-2xl font-bold pb-6 customtext-neutral-dark">Resumen de compra</h3>

                    <div className="space-y-6 border-b-2 pb-6">
                        {cart.map((item, index) => (
                            <div key={item.id} className="rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-0 rounded-xl">
                                        <img
                                            src={`/storage/images/item/${item.image}`}
                                            alt={item.name}
                                            className="w-20 h-20 object-cover rounded  "
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold customtext-neutral-dark text-base 2xl:text-lg mb-2">
                                            {item.name}
                                        </h3>

                                        <p className="text-sm customtext-neutral-light">
                                            Color:{" "}
                                            <span className="customtext-neutral-dark">
                                                {item.color}
                                            </span>
                                        </p>
                                        <p className="text-sm customtext-neutral-light">
                                            Cantidad:{" "}
                                            <span className="customtext-neutral-dark">
                                                {item.quantity}{" "}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {!coupon && (
                        <div className="mt-6 flex">
                            <input
                                ref={couponRef}
                                type="text"
                                placeholder="Código de cupón"
                                className="w-full rounded-l-md border border-gray-300 p-2 px-4 text-sm outline-none uppercase focus:border-[#C5B8D4]"
                                value={coupon?.name}
                                onKeyDown={onCouponKeyDown}
                                disabled={loading}
                            />
                            <button
                                className="rounded-r-md bg-[#5339B1] px-4 py-2 text-sm text-white"
                                type="button"
                                onClick={onCouponApply}
                                disabled={loading}
                            >
                                Aplicar
                            </button>
                        </div>
                    )}

                    <div className="space-y-4 mt-6">
                        <div className="flex justify-between">
                            <span className="customtext-neutral-dark">
                                Subtotal
                            </span>
                            <span className="font-semibold">
                                S/ {Number2Currency(subTotal)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="customtext-neutral-dark">IGV</span>
                            <span className="font-semibold">
                                S/ {Number2Currency(igv)}
                            </span>
                        </div>
                        {coupon && (
                            <div className="mb-2 mt-2 flex justify-between items-center border-b pb-2 text-sm font-bold">
                                <span>
                                    Cupón aplicado{" "}
                                    <Tippy content="Eliminar">
                                        <i
                                            className="mdi mdi-close text-red-500 cursor-pointer"
                                            onClick={() =>
                                                setCoupon(null)
                                            }
                                        ></i>
                                    </Tippy>
                                    <small className="block text-xs font-light">
                                        {coupon.name}{" "}
                                        <Tippy
                                            content={
                                                coupon.description
                                            }
                                        >
                                            <i className="mdi mdi-information-outline ms-1"></i>
                                        </Tippy>{" "}
                                        (-
                                        {Math.round(
                                            coupon.amount * 100
                                        ) / 100}
                                        %)
                                    </small>
                                </span>
                                <span>
                                    S/ -
                                    {Number2Currency(
                                        couponDiscount
                                    )}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="customtext-neutral-dark">Envío</span>
                            <span className="font-semibold">
                                {/* S/ {Number2Currency(envio)} */}
                                {hasShippingFree != null && subFinal >= hasShippingFree ? (
                                    <span className="customtext-neutral-dark">Gratis (Compra mayor a S/{hasShippingFree})</span>
                                ) : (
                                    `S/ ${Number2Currency(envio)}`
                                )}
                            </span>
                        </div>
                        <div className="py-3 border-y-2 mt-6">
                            <div className="flex justify-between font-bold text-[20px] items-center">
                                <span>Total</span>
                                <span>S/ {Number2Currency(totalFinal)}</span>
                            </div>
                        </div>
                        <div className="space-y-2 pt-4">
                            <ButtonPrimary className={'payment-button'}
                                // onClick={() => {
                                //     if (validateForm()) {
                                //         setShowPaymentModal(true);
                                //     }
                                // }}
                                onClick={handleContinueClick}
                            >
                                {" "}
                                Continuar
                            </ButtonPrimary>
                            <div id="mercadopago-button-container" ></div>
                            {/* style={{ display: "none" }} */}
                            <ButtonSecondary onClick={noContinue}>
                                {" "}
                                Cancelar
                            </ButtonSecondary>
                        </div>
                        <div>
                            <p className="text-sm customtext-neutral-dark">
                                Al realizar tu pedido, aceptas los 
                                <a className="customtext-primary font-bold">
                                    Términos y Condiciones
                                </a>
                                , y que nosotros usaremos sus datos personales de
                                acuerdo con nuestra 
                                <a className="customtext-primary font-bold">
                                    Política de Privacidad
                                </a>
                                .
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <PaymentModal
                isOpen={showPaymentModal}
                contacts={contacts}
                onClose={() => setShowPaymentModal(false)}
                onPaymentComplete={handlePaymentComplete}
                
            />

            <UploadVoucherModalYape
                isOpen={showVoucherModal}
                cart={cart}
                subTotal={subTotal}
                igv={igv}
                totalFinal={totalFinal}
                envio={envio}
                request={paymentRequest}
                onClose={() => setShowVoucherModal(false)}
                paymentMethod={currentPaymentMethod}
            />

            <UploadVoucherModalBancs
                isOpen={showVoucherModalBancs}
                cart={cart}
                subTotal={subTotal}
                igv={igv}
                totalFinal={totalFinal}
                envio={envio}
                contacts={contacts}
                request={paymentRequest}
                onClose={() => setShowVoucherModalBancs(false)}
                paymentMethod={currentPaymentMethod}
            />

        </>
    );
}
