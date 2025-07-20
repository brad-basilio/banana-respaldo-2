import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";

import DeliveryPricesRest from "@Rest/Admin/DeliveryPricesRest";
import TypesDeliveryRest from "@Rest/Admin/TypesDeliveryRest";
import StoresRest from "../Actions/Admin/StoresRest";
import CreateReactScript from "@Utils/CreateReactScript";
import Swal from "sweetalert2";
import BaseAdminto from "../Components/Adminto/Base";
import DxButton from "../Components/Adminto/Dx/DxButton";
import Modal from "../Components/Adminto/Modal";
import Table from "../Components/Adminto/Table";
import InputFormGroup from "../Components/Adminto/form/InputFormGroup";
import SelectFormGroup from "../Components/Adminto/form/SelectFormGroup";
import SwitchFormGroup from "../Components/Adminto/form/SwitchFormGroup";
import TextareaFormGroup from "../Components/Adminto/form/TextareaFormGroup";
import Number2Currency from "../Utils/Number2Currency";

const deliverypricesRest = new DeliveryPricesRest();
const deliverypricesTypeRest = new TypesDeliveryRest();
const storesRest = new StoresRest();

const DeliveryPricesType = ({ ubigeo = [] }) => {
    const gridRef = useRef();
    const gridTypeRef = useRef();
    const modalRef = useRef();
    const modalTypeRef = useRef();
    const modalTypeFormRef = useRef();
    // Form elements ref
    const idRef = useRef();
    const ubigeoRef = useRef();
    const priceRef = useRef();
    const descriptionRef = useRef();
    const is_freeRef = useRef();
    const is_agencyRef = useRef();
    const is_store_pickupRef = useRef();
    const express_priceRef = useRef();
    const agency_priceRef = useRef();
    const standard_priceRef = useRef(); // Nuevo campo para precio estándar en delivery gratis
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingType, setIsEditingType] = useState(false);
    const [inHome, setInHome] = useState(false);
    const [isFreeChecked, setIsFreeChecked] = useState(false);
    const [isAgencyChecked, setIsAgencyChecked] = useState(false);
    const [isStorePickupChecked, setIsStorePickupChecked] = useState(false);
    const [message, setMessage] = useState('');
    const [stores, setStores] = useState([]);
    const [availableStores, setAvailableStores] = useState([]);
    const [selectedStores, setSelectedStores] = useState([]); // Tiendas seleccionadas específicamente

    // No necesitamos cargar cache de tiendas para la tabla

    // No necesitamos cargar cache de tiendas para la tabla

    const onModalOpen = (data) => {
        console.log(data);
        if (data?.id) setIsEditing(true);
        else setIsEditing(false);

        // Limpiar tiendas seleccionadas al abrir el modal
        setSelectedStores([]);

        idRef.current.value = data?.id ?? "";
        $(ubigeoRef.current)
            .val(data?.ubigeo ?? null)
            .trigger("change");
        setInHome(data?.price === null);

        if (is_freeRef.current) {
            is_freeRef.current.checked = data?.is_free ?? false;
            setIsFreeChecked(data?.is_free ?? false);
            // Si es delivery gratis, también activar retiro en tienda automáticamente
            if (data?.is_free) {
                is_store_pickupRef.current.checked = true;
                setIsStorePickupChecked(true);
                setMessage('Delivery gratis incluye retiro en tienda automáticamente. Configure precio normal y express.');
                loadAvailableStores();
                // Cargar tiendas seleccionadas existentes
                if (data?.selected_stores && Array.isArray(data.selected_stores)) {
                    setSelectedStores(data.selected_stores);
                }
            }
        }

        if (is_agencyRef.current) {
            is_agencyRef.current.checked = data?.is_agency ?? false;
            setIsAgencyChecked(data?.is_agency ?? false);
            // Establecer mensaje si es recojo en agencia
            if (data?.is_agency) {
                setMessage('Este es un envío que se realizará por empresas de envío como Shalom, Olva Currier u otros, el cliente realizara el pago en destino.');
            }
        }

        if (is_store_pickupRef.current) {
            is_store_pickupRef.current.checked = data?.is_store_pickup ?? false;
            setIsStorePickupChecked(data?.is_store_pickup ?? false);
            // Establecer mensaje si es retiro en tienda
            if (data?.is_store_pickup) {
                setMessage('Retiro en tienda disponible. Los clientes podrán recoger sus pedidos en nuestras sucursales.');
                loadAvailableStores();
                // Cargar tiendas seleccionadas existentes
                if (data?.selected_stores && Array.isArray(data.selected_stores)) {
                    setSelectedStores(data.selected_stores);
                }
            }
        }

        priceRef.current.value = data?.price ?? 0;
        standard_priceRef.current.value = data?.price ?? 0; // Para delivery gratis, usar price como precio estándar
        express_priceRef.current.value = data?.express_price ?? 0;
        agency_priceRef.current.value = data?.agency_price ?? 0;
        descriptionRef.current.value = data?.description ?? "";

        $(modalRef.current).modal("show");
    };

    // Función para cargar todas las tiendas disponibles
    const loadAvailableStores = async () => {        
        try {
            // Cargar todas las tiendas activas desde el endpoint correcto
            const result = await storesRest.paginate({
                page: 1,
                per_page: 100, // Cargar hasta 100 tiendas
                filters: JSON.stringify([
                    {
                        field: "status",
                        operator: "=",
                        value: 1
                    }
                ])
            });
            
            console.log('Cargando todas las tiendas disponibles:', result);
            
            if (result && result.data && Array.isArray(result.data)) {
                setAvailableStores(result.data);
            } else {
                setAvailableStores([]);
            }
        } catch (error) {
            console.error("Error loading stores:", error);
            setAvailableStores([]);
        }
    };

    const onModalSubmit = async (e) => {
        e.preventDefault();

        const selected = ubigeo.find(
            (x) => x.reniec == ubigeoRef.current.value
        );
        const request = {
            id: idRef.current.value || undefined,
            name: `${selected.distrito}, ${selected.departamento}`.toTitleCase(),
            price: isFreeChecked ? standard_priceRef.current.value : priceRef.current.value, // Si es delivery gratis, usar precio estándar
            is_free: is_freeRef.current.checked,
            is_agency: is_agencyRef.current.checked,
            is_store_pickup: is_store_pickupRef.current.checked,
            express_price: express_priceRef.current.value,
            agency_price: agency_priceRef.current.value,
            description: descriptionRef.current.value,
            ubigeo: ubigeoRef.current.value,
            // Si el retiro en tienda está habilitado y hay tiendas seleccionadas específicamente,
            // enviar solo esas tiendas. Si no hay ninguna seleccionada, significa "todas las tiendas"
            selected_stores: is_store_pickupRef.current.checked ? 
                (selectedStores.length > 0 ? selectedStores : null) : 
                null
        };

        console.log('Datos a enviar:', request);

        const result = await deliverypricesRest.save(request);
        if (!result) return;

        // Limpiar tiendas seleccionadas después de guardar
        setSelectedStores([]);

        $(gridRef.current).dxDataGrid("instance").refresh();
        $(modalRef.current).modal("hide");
    };

    const idTypeRef = useRef();
    const nameTypeRef = useRef();
    const descriptionTypeRef = useRef();
    const [characteristics, setCharacteristics] = useState([{ value: "" }]);

    // Manejo de características
    const addCharacteristic = () => {
        setCharacteristics([...characteristics, { value: "" }]);
    };

    const updateCharacteristic = (index, value) => {
        const newCharacteristics = [...characteristics];
        newCharacteristics[index].value = value;
        setCharacteristics(newCharacteristics);
    };

    const removeCharacteristic = (index) => {
        if (characteristics.length <= 1) return;
        const newCharacteristics = characteristics.filter(
            (_, i) => i !== index
        );
        setCharacteristics(newCharacteristics);
    };
    const onModalType = () => {
        $(modalTypeRef.current).modal("show");
    };

    const onModalTypeOpen = (data) => {
        if (data?.id) setIsEditingType(true);
        else setIsEditingType(false);
        idTypeRef.current.value = data?.id ?? "";

        nameTypeRef.current.value = data?.name ?? "";
        descriptionTypeRef.current.value = data?.description ?? "";

        // Cargar características existentes
        if (data?.characteristics && data.characteristics.length > 0) {
            setCharacteristics(
                data.characteristics.map((item) => ({ value: item }))
            );
        } else {
            setCharacteristics([{ value: "" }]);
        }

        $(modalTypeFormRef.current).modal("show");
    };

    const onModalTypeSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", nameTypeRef.current.value);
        formData.append("description", descriptionTypeRef.current.value);
        // Si estamos editando, agregar el ID
        if (isEditingType) {
            formData.append("id", idTypeRef.current.value);
        }

        // Agregar características (filtrar vacías)
        const nonEmptyCharacteristics = characteristics
            .map((c) => c.value.trim())
            .filter((c) => c.length > 0);
        formData.append(
            "characteristics",
            JSON.stringify(nonEmptyCharacteristics)
        );

        // Enviar al backend
        const result = await deliverypricesTypeRest.save(formData);
        if (!result) return;

        // Limpiar y cerrar
        $(gridTypeRef.current).dxDataGrid("instance").refresh();
        $(modalTypeFormRef.current).modal("hide");

        setCharacteristics([{ value: "" }]);
    };
    const onDeleteClicked = async (id) => {
        const { isConfirmed } = await Swal.fire({
            title: "Eliminar registro",
            text: "¿Estas seguro de eliminar este registro?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Si, eliminar",
            cancelButtonText: "Cancelar",
        });
        if (!isConfirmed) return;
        const result = await deliverypricesRest.delete(id);
        if (!result) return;
        
        $(gridRef.current).dxDataGrid("instance").refresh();
    };

    const ubigeoTemplate = (e) => {
        return $(
            renderToString(
                <span>
                    <span className="d-block w-100 text-truncate">
                        {e.text.replace(e.id, "")}
                    </span>
                    <small className="d-block">Ubigeo: {e.id}</small>
                </span>
            )
        );
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        e.target.value = null;

        const formData = new FormData();
        formData.append("excel", file);

        const result = await deliverypricesRest.upload(formData);

        if (!result) return;
        $(gridRef.current).dxDataGrid("instance").refresh();
    };

    return (
        <>
            <input
                id="file-input"
                type="file"
                accept=".xlsx, .xls"
                style={{ display: "none" }}
                onChange={handleFileUpload}
            />
            <Table
                gridRef={gridRef}
                title="Costos de envío"
                rest={deliverypricesRest}
                exportable={true}
                exportableName="delivery.prices"
                toolBar={(container) => {
                    container.unshift({
                        widget: "dxButton",
                        location: "after",
                        options: {
                            icon: "upload",
                            hint: "Cargar archivo Excel",
                            onClick: () =>
                                document.getElementById("file-input").click(),
                        },
                    });
                    container.unshift({
                        widget: "dxButton",
                        location: "after",
                        options: {
                            icon: "refresh",
                            hint: "Refrescar tabla",
                            onClick: () =>
                                $(gridRef.current)
                                    .dxDataGrid("instance")
                                    .refresh(),
                        },
                    });

                    container.unshift({
                        widget: "dxButton",
                        location: "after",
                        options: {
                            icon: "plus",
                            text: "Nuevo registro",
                            hint: "Nuevo registro",
                            onClick: () => onModalOpen(),
                        },
                    });
                    container.unshift({
                        widget: "dxButton",
                        location: "after",
                        options: {
                            icon: "refresh",
                            text: "Actualizar datos de Delivery",
                            hint: "Actualizar datos de Delivery",
                            onClick: () => onModalType(),
                        },
                    });
                }}
                columns={[
                    {
                        dataField: "id",
                        caption: "ID",
                        visible: false,
                    },
                    {
                        dataField: "ubigeo",
                        caption: "Ubigeo (RENIEC)",
                        width: "150px",
                    },
                    {
                        dataField: "name",
                        caption: "Envío a",
                        width: "200px",
                        allowExporting: false,
                    },
                    {
                        dataField: "description",
                        caption: "Descripción",
                        cellTemplate: (container, { data }) => {
                            container.html(
                                data.description ||
                                    '<i class="text-muted">- Sin descripción -</i>'
                            );
                        },
                    },
                    {
                        dataField: "is_free",
                        dataType: "number",
                        caption: "Tipo Envio",
                        cellTemplate: (container, { data }) => {
                            if (data.is_free) {
                                container.html(
                                    renderToString(
                                        <div className="d-flex flex-column gap-1">
                                            <span className="badge bg-success">
                                                Delivery Gratis
                                            </span>
                                            <span className="badge bg-warning">
                                                Delivery Express
                                            </span>
                                            <span className="badge bg-primary">
                                                Retiro en Tienda
                                            </span>
                                        </div>
                                    )
                                );
                            } else if (data.is_agency) {
                                container.html(
                                    renderToString(
                                        <span className="badge bg-info">
                                            Recojo en Agencia
                                        </span>
                                    )
                                );
                            } else if (data.is_store_pickup) {
                                container.html(
                                    renderToString(
                                        <span className="badge bg-primary">
                                            Retiro en Tienda
                                        </span>
                                    )
                                );
                            } else {
                                container.html(
                                    renderToString(
                                        <span className="badge bg-secondary">
                                            Delivery Normal
                                        </span>
                                    )
                                );
                            }
                        },
                    },
                    {
                        dataField: "price",
                        caption: "Precio",
                        dataType: "number",
                        width: "150px",
                        cellTemplate: (container, { data }) => {
                            if (data.is_free) {
                                container.html(
                                    renderToString(
                                        <div className="d-flex flex-column">
                                            <span className="text-success font-weight-bold">
                                                Delivery Gratis (Condicional)
                                            </span>
                                            <small className="text-muted">
                                                Normal: S/ {Number2Currency(data.price)} | 
                                                Express: S/ {Number2Currency(data.express_price)}
                                            </small>
                                            <small className="text-primary">
                                                + Retiro en Tienda
                                            </small>
                                        </div>
                                    )
                                );
                            } else if (data.is_agency) {
                                container.html(
                                    renderToString(
                                        <div>
                                            <span className="text-muted font-italic">
                                                Recojo en Agencia
                                            </span>
                                            <br/>
                                            <small className="text-muted">
                                                S/ {Number2Currency(data.agency_price)}
                                            </small>
                                        </div>
                                    )
                                );
                            } else if (data.is_store_pickup && !data.is_free) {
                                container.html(
                                    renderToString(
                                        <span className="text-primary font-italic">
                                            Solo Retiro en Tienda
                                        </span>
                                    )
                                );
                            } else {
                                container.html(
                                    renderToString(
                                        <div>
                                            <span className="text-muted font-italic">
                                                Delivery Normal
                                            </span>
                                            <br/>
                                            <small className="text-muted">
                                                S/ {Number2Currency(data.price)}
                                            </small>
                                        </div>
                                    )
                                );
                            }
                        },
                    },
                    {
                        dataField: "selected_stores",
                        caption: "Tiendas",
                        width: "200px",
                        cellTemplate: (container, { data }) => {
                            if (data.is_store_pickup || data.is_free) {
                                if (data.selected_stores && Array.isArray(data.selected_stores) && data.selected_stores.length > 0) {
                                    // Solo mostrar número de tiendas específicas
                                    container.html(
                                        renderToString(
                                            <div>
                                                <span className="badge bg-primary">
                                                    {data.selected_stores.length} tienda{data.selected_stores.length > 1 ? 's' : ''} específica{data.selected_stores.length > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        )
                                    );
                                } else {
                                    // Todas las tiendas
                                    container.html(
                                        renderToString(
                                            <span className="badge bg-success">
                                                Todas las tiendas
                                            </span>
                                        )
                                    );
                                }
                            } else {
                                // No aplica
                                container.html(
                                    renderToString(
                                        <span className="text-muted font-italic">
                                            No aplica
                                        </span>
                                    )
                                );
                            }
                        },
                        allowFiltering: false,
                        allowExporting: false,
                    },
                    {
                        caption: "Acciones",
                        width: "100px",
                        cellTemplate: (container, { data }) => {
                            container.css("text-overflow", "unset");
                            container.append(
                                DxButton({
                                    className: "btn btn-xs btn-soft-primary",
                                    title: "Editar",
                                    icon: "fa fa-pen",
                                    onClick: () => onModalOpen(data),
                                })
                            );
                            container.append(
                                DxButton({
                                    className: "btn btn-xs btn-soft-danger",
                                    title: "Eliminar",
                                    icon: "fa fa-trash",
                                    onClick: () => onDeleteClicked(data.id),
                                })
                            );
                        },
                        allowFiltering: false,
                        allowExporting: false,
                    },
                ]}
            />
            <Modal
                modalRef={modalRef}
                title={
                    isEditing
                        ? "Editar Costo de envío"
                        : "Agregar Costo de envío"
                }
                onSubmit={onModalSubmit}
                size="lg"
            >
                <input ref={idRef} type="hidden" />
                <div id="form-container" className="row">
                    <SelectFormGroup
                        eRef={ubigeoRef}
                        label="Distrito/Ubigeo"
                        templateResult={ubigeoTemplate}
                        templateSelection={ubigeoTemplate}
                        dropdownParent="#form-container"
                        required
                    >
                        {ubigeo.map((x, index) => (
                            <option key={index} value={x.reniec}>
                                {x.reniec} {x.distrito} {x.provincia}{" "}
                                {x.departamento}
                            </option>
                        ))}
                    </SelectFormGroup>
                    
                    <div className="col-12 mb-3">
                        <label className="form-label">Tipo de Envío</label>
                        <div className="row">
                            <SwitchFormGroup
                                eRef={is_freeRef}
                                label="¿Delivery gratis?"
                                col="col-4"
                                onChange={(e) => {
                                    setIsFreeChecked(e.target.checked);
                                    if (e.target.checked) {
                                        // Cuando se marca delivery gratis, automáticamente marcar retiro en tienda
                                        setIsAgencyChecked(false);
                                        setIsStorePickupChecked(true); // Auto-activar retiro en tienda
                                        is_agencyRef.current.checked = false;
                                        is_store_pickupRef.current.checked = true; // Auto-activar retiro en tienda
                                        setMessage('Delivery gratis incluye retiro en tienda automáticamente. Configure precio normal y express.');
                                        loadAvailableStores();
                                    } else {
                                        // Si se desmarca delivery gratis, también desmarcar retiro en tienda
                                        setIsStorePickupChecked(false);
                                        is_store_pickupRef.current.checked = false;
                                        setMessage('');
                                    }
                                }}
                                checked={isFreeChecked}
                                refreshable={[isFreeChecked]}
                            />
                            <SwitchFormGroup
                                eRef={is_agencyRef}
                                label="¿Recojo en agencia?"
                                col="col-4"
                                onChange={(e) => {
                                    setIsAgencyChecked(e.target.checked);
                                    if (e.target.checked) {
                                        setIsFreeChecked(false);
                                        setIsStorePickupChecked(false);
                                        is_freeRef.current.checked = false;
                                        is_store_pickupRef.current.checked = false;
                                        setMessage('Este es un envío que se realizará por empresas de envío como Shalom, Olva Currier u otros, el cliente realizara el pago en destino.');
                                    } else {
                                        setMessage('');
                                    }
                                }}
                                checked={isAgencyChecked}
                                refreshable={[isAgencyChecked]}
                            />
                            <SwitchFormGroup
                                eRef={is_store_pickupRef}
                                label="¿Retiro en tienda?"
                                col="col-4"
                                onChange={(e) => {
                                    setIsStorePickupChecked(e.target.checked);
                                    if (e.target.checked) {
                                        // Cargar tiendas cuando se activa retiro en tienda
                                        loadAvailableStores();
                                        if (!isFreeChecked) {
                                            // Solo afectar otros switches si no es delivery gratis
                                            setIsAgencyChecked(false);
                                            is_agencyRef.current.checked = false;
                                        }
                                        setMessage('Retiro en tienda disponible. Seleccione tiendas específicas o deje sin seleccionar para permitir retiro en cualquier tienda.');
                                    } else {
                                        setMessage('');
                                        setSelectedStores([]); // Limpiar tiendas seleccionadas
                                    }
                                }}
                                checked={isStorePickupChecked}
                                refreshable={[isStorePickupChecked]}
                            />
                        </div>
                        {message && (
                            <div className={`alert ${isFreeChecked ? 'alert-success' : 'alert-info'} mt-2`}>
                                <i className={`fas ${isFreeChecked ? 'fa-check-circle' : 'fa-info-circle'} me-2`}></i>
                                {message}
                            </div>
                        )}
                    </div>
                    
                    {/* Mostrar retiro en tienda como información cuando es delivery gratis */}
                    {isFreeChecked && (
                        <div className="col-12 mb-3">
                            <div className="alert alert-info">
                                <i className="fas fa-info-circle me-2"></i>
                                <strong>Delivery gratis incluye automáticamente retiro en tienda.</strong>
                                <br/>Configure el precio normal (cuando no califica para envío gratuito) y el precio express.
                            </div>
                        </div>
                    )}
                    
                    {/* Campos de precio según el tipo de envío */}
                    <div
                        className="col-12"
                        hidden={isFreeChecked || isAgencyChecked || isStorePickupChecked}
                    >
                        <InputFormGroup
                            eRef={priceRef}
                            label="Costo de envío"
                            col="col-12"
                            type="number"
                            step={0.01}
                            required
                        />
                    </div>
                    
                    {/* Campos específicos para delivery gratis */}
                    <div className="col-12" hidden={!isFreeChecked}>
                        <div className="row">
                            <div className="col-md-6">
                                <InputFormGroup
                                    eRef={standard_priceRef}
                                    label="Precio Normal (cuando no califica gratis)"
                                    col="col-12"
                                    type="number"
                                    step={0.01}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <InputFormGroup
                                    eRef={express_priceRef}
                                    label="Precio Express"
                                    col="col-12"
                                    type="number"
                                    step={0.01}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-12" hidden={!isAgencyChecked}>
                        <InputFormGroup
                            eRef={agency_priceRef}
                            label="Costo de envío a Agencia"
                            col="col-12"
                            type="number"
                            step={0.01}
                            required
                        />
                    </div>
                    
                    {/* Mostrar tiendas disponibles cuando se selecciona retiro en tienda */}
                    {isStorePickupChecked && (
                        <div className="col-12 mb-3">
                            <label className="form-label">Tiendas disponibles para retiro</label>
                            {availableStores.length > 0 ? (
                                <div>
                                    <div className="alert alert-info mb-3">
                                        <i className="fas fa-info-circle me-2"></i>
                                        <strong>Instrucciones:</strong>
                                        <ul className="mb-0 mt-2">
                                            <li>Si no selecciona ninguna tienda, el retiro estará disponible en <strong>todas las tiendas</strong> de esta ubicación.</li>
                                            <li>Si selecciona tiendas específicas, el retiro solo estará disponible en las tiendas marcadas.</li>
                                        </ul>
                                    </div>
                                    
                                    <div className="row">
                                        {availableStores.map((store) => (
                                            <div key={store.id} className="col-md-6 mb-3">
                                                <div className={`card border ${selectedStores.includes(store.id) ? 'border-primary bg-light' : ''}`}>
                                                    <div className="card-body p-3">
                                                        <div className="form-check">
                                                            <input 
                                                                className="form-check-input" 
                                                                type="checkbox" 
                                                                id={`store_${store.id}`}
                                                                checked={selectedStores.includes(store.id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedStores([...selectedStores, store.id]);
                                                                    } else {
                                                                        setSelectedStores(selectedStores.filter(id => id !== store.id));
                                                                    }
                                                                }}
                                                            />
                                                            <label className="form-check-label w-100" htmlFor={`store_${store.id}`}>
                                                                <div className="d-flex">
                                                                    <div className="flex-shrink-0">
                                                                        {store.image ? (
                                                                            <img 
                                                                                src={`/storage/images/stores/${store.image}`}
                                                                                alt={store.name}
                                                                                className="rounded"
                                                                                style={{width: "40px", height: "40px", objectFit: "cover"}}
                                                                            />
                                                                        ) : (
                                                                            <div className="bg-secondary rounded d-flex align-items-center justify-content-center text-white" style={{width: "40px", height: "40px"}}>
                                                                                <i className="fas fa-store"></i>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-grow-1 ms-3">
                                                                        <h6 className="mb-1">{store.name}</h6>
                                                                        <small className="text-muted d-block">{store.address}</small>
                                                                        {store.phone && (
                                                                            <small className="text-muted d-block">📞 {store.phone}</small>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-shrink-0">
                                                                        <span className={`badge ${store.status ? 'bg-success' : 'bg-danger'}`}>
                                                                            {store.status ? 'Activa' : 'Inactiva'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-3">
                                        <small className="text-muted">
                                            <strong>Tiendas seleccionadas:</strong> 
                                            {selectedStores.length === 0 ? 
                                                <span className="text-success"> Todas las tiendas disponibles ({availableStores.length})</span> :
                                                <span className="text-primary"> {selectedStores.length} de {availableStores.length} tiendas</span>
                                            }
                                        </small>
                                    </div>
                                </div>
                            ) : (
                                <div className="alert alert-warning">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    No hay tiendas disponibles en esta ubicación. 
                                    <a href="/admin/stores" target="_blank" className="alert-link ms-1">
                                        Administrar tiendas
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <TextareaFormGroup
                        eRef={descriptionRef}
                        label="Descripción"
                        rows={2}
                    />
                </div>
            </Modal>

            <Modal
                modalRef={modalTypeRef}
                title={"Tipos de Delivery"}
                size="lg"
            >
                <Table
                    gridRef={gridTypeRef}
                    title="Tipos de Delivery"
                    rest={deliverypricesTypeRest}
                    toolBar={(container) => {
                        container.unshift({
                            widget: "dxButton",
                            location: "after",
                            options: {
                                icon: "refresh",
                                hint: "Refrescar tabla",
                                onClick: () =>
                                    $(gridTypeRef.current)
                                        .dxDataGrid("instance")
                                        .refresh(),
                            },
                        });
                    }}
                    columns={[
                        {
                            dataField: "id",
                            caption: "ID",
                            visible: false,
                        },

                        {
                            dataField: "name",
                            caption: "Nombre",
                            width: "150px",
                            allowExporting: false,
                        },
                        {
                            dataField: "description",
                            caption: "Descripción",
                            width: "300px",
                            cellTemplate: (container, { data }) => {
                                container.html(
                                    data.description ||
                                        '<i class="text-muted">- Sin descripción -</i>'
                                );
                            },
                        },
                        {
                            dataField: "characteristics",
                            caption: "Caracteristicas",
                            width: "200px",
                            cellTemplate: (container, { data }) => {
                                if (data.characteristics) {
                                    data.characteristics.forEach((char) => {
                                        container.css("text-overflow", "unset");
                                        container.append(
                                            renderToString(
                                                <li className="d-flex gap-2">
                                                    <i className="text-muted font-italic d-block">
                                                        - {char}
                                                    </i>
                                                </li>
                                            )
                                        );
                                    });
                                } else {
                                    ('<i class="text-muted">- Sin caracteristicas -</i>');
                                }
                            },
                        },
                        {
                            caption: "Acciones",
                            width: "50px",
                            cellTemplate: (container, { data }) => {
                                container.css("text-overflow", "unset");
                                container.append(
                                    DxButton({
                                        className:
                                            "btn btn-xs btn-soft-primary",
                                        title: "Editar",
                                        icon: "fa fa-pen",
                                        onClick: () => onModalTypeOpen(data),
                                    })
                                );
                            },
                            allowFiltering: false,
                            allowExporting: false,
                        },
                    ]}
                />
            </Modal>

            <Modal
                modalRef={modalTypeFormRef}
                title={
                    isEditing
                        ? "Editar tipo de Delivery"
                        : "Agregar tipo de Delivery"
                }
                onSubmit={onModalTypeSubmit}
                size="sm"
            >
                <input ref={idTypeRef} type="hidden" />
                <div id="form-container" className="row">
                    <div className="col-12">
                        <InputFormGroup
                            eRef={nameTypeRef}
                            label="Nombre"
                            col="col-12"
                            type="string"
                           
                        />
                        <InputFormGroup
                            eRef={descriptionTypeRef}
                            label="descripcion"
                            col="col-12"
                            type="string"
                            required
                        />
                    </div>
                    <div className="col-12">
                        <div className="mb-3">
                            <label className="form-label">
                                Características
                            </label>
                            {characteristics.map((char, index) => (
                                <div key={index} className="input-group mb-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ej: Egresada de la Universidad Nacional Federico Villarreal."
                                        value={char.value}
                                        onChange={(e) =>
                                            updateCharacteristic(
                                                index,
                                                e.target.value
                                            )
                                        }
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger"
                                        onClick={() =>
                                            removeCharacteristic(index)
                                        }
                                        disabled={characteristics.length <= 1}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={addCharacteristic}
                            >
                                <i className="fas fa-plus me-1"></i> Agregar
                                característica
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

CreateReactScript((el, properties) => {
    createRoot(el).render(
        <BaseAdminto {...properties} title="Costos de envio">
            <DeliveryPricesType {...properties} />
        </BaseAdminto>
    );
});
