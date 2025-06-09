import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";

import DeliveryPricesRest from "@Rest/Admin/DeliveryPricesRest";
import TypesDeliveryRest from "@Rest/Admin/TypesDeliveryRest";
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
    const express_priceRef = useRef();
    const agency_priceRef = useRef();
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingType, setIsEditingType] = useState(false);
    const [inHome, setInHome] = useState(false);
    const [isFreeChecked, setIsFreeChecked] = useState(false);
    const [isAgencyChecked, setIsAgencyChecked] = useState(false);
    const [message, setMessage] = useState('');

    const onModalOpen = (data) => {
        console.log(data);
        if (data?.id) setIsEditing(true);
        else setIsEditing(false);

        idRef.current.value = data?.id ?? "";
        $(ubigeoRef.current)
            .val(data?.ubigeo ?? null)
            .trigger("change");
        setInHome(data?.price === null);

        if (is_freeRef.current) {
            is_freeRef.current.checked = data?.is_free ?? false;
            setIsFreeChecked(data?.is_free ?? false);
            // Establecer mensaje si es delivery gratis
            if (data?.is_free) {
                setMessage('El envío gratis tiene costo 0. Puede agregar un costo adicional para delivery express.');
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

        priceRef.current.value = data?.price ?? 0;
        express_priceRef.current.value = data?.express_price ?? 0;
        agency_priceRef.current.value = data?.agency_price ?? 0;
        descriptionRef.current.value = data?.description ?? "";

        $(modalRef.current).modal("show");
    };

    const onModalSubmit = async (e) => {
        e.preventDefault();

        const selected = ubigeo.find(
            (x) => x.reniec == ubigeoRef.current.value
        );
        const request = {
            id: idRef.current.value || undefined,
            name: `${selected.distrito}, ${selected.departamento}`.toTitleCase(),
            price: isFreeChecked ? null : priceRef.current.value,
            is_free: is_freeRef.current.checked,
            is_agency: is_agencyRef.current.checked,
            express_price: express_priceRef.current.value,
            agency_price: agency_priceRef.current.value,
            description: descriptionRef.current.value,
            ubigeo: ubigeoRef.current.value,
        };

        const result = await deliverypricesRest.save(request);
        if (!result) return;

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
                                        <div className="d-flex gap-2">
                                            <span className="text-muted font-italic">
                                                Delivery Gratis
                                            </span>
                                            <span className="text-muted font-italic">
                                                Delivery Express
                                            </span>
                                        </div>
                                    )
                                );
                            } else if (data.is_agency) {
                                container.html(
                                    renderToString(
                                        <span className="text-muted font-italic">
                                            Recojo en agencia
                                        </span>
                                    )
                                );
                            } else {
                                container.html(
                                    renderToString(
                                        <span className="text-muted font-italic">
                                            Delivery
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
                                        <div className="row">
                                            {" "}
                                            <span className="text-muted font-italic">
                                                Delivery Gratis
                                            </span>
                                            <span className="text-muted">
                                                Express:{" "}
                                                <span className="font-monospace text-reset">
                                                    S/.{" "}
                                                    {Number2Currency(
                                                        data.express_price
                                                    )}
                                                </span>
                                            </span>
                                        </div>
                                    )
                                );
                            } else if (data.price > 0) {
                                container.html(
                                    renderToString(
                                        <span>
                                            S/. {Number2Currency(data.price)}
                                        </span>
                                    )
                                );
                            } else if (data.is_agency > 0) {
                                container.html(
                                    renderToString(
                                        <span>
                                            S/. {Number2Currency(data.agency_price)}
                                        </span>
                                    )
                                );
                            } else {
                                container.text("Gratis");
                            }
                        },
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
                size="md"
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
                                col="col-6"
                                onChange={(e) => {
                                    setIsFreeChecked(e.target.checked);
                                    if (e.target.checked) {
                                        setIsAgencyChecked(false);
                                        is_agencyRef.current.checked = false;
                                        setMessage('El envío gratis tiene costo 0. Puede agregar un costo adicional para delivery express.');
                                    } else {
                                        setMessage('');
                                    }
                                }}
                                checked={isFreeChecked}
                                refreshable={[isFreeChecked]}
                            />
                            <SwitchFormGroup
                                eRef={is_agencyRef}
                                label="¿Recojo en agencia?"
                                col="col-6"
                                onChange={(e) => {
                                    setIsAgencyChecked(e.target.checked);
                                    if (e.target.checked) {
                                        setIsFreeChecked(false);
                                        is_freeRef.current.checked = false;
                                        setMessage('Este es un envío que se realizará por empresas de envío como Shalom, Olva Currier u otros, el cliente realizara el pago en destino.');
                                    } else {
                                        setMessage('');
                                    }
                                }}
                                checked={isAgencyChecked}
                                refreshable={[isAgencyChecked]}
                            />
                        </div>
                        {message && (
                            <div className="alert alert-info mt-2">
                                {message}
                            </div>
                        )}
                    </div>
                    
                  
                    <div
                        className="col-12"
                        hidden={isFreeChecked || isAgencyChecked}
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
                    <div className="col-12" hidden={!isFreeChecked}>
                        <InputFormGroup
                            eRef={express_priceRef}
                            label="Costo de envío Express"
                            col="col-12"
                            type="number"
                            step={0.01}
                            required
                        />
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
