import { CheckCircle, FileText, User, MapPin, Package, Calendar, Hash, MessageSquare, Mail, Phone, Printer, ArrowLeft } from 'lucide-react';

export default function ThankYouPage({ complaintData, onBackToForm }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';
        return new Date(dateString).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const generateComplaintNumber = () => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `REC-${timestamp.toString().slice(-6)}${random}`;
    };

    const complaintNumber = generateComplaintNumber();

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 w-full px-4 py-8 font-font-general">
            {/* Estilos para impresión */}
            <style jsx>{`
                @media print {
                    body { 
                        -webkit-print-color-adjust: exact; 
                        color-adjust: exact; 
                    }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    .printable-area {
                        position: static !important;
                        margin: 0 !important;
                        padding: 20px !important;
                    }
                    .bg-gradient-to-r, .bg-gradient-to-br { 
                        background: #f8f9fa !important; 
                        color: #000 !important;
                    }
                    .shadow-lg, .shadow-xl { 
                        box-shadow: none !important; 
                        border: 2px solid #ddd !important;
                    }
                    .rounded-2xl, .rounded-xl { 
                        border-radius: 8px !important; 
                    }
                    .text-white { color: #000 !important; }
                    .print-header {
                        border-bottom: 3px solid #000;
                        margin-bottom: 20px;
                        padding-bottom: 15px;
                        text-align: center;
                    }
                    .print-section {
                        page-break-inside: avoid;
                        margin-bottom: 25px;
                        border: 1px solid #ddd;
                        padding: 15px;
                        border-radius: 5px;
                    }
                }
            `}</style>
            
            <div className="max-w-5xl mx-auto">
                {/* Header de agradecimiento */}
                <div className="text-center mb-10 no-print">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6 shadow-lg">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold customtext-neutral-dark mb-4">
                        ¡Reclamo Registrado Exitosamente!
                    </h1>
                    <p className="text-lg customtext-neutral-light max-w-2xl mx-auto leading-relaxed">
                        Su reclamo ha sido registrado correctamente. Recibirá una respuesta dentro de los próximos 30 días hábiles.
                    </p>
                </div>

                {/* Área imprimible */}
                <div className="printable-area">
                    {/* Header para impresión */}
                    <div className="print-header print-only hidden">
                        <h1 className="text-3xl font-bold">LIBRO DE RECLAMACIONES</h1>
                        <p className="text-lg customtext-neutral-dark mt-2">Comprobante de Registro de Reclamo</p>
                        <p className="text-base customtext-neutral-light mt-1">Fecha de registro: {formatDate(new Date())}</p>
                    </div>

                    {/* Tarjeta principal */}
                    <div className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
                        {/* Header de la tarjeta */}
                        <div className="bg-primary text-white p-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Resumen del Reclamo</h2>
                                        <p className="text-blue-100">Información detallada de su solicitud</p>
                                    </div>
                                </div>
                               
                            </div>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Datos del consumidor */}
                            <div className="print-section">
                                <div className="flex items-center gap-3 mb-6 pb-3 border-b ">
                                    <div className="flex items-center justify-center w-10 h-10 bg-secondary customtext-primary rounded-full">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold customtext-neutral-dark">Datos del Consumidor</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <label className="text-sm font-medium customtext-neutral-light block mb-1">Nombre Completo</label>
                                            <p className="text-lg font-semibold customtext-neutral-dark">{complaintData.nombre}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <label className="text-sm font-medium customtext-neutral-light block mb-1">Documento</label>
                                            <p className="text-lg font-semibold customtext-neutral-dark">{complaintData.tipo_documento?.toUpperCase()} - {complaintData.numero_identidad}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <label className="text-sm font-medium customtext-neutral-light block mb-1">Correo Electrónico</label>
                                            <p className="text-lg font-semibold customtext-neutral-dark">{complaintData.correo_electronico}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <label className="text-sm font-medium customtext-neutral-light block mb-1">Teléfono</label>
                                            <p className="text-lg font-semibold customtext-neutral-dark">{complaintData.celular || 'No proporcionado'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ubicación */}
                            <div className="print-section">
                                <div className="flex items-center gap-3 mb-6 pb-3 border-b ">
                                    <div className="flex items-center justify-center w-10 h-10 bg-secondary customtext-primary  rounded-full">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold customtext-neutral-dark">Información de Ubicación</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <label className="text-sm font-medium customtext-neutral-light block mb-1">Departamento</label>
                                            <p className="text-lg font-semibold customtext-neutral-dark">{complaintData.departamento}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <label className="text-sm font-medium customtext-neutral-light block mb-1">Provincia</label>
                                            <p className="text-lg font-semibold customtext-neutral-dark">{complaintData.provincia}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <label className="text-sm font-medium customtext-neutral-light block mb-1">Distrito</label>
                                            <p className="text-lg font-semibold customtext-neutral-dark">{complaintData.distrito}</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <label className="text-sm font-medium customtext-neutral-light block mb-1">Dirección Completa</label>
                                        <p className="text-lg font-semibold customtext-neutral-dark">{complaintData.direccion}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Detalles del producto/servicio */}
                            <div className="print-section">
                                <div className="flex items-center gap-3 mb-6 pb-3 border-b ">
                                    <div className="flex items-center justify-center w-10 h-10 bg-secondary rounded-full customtext-primary">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold customtext-neutral-dark">Producto/Servicio</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <label className="text-sm font-medium customtext-neutral-light block mb-1">Tipo</label>
                                            <p className="text-lg font-semibold customtext-neutral-dark capitalize">{complaintData.tipo_producto}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <label className="text-sm font-medium customtext-neutral-light block mb-1">Monto Reclamado</label>
                                            <p className="text-lg font-semibold customtext-neutral-dark">S/ {complaintData.monto_reclamado || '0.00'}</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <label className="text-sm font-medium customtext-neutral-light block mb-1">Descripción del Producto/Servicio</label>
                                        <p className="text-lg font-semibold customtext-neutral-dark leading-relaxed">{complaintData.descripcion_producto}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Detalles del reclamo */}
                            <div className="print-section">
                                <div className="flex items-center gap-3 mb-6 pb-3 border-b ">
                                    <div className="flex items-center justify-center w-10 h-10 bg-secondary customtext-primary rounded-full">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold customtext-neutral-dark">Detalles del Reclamo</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <label className="text-sm font-medium customtext-neutral-light block mb-1">Tipo de Reclamo</label>
                                            <p className="text-lg font-semibold customtext-neutral-dark capitalize">{complaintData.tipo_reclamo}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <label className="text-sm font-medium customtext-neutral-light block mb-1">Fecha del Incidente</label>
                                            <p className="text-lg font-semibold customtext-neutral-dark">{formatDate(complaintData.fecha_incidente)}</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <label className="text-sm font-medium customtext-neutral-light block mb-1">Detalle del Reclamo</label>
                                        <p className="text-lg font-semibold customtext-neutral-dark leading-relaxed">{complaintData.detalle_reclamo}</p>
                                    </div>
                                    {complaintData.pedido_consumidor && (
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <label className="text-sm font-medium customtext-neutral-light block mb-1">Pedido del Consumidor</label>
                                            <p className="text-lg font-semibold customtext-neutral-dark leading-relaxed">{complaintData.pedido_consumidor}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Información del registro */}
                            <div className="print-section">
                                <div className="flex items-center gap-3 mb-6 pb-3 border-b ">
                                    <div className="flex items-center justify-center w-10 h-10 bg-secondary customtext-primary rounded-full">
                                        <Hash className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold customtext-neutral-dark">Información del Registro</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <label className="text-sm font-medium customtext-neutral-light block mb-1">Fecha de Registro</label>
                                        <p className="text-lg font-semibold customtext-neutral-dark">{formatDate(new Date())}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <label className="text-sm font-medium customtext-neutral-light block mb-1">Estado</label>
                                        <p className="text-lg font-semibold text-green-600">Registrado</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información sobre próximos pasos */}
                    <div className="mt-8 bg-secondary border  rounded-xl p-6 no-print">
                        <h4 className="text-lg font-bold customtext-primary mb-3">Próximos Pasos</h4>
                        <div className="space-y-2 customtext-primary">
                            <p>✓ Conserve este comprobante como respaldo de su reclamo</p>
                            <p>✓ Recibirá una respuesta dentro de los próximos 30 días hábiles</p>
                            <p>✓ Si requiere información adicional, contáctenos a través de nuestros canales oficiales</p>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 no-print">
                       
                        <button
                            onClick={onBackToForm}
                            className="flex-1 bg-primary max-w-max hover:brightness-110 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Nuevo Reclamo
                        </button>
                    </div>

                   
                </div>
            </div>
        </div>
    );
}
