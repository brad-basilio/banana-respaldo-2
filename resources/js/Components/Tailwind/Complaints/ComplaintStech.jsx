import { useEffect, useRef, useState } from "react";
import InputForm from "../Checkouts/Components/InputForm";
import ubigeoData from "../../../../../storage/app/utils/ubigeo.json";
import SelectForm from "../Checkouts/Components/SelectForm";
import CustomCaptcha from "./CustomCaptcha";
import ThankYouPage from "./ThankYouPage";

import ReactModal from "react-modal";
import HtmlContent from "../../../Utils/HtmlContent";
import { Send, X, FileText, User, MapPin, Package, AlertTriangle, Shield } from "lucide-react";
import { toast } from "sonner";
export default function ComplaintSimple({ generals = [] }) {
    const [messageCaptcha, setMessageCaptcha] = useState("");
    const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [showThankYou, setShowThankYou] = useState(false);
    const [submittedData, setSubmittedData] = useState(null);
    
    // Referencia para el captcha
    const captchaRef = useRef();
    
    const [formData, setFormData] = useState({
        nombre: "",
        tipo_documento: "RUC",
        numero_identidad: "",
        celular: "",
        correo_electronico: "",
        departamento: "",
        provincia: "",
        distrito: "",
        direccion: "",
        tipo_producto: "",
        monto_reclamado: "",
        descripcion_producto: "",
        tipo_reclamo: "",
        fecha_ocurrencia: "",
        numero_pedido: "",
        detalle_reclamo: "",
        acepta_terminos: false,
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    // Función para resetear el formulario
    const resetForm = () => {
        setFormData({
            nombre: "",
            tipo_documento: "RUC",
            numero_identidad: "",
            celular: "",
            correo_electronico: "",
            departamento: "",
            provincia: "",
            distrito: "",
            direccion: "",
            tipo_producto: "",
            monto_reclamado: "",
            descripcion_producto: "",
            tipo_reclamo: "",
            fecha_ocurrencia: "",
            numero_pedido: "",
            detalle_reclamo: "",
            acepta_terminos: false,
        });
        setDepartamento("");
        setProvincia("");
        setDistrito("");
        setIsCaptchaVerified(false);
        setCaptchaToken(null);
        setMessageCaptcha("");
        
        // Resetear el captcha usando la referencia
        if (captchaRef.current) {
            captchaRef.current.reset();
        }
    };

    // Función para manejar la verificación del captcha
    const handleCaptchaVerify = (isVerified, token) => {
        setIsCaptchaVerified(isVerified);
        setCaptchaToken(token);
        if (isVerified) {
            setMessageCaptcha(""); // Limpiar cualquier mensaje de error
        }
    };

    // Función para volver al formulario desde la página de agradecimiento
    const handleBackToForm = () => {
        setShowThankYou(false);
        setSubmittedData(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        
        if (!isCaptchaVerified || !captchaToken) {
            setMessageCaptcha("Por favor, completa la verificación de seguridad.");
            setLoading(false);
            return;
        }

        // Limpiar mensaje de error del captcha
        setMessageCaptcha("");

        const updatedFormData = {
            ...formData,
            captcha_verified: true,
            recaptcha_token: captchaToken, // Enviar como recaptcha_token para compatibilidad con backend
        };
        fetch("/api/complaints", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedFormData),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.type === "success") {
                    // Guardar los datos enviados para mostrar en la página de agradecimiento
                    setSubmittedData(formData);
                    setShowThankYou(true);
                    resetForm(); // Resetear el formulario
                    setLoading(false);
                }
                else {
                    toast.error("Solicitud rechazada", {
                        description: `Lo sentimos, no se envió su solicitud.`,
                        icon: <Send className="h-5 w-5 text-red-500" />,
                        duration: 3000,
                        position: "bottom-center",
                    });
                    setLoading(false);

                }
            })
            .catch((error) => {
                toast.error("Solicitud rechazada", {
                    description: error || `Lo sentimos, no se envió su solicitud.`,
                    icon: <Send className="h-5 w-5 text-red-500" />,
                    duration: 3000,
                    position: "bottom-center",
                });
                setLoading(false);
            });
    };

    // Estados para manejar los valores seleccionados
    const [departamento, setDepartamento] = useState("");
    const [provincia, setProvincia] = useState("");
    const [distrito, setDistrito] = useState("");

    // Estados para las opciones dinámicas
    const [departamentos, setDepartamentos] = useState([]);
    const [provincias, setProvincias] = useState([]);
    const [distritos, setDistritos] = useState([]);

    // Cargar los departamentos al iniciar el componente
    useEffect(() => {
        const uniqueDepartamentos = [
            ...new Set(ubigeoData.map((item) => item.departamento)),
        ];
        setDepartamentos(uniqueDepartamentos);
    }, []);

    // Filtrar provincias cuando se selecciona un departamento
    useEffect(() => {
        if (departamento) {
            const filteredProvincias = [
                ...new Set(
                    ubigeoData
                        .filter((item) => item.departamento === departamento)
                        .map((item) => item.provincia)
                ),
            ];
            setProvincias(filteredProvincias);
            setProvincia(""); // Reiniciar provincia
            setDistrito(""); // Reiniciar distrito
            setDistritos([]); // Limpiar distritos
            setFormData((prev) => ({
                ...prev,
                departamento: departamento,
                provincia: "",
                distrito: "",
            }));
        }
    }, [departamento]);

    // Filtrar distritos cuando se selecciona una provincia
    useEffect(() => {
        if (provincia) {
            const filteredDistritos = ubigeoData
                .filter(
                    (item) =>
                        item.departamento === departamento &&
                        item.provincia === provincia
                )
                .map((item) => item.distrito);
            setDistritos(filteredDistritos);
            setDistrito(""); // Reiniciar distrito
            setFormData((prev) => ({
                ...prev,
                provincia: provincia,
                distrito: "",
            }));
        }
    }, [provincia]);

    // Consultar el precio de envío cuando se selecciona un distrito
    useEffect(() => {
        if (distrito) {
            setFormData((prev) => ({ ...prev, distrito: distrito }));
        }
    }, [distrito]);

    const typesDocument = [
        { value: "ruc", label: "RUC" },
        { value: "dni", label: "DNI" },
        { value: "ce", label: "CE" },
        { value: "pasaporte", label: "Pasaporte" },
    ];
    const typesContract = [
        { value: "producto", label: "Producto" },
        { value: "servicio", label: "Servicio" },
    ];
    const typesClaim = [
        { value: "reclamo", label: "Reclamo" },
        { value: "queja", label: "Queja" },
    ];

    const [modalOpen, setModalOpen] = useState(false);

    const policyItems = {
        terms_conditions: "Términos y condiciones",
    };

    const openModal = (index) => setModalOpen(index);
    const closeModal = () => setModalOpen(null);
    
    // Si estamos mostrando la página de agradecimiento
    if (showThankYou && submittedData) {
        return (
            <ThankYouPage 
                complaintData={submittedData}
                onBackToForm={handleBackToForm}
            />
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 w-full px-4 py-8 font-font-general">
            <div className="max-w-5xl mx-auto">
                {/* Header mejorado */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-6">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold customtext-neutral-dark mb-4">
                        Libro de Reclamaciones
                    </h1>
                    <p className="text-lg customtext-neutral-light max-w-2xl mx-auto">
                        Tu opinión es importante para nosotros. Completa este formulario para registrar tu reclamo o queja.
                    </p>
                </div>

                <div className="bg-white shadow-2xl rounded-3xl border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-12">
                        {/* Identificación del Consumidor */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                                <div className="flex items-center justify-center w-12 h-12 bg-secondary rounded-full">
                                    <User className="w-6 h-6 customtext-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold customtext-neutral-dark">
                                        Identificación del Consumidor
                                    </h2>
                                    <p className="customtext-neutral-light">Proporciona tus datos personales</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <InputForm
                                        type="text"
                                        label="Nombres completos"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        placeholder="Ingresa tu nombre completo"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <SelectForm
                                        label="Tipo de documento"
                                        options={typesDocument}
                                        placeholder="Selecciona tu documento"
                                        value={formData.tipo_documento}
                                        onChange={(value) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                tipo_documento: value,
                                            }));
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <InputForm
                                        type="text"
                                        label="Número de documento"
                                        name="numero_identidad"
                                        value={formData.numero_identidad}
                                        onChange={handleChange}
                                        placeholder="Número de documento"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <InputForm
                                        type="tel"
                                        label="Número de celular"
                                        name="celular"
                                        value={formData.celular}
                                        onChange={handleChange}
                                        placeholder="+51 999 999 999"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <InputForm
                                        type="email"
                                        label="Correo electrónico"
                                        name="correo_electronico"
                                        value={formData.correo_electronico}
                                        onChange={handleChange}
                                        placeholder="tu@correo.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Ubicación */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                                <div className="flex items-center justify-center w-12 h-12 bg-secondary rounded-full">
                                    <MapPin className="w-6 h-6 customtext-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold customtext-neutral-dark">
                                        Ubicación
                                    </h2>
                                    <p className="customtext-neutral-light">Indica tu dirección actual</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <SelectForm
                                    label="Departamento"
                                    options={departamentos}
                                    placeholder="Selecciona departamento"
                                    onChange={(value) => {
                                        setDepartamento(value);
                                        setFormData((prev) => ({
                                            ...prev,
                                            departmento: value,
                                        }));
                                    }}
                                />

                                <SelectForm
                                    disabled={!departamento}
                                    label="Provincia"
                                    options={provincias}
                                    placeholder="Selecciona provincia"
                                    onChange={(value) => {
                                        setProvincia(value);
                                        setFormData((prev) => ({
                                            ...prev,
                                            provincia: value,
                                        }));
                                    }}
                                />

                                <SelectForm
                                    disabled={!provincia}
                                    label="Distrito"
                                    options={distritos}
                                    placeholder="Selecciona distrito"
                                    onChange={(value) => {
                                        setDistrito(value);
                                        setFormData((prev) => ({
                                            ...prev,
                                            distrito: value,
                                        }));
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <InputForm
                                    type="text"
                                    label="Dirección completa"
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleChange}
                                    placeholder="Av. Principal 123, Urbanización..."
                                />
                            </div>
                        </div>

                        {/* Identificación del bien contratado */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                                <div className="flex items-center justify-center w-12 h-12 bg-secondary rounded-full">
                                    <Package className="w-6 h-6 customtext-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold customtext-neutral-dark">
                                        Identificación del bien contratado
                                    </h2>
                                    <p className="customtext-neutral-light">Detalles del producto o servicio</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <SelectForm
                                    label="Tipo de contratación"
                                    options={typesContract}
                                    placeholder="¿Fue un producto o servicio?"
                                    onChange={(value) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            tipo_producto: value,
                                        }));
                                    }}
                                />

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <InputForm
                                            type="number"
                                            label="Monto reclamado (S/)"
                                            name="monto_reclamado"
                                            value={formData.monto_reclamado}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <InputForm
                                            type="text"
                                            label="Descripción del producto/servicio"
                                            name="descripcion_producto"
                                            value={formData.descripcion_producto}
                                            onChange={handleChange}
                                            placeholder="Nombre, modelo, código..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detalle del reclamo */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                                <div className="flex items-center justify-center w-12 h-12 bg-secondary rounded-full">
                                    <AlertTriangle className="w-6 h-6 customtext-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold customtext-neutral-dark">
                                        Detalle del reclamo
                                    </h2>
                                    <p className="customtext-neutral-light">Describe tu experiencia</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <SelectForm
                                    label="Tipo de solicitud"
                                    options={typesClaim}
                                    placeholder="¿Es un reclamo o queja?"
                                    onChange={(value) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            tipo_reclamo: value,
                                        }));
                                    }}
                                />

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <InputForm
                                            type="date"
                                            label="Fecha de ocurrencia"
                                            name="fecha_ocurrencia"
                                            value={formData.fecha_ocurrencia}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <InputForm
                                            type="text"
                                            label="Número de pedido (opcional)"
                                            name="numero_pedido"
                                            value={formData.numero_pedido}
                                            onChange={handleChange}
                                            placeholder="#PED-123456"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium customtext-neutral-dark mb-2">
                                        Detalle del reclamo o queja
                                    </label>
                                    <textarea
                                        name="detalle_reclamo"
                                        placeholder="Describe detalladamente tu reclamo o queja. Incluye fechas, nombres, referencias y cualquier información relevante..."
                                        className="w-full min-h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-none"
                                        value={formData.detalle_reclamo}
                                        onChange={handleChange}
                                        rows={5}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Mínimo 50 caracteres para una descripción completa
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Verificación y términos */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                                <div className="flex items-center justify-center w-12 h-12 bg-secondary rounded-full">
                                    <Shield className="w-6 h-6 customtext-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold customtext-neutral-dark">
                                        Verificación y términos
                                    </h2>
                                    <p className="customtext-neutral-light">Confirmación final</p>
                                </div>
                            </div>

                            {/* Términos y condiciones */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="terminos"
                                        name="acepta_terminos"
                                        className="mt-1 w-5 h-5 customtext-primary border-gray-300 rounded focus:ring-blue-500"
                                        checked={formData.acepta_terminos}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="terminos" className="text-sm customtext-neutral-dark leading-relaxed">
                                        Acepto y estoy de acuerdo con los{" "}
                                        <button
                                            type="button"
                                            onClick={() => openModal(0)}
                                            className="customtext-primary underline hover:text-blue-800 font-medium"
                                        >
                                            términos y condiciones
                                        </button>{" "}
                                        del libro de reclamaciones. Confirmo que la información proporcionada es veraz y completa.
                                    </label>
                                </div>
                            </div>

                            {/* Custom Captcha */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <CustomCaptcha 
                                    ref={captchaRef}
                                    onVerify={handleCaptchaVerify}
                                    error={messageCaptcha}
                                />
                            </div>
                        </div>

                        {/* Botón de envío mejorado */}
                        <div className="pt-8 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-4 justify-end">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 customtext-neutral-dark bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    Limpiar formulario
                                </button>
                                <button
                                    disabled={loading || !formData.acepta_terminos || !isCaptchaVerified}
                                    type="submit"
                                    className="px-8 py-3 bg-primary hover:brightness-110 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                            </svg>
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Enviar reclamo
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            <p className="text-xs text-gray-500 mt-4 text-center">
                                Al enviar este formulario, tu reclamo será registrado y procesado según la normativa vigente.
                                Recibirás una confirmación en tu correo electrónico.
                            </p>
                        </div>
                    </form>
                </div>

                {/* Información adicional */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-100 rounded-xl p-6 text-center">
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-6 h-6 customtext-primary" />
                        </div>
                        <h3 className="font-semibold customtext-neutral-dark mb-2">Respuesta garantizada</h3>
                        <p className="text-sm customtext-neutral-light">Te responderemos en un máximo de 30 días calendario</p>
                    </div>
                    
                    <div className="bg-gray-100 rounded-xl p-6 text-center">
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-6 h-6 customtext-primary" />
                        </div>
                        <h3 className="font-semibold customtext-neutral-dark mb-2">Información segura</h3>
                        <p className="text-sm customtext-neutral-light">Tus datos están protegidos y son confidenciales</p>
                    </div>
                    
                    <div className="bg-gray-100 rounded-xl p-6 text-center">
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-6 h-6 customtext-primary" />
                        </div>
                        <h3 className="font-semibold customtext-neutral-dark mb-2">Atención personalizada</h3>
                        <p className="text-sm customtext-neutral-light">Un especialista revisará tu caso individualmente</p>
                    </div>
                </div>
            </div>
            
            {/* Modals para términos y condiciones */}
            {Object.keys(policyItems).map((key, index) => {
                const title = policyItems[key];
                const content = Array.isArray(generals) 
                    ? generals.find((x) => x.correlative == key)?.description ?? ""
                    : "";
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
        </div>
    );
}
