import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";

import StoresRest from "../Actions/Admin/StoresRest";
import CreateReactScript from "../Utils/CreateReactScript";
import BaseAdminto from "@Adminto/Base";
import Table from "../Components/Adminto/Table";
import Modal from "../Components/Adminto/Modal";
import InputFormGroup from "../Components/Adminto/form/InputFormGroup";
import TextareaFormGroup from "../Components/Adminto/form/TextareaFormGroup";
import ImageFormGroup from "../Components/Adminto/form/ImageFormGroup";
import SwitchFormGroup from "../Components/Adminto/form/SwitchFormGroup";
import SelectFormGroup from "../Components/Adminto/form/SelectFormGroup";
import DxButton from "../Components/dx/DxButton";
import Swal from "sweetalert2";

const storesRest = new StoresRest();

const Stores = ({ ubigeos = [] }) => {
    const gridRef = useRef();
    const modalRef = useRef();
    
    // Form elements ref
    const idRef = useRef();
    const nameRef = useRef();
    const addressRef = useRef();
    const phoneRef = useRef();
    const emailRef = useRef();
    const descriptionRef = useRef();
    const ubigeoRef = useRef();
    const latitudeRef = useRef();
    const longitudeRef = useRef();
    const imageRef = useRef();
    const statusRef = useRef();
    const business_hoursRef = useRef();
    const managerRef = useRef();
    const capacityRef = useRef();
    const typeRef = useRef();

    const [isEditing, setIsEditing] = useState(false);
    
    // Estados para horarios de atención
    const [businessHours, setBusinessHours] = useState([
        { day: "Lunes", open: "09:00", close: "18:00", closed: false },
        { day: "Martes", open: "09:00", close: "18:00", closed: false },
        { day: "Miércoles", open: "09:00", close: "18:00", closed: false },
        { day: "Jueves", open: "09:00", close: "18:00", closed: false },
        { day: "Viernes", open: "09:00", close: "18:00", closed: false },
        { day: "Sábado", open: "09:00", close: "15:00", closed: false },
        { day: "Domingo", open: "09:00", close: "15:00", closed: true },
    ]);

    const onModalOpen = (data) => {
        console.log(data);
        if (data?.id) setIsEditing(true);
        else setIsEditing(false);

        idRef.current.value = data?.id ?? "";
        nameRef.current.value = data?.name ?? "";
        addressRef.current.value = data?.address ?? "";
        phoneRef.current.value = data?.phone ?? "";
        emailRef.current.value = data?.email ?? "";
        descriptionRef.current.value = data?.description ?? "";
        latitudeRef.current.value = data?.latitude ?? "";
        longitudeRef.current.value = data?.longitude ?? "";
        managerRef.current.value = data?.manager ?? "";
        capacityRef.current.value = data?.capacity ?? "";

        // Limpiar el input de imagen
        if (imageRef.current) {
            imageRef.current.value = "";
        }

        $(ubigeoRef.current)
            .val(data?.ubigeo ?? null)
            .trigger("change");

        $(typeRef.current)
            .val(data?.type ?? "tienda")
            .trigger("change");

        if (statusRef.current) {
            statusRef.current.checked = data?.status ?? true;
        }

        // Cargar horarios de atención si existen
        if (data?.business_hours) {
            try {
                const hours = typeof data.business_hours === 'string' 
                    ? JSON.parse(data.business_hours) 
                    : data.business_hours;
                setBusinessHours(hours);
            } catch (e) {
                console.error("Error parsing business hours:", e);
            }
        } else {
            // Resetear a horarios por defecto
            setBusinessHours([
                { day: "Lunes", open: "09:00", close: "18:00", closed: false },
                { day: "Martes", open: "09:00", close: "18:00", closed: false },
                { day: "Miércoles", open: "09:00", close: "18:00", closed: false },
                { day: "Jueves", open: "09:00", close: "18:00", closed: false },
                { day: "Viernes", open: "09:00", close: "18:00", closed: false },
                { day: "Sábado", open: "09:00", close: "15:00", closed: false },
                { day: "Domingo", open: "09:00", close: "15:00", closed: true },
            ]);
        }

        $(modalRef.current).modal("show");
    };

    const onModalSubmit = async (e) => {
        e.preventDefault();

        // Validar y procesar coordenadas antes de enviar
        const latitudeValue = latitudeRef.current.value.trim();
        const longitudeValue = longitudeRef.current.value.trim();
        
        let latitude = null;
        let longitude = null;
        
        // Procesar latitud si existe
        if (latitudeValue) {
            latitude = parseFloat(latitudeValue);
            console.log("Latitud procesada:", latitude, "desde:", latitudeValue);
            
            // Validación de coordenadas para Perú
            if (latitude < -18.5 || latitude > -0.1) {
                Swal.fire({
                    title: "Error de validación",
                    text: "La latitud debe estar entre -18.5 y -0.1 para ubicaciones en Perú",
                    icon: "error"
                });
                return;
            }
            
            // Validar formato decimal (máximo 10 dígitos totales, 8 decimales)
            if (!isValidCoordinate(latitude, 10, 8)) {
                Swal.fire({
                    title: "Error de validación",
                    text: "La latitud excede el formato permitido (máximo 10 dígitos con 8 decimales)",
                    icon: "error"
                });
                return;
            }
            
            // Truncar a 8 decimales para cumplir con la BD
            latitude = Math.round(latitude * 100000000) / 100000000;
            console.log("Latitud truncada:", latitude);
        }
        
        // Procesar longitud si existe
        if (longitudeValue) {
            longitude = parseFloat(longitudeValue);
            console.log("Longitud procesada:", longitude, "desde:", longitudeValue);
            
            if (longitude < -81.5 || longitude > -68.5) {
                Swal.fire({
                    title: "Error de validación",
                    text: "La longitud debe estar entre -81.5 y -68.5 para ubicaciones en Perú",
                    icon: "error"
                });
                return;
            }
            
            // Validar formato decimal (máximo 11 dígitos totales, 8 decimales)
            if (!isValidCoordinate(longitude, 11, 8)) {
                Swal.fire({
                    title: "Error de validación",
                    text: "La longitud excede el formato permitido (máximo 11 dígitos con 8 decimales)",
                    icon: "error"
                });
                return;
            }
            
            // Truncar a 8 decimales para cumplir con la BD
            longitude = Math.round(longitude * 100000000) / 100000000;
            console.log("Longitud truncada:", longitude);
        }

        const selectedUbigeo = ubigeos.find(
            (x) => x.reniec == ubigeoRef.current.value
        );

        const formData = new FormData();
        
        // Debug: Verificar ID antes de enviarlo
        const idValue = idRef.current.value;
        console.log("DEBUG ID - Valor del ID a enviar:", idValue, "Tipo:", typeof idValue, "Vacío?:", !idValue);
        
        if (idRef.current.value) {
            formData.append("id", idRef.current.value);
            console.log("DEBUG ID - ID agregado al FormData:", idRef.current.value);
        } else {
            console.log("DEBUG ID - No se agrega ID al FormData (valor vacío)");
        }
        
        formData.append("name", nameRef.current.value);
        formData.append("address", addressRef.current.value);
        formData.append("phone", phoneRef.current.value);
        formData.append("email", emailRef.current.value);
        formData.append("description", descriptionRef.current.value);
        formData.append("ubigeo", ubigeoRef.current.value);
        formData.append("latitude", latitude !== null ? latitude.toString() : "");
        formData.append("longitude", longitude !== null ? longitude.toString() : "");
        formData.append("manager", managerRef.current.value);
        formData.append("capacity", capacityRef.current.value);
        formData.append("type", typeRef.current.value);
        formData.append("status", statusRef.current.checked ? 1 : 0);
        formData.append("business_hours", JSON.stringify(businessHours));

        // Agregar imagen si existe
        if (imageRef.current && imageRef.current.files[0]) {
            formData.append("image", imageRef.current.files[0]);
        }

        // Debug: Mostrar los datos que se van a enviar
        console.log("Datos a enviar:");
        console.log("- Latitud:", latitude);
        console.log("- Longitud:", longitude);
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        const result = await storesRest.save(formData);
        if (!result) return;

        $(gridRef.current).dxDataGrid("instance").refresh();
        $(modalRef.current).modal("hide");
    };

    const onDeleteClicked = async (id) => {
        const { isConfirmed } = await Swal.fire({
            title: "Eliminar tienda",
            text: "¿Estás seguro de eliminar esta tienda?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });
        if (!isConfirmed) return;
        
        const result = await storesRest.delete(id);
        if (!result) return;
        
        $(gridRef.current).dxDataGrid("instance").refresh();
    };

    const updateBusinessHours = (index, field, value) => {
        const newHours = [...businessHours];
        newHours[index][field] = value;
        setBusinessHours(newHours);
    };

    // Función para validar formato de coordenadas según restricciones de base de datos
    const isValidCoordinate = (value, totalDigits, decimalPlaces) => {
        if (value === null || value === undefined || isNaN(value)) return false;
        
        const valueStr = Math.abs(value).toString();
        const parts = valueStr.split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1] || '';
        
        console.log(`Validando coordenada: ${value}`);
        console.log(`Parte entera: ${integerPart} (${integerPart.length} dígitos)`);
        console.log(`Parte decimal: ${decimalPart} (${decimalPart.length} dígitos)`);
        console.log(`Total permitido: ${totalDigits}, decimales permitidos: ${decimalPlaces}`);
        
        // Para coordenadas geográficas, ser más flexible con los decimales
        // Truncar los decimales si exceden el límite permitido
        if (decimalPart.length > decimalPlaces) {
            console.log(`Advertencia: Truncando decimales de ${decimalPart.length} a ${decimalPlaces} dígitos`);
            // No retornar false, sino permitir el truncamiento automático
        }
        
        // Verificar que no exceda los dígitos enteros permitidos
        const maxIntegerDigits = totalDigits - decimalPlaces;
        if (integerPart.length > maxIntegerDigits) {
            console.log(`Error: Excede dígitos enteros permitidos (${integerPart.length} > ${maxIntegerDigits})`);
            return false;
        }
        
        console.log("Coordenada válida (se truncará automáticamente si es necesario)");
        return true;
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

    return (
        <>
            <Table
                gridRef={gridRef}
                title="Tiendas / Sucursales"
                rest={storesRest}
                exportable={true}
                exportableName="stores"
                toolBar={(container) => {
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
                            text: "Nueva tienda",
                            hint: "Nueva tienda",
                            onClick: () => onModalOpen(),
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
                        dataField: "image",
                        caption: "Imagen",
                        width: "80px",
                        cellTemplate: (container, { data }) => {
                            if (data.image) {
                                container.html(
                                    renderToString(
                                        <img 
                                            src={`/storage/images/store/${data.image}`}
                                            alt={data.name}
                                            className="img-thumbnail"
                                            style={{width: "50px", height: "50px", objectFit: "cover"}}
                                        />
                                    )
                                );
                            } else {
                                container.html(
                                    renderToString(
                                        <div className="bg-light d-flex align-items-center justify-content-center" style={{width: "50px", height: "50px"}}>
                                            <i className="fas fa-store text-muted"></i>
                                        </div>
                                    )
                                );
                            }
                        },
                        allowExporting: false,
                    },
                    {
                        dataField: "name",
                        caption: "Nombre",
                        width: "200px",
                    },
                    {
                        dataField: "type",
                        caption: "Tipo",
                        width: "100px",
                        cellTemplate: (container, { data }) => {
                            const typeLabels = {
                                'tienda': 'Tienda',
                                'oficina': 'Oficina',
                                'almacen': 'Almacén',
                                'showroom': 'Showroom',
                                'otro': 'Otro'
                            };
                            const typeColors = {
                                'tienda': 'success',
                                'oficina': 'primary',
                                'almacen': 'warning',
                                'showroom': 'info',
                                'otro': 'secondary'
                            };
                            const label = typeLabels[data.type] || 'No especificado';
                            const color = typeColors[data.type] || 'secondary';
                            container.append(
                                `<span class="badge bg-${color}">${label}</span>`
                            );
                        },
                    },
                    {
                        dataField: "address",
                        caption: "Dirección",
                        width: "250px",
                    },
                    {
                        dataField: "phone",
                        caption: "Teléfono",
                        width: "120px",
                    },
                    {
                        dataField: "email",
                        caption: "Email",
                        width: "180px",
                    },
                    {
                        dataField: "manager",
                        caption: "Encargado",
                        width: "150px",
                    },
                    {
                        dataField: "ubigeo",
                        caption: "Ubicación",
                        width: "150px",
                        cellTemplate: (container, { data }) => {
                            const ubicacion = ubigeos.find(u => u.reniec == data.ubigeo);
                            if (ubicacion) {
                                container.html(
                                    renderToString(
                                        <div>
                                            <small className="d-block">{ubicacion.distrito}</small>
                                            <small className="text-muted">{ubicacion.provincia}, {ubicacion.departamento}</small>
                                        </div>
                                    )
                                );
                            } else {
                                container.text(data.ubigeo || "Sin ubicación");
                            }
                        },
                    },
                    {
                        dataField: "status",
                        caption: "Estado",
                        width: "100px",
                        cellTemplate: (container, { data }) => {
                            container.html(
                                renderToString(
                                    <span className={`badge ${data.status ? 'bg-success' : 'bg-danger'}`}>
                                        {data.status ? 'Activa' : 'Inactiva'}
                                    </span>
                                )
                            );
                        },
                    },
                    {
                        caption: "Acciones",
                        width: "100px",
                        cellTemplate: (container, { data }) => {
                            container.css("text-overflow", "unset");
                            container.append(
                                DxButton({
                                    className: "btn btn-xs btn-soft-primary me-1",
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
                title={isEditing ? "Editar Tienda" : "Agregar Tienda"}
                onSubmit={onModalSubmit}
                size="lg"
            >
                <input ref={idRef} type="hidden" />
                <div id="form-container" className="row">
                    <div className="col-md-6">
                        <InputFormGroup
                            eRef={nameRef}
                            label="Nombre de la tienda"
                            col="col-12"
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <SelectFormGroup
                            eRef={typeRef}
                            label="Tipo de establecimiento"
                            col="col-12"
                            required
                            dropdownParent={'#form-container'}
                        >
                            <option value="tienda">Tienda</option>
                            <option value="oficina">Oficina</option>
                            <option value="almacen">Almacén</option>
                            <option value="showroom">Showroom</option>
                            <option value="otro">Otro</option>
                        </SelectFormGroup>
                    </div>
                    <div className="col-md-6">
                        <InputFormGroup
                            eRef={managerRef}
                            label="Encargado"
                            col="col-12"
                        />
                    </div>
                    
                    <div className="col-12">
                        <InputFormGroup
                            eRef={addressRef}
                            label="Dirección completa"
                            col="col-12"
                            required
                        />
                    </div>

                    <div className="col-12">
                        <SelectFormGroup
                            eRef={ubigeoRef}
                            label="Distrito/Ubigeo"
                            col="col-12"
                            templateResult={ubigeoTemplate}
                            templateSelection={ubigeoTemplate}
                            dropdownParent="#form-container"
                            required
                        >
                            {ubigeos.map((x, index) => (
                                <option key={index} value={x.reniec}>
                                    {x.reniec} {x.distrito} {x.provincia} {x.departamento}
                                </option>
                            ))}
                        </SelectFormGroup>
                    </div>

                    <div className="col-md-6">
                        <InputFormGroup
                            eRef={phoneRef}
                            label="Teléfono"
                            col="col-12"
                            type="tel"
                        />
                    </div>
                    <div className="col-md-6">
                        <InputFormGroup
                            eRef={emailRef}
                            label="Email"
                            col="col-12"
                            type="email"
                        />
                    </div>

                    <div className="col-12">
                        <div className="alert alert-info">
                            <h6><i className="fas fa-map-marker-alt"></i> Cómo obtener coordenadas exactas:</h6>
                            <ol className="mb-2">
                                <li>Ve a <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">Google Maps</a></li>
                                <li>Busca la dirección exacta de tu tienda</li>
                                <li>Haz clic derecho en el marcador del lugar</li>
                                <li>Selecciona "¿Qué hay aquí?" o haz clic en las coordenadas que aparecen</li>
                                <li>Copia los valores que aparecen (ej: -12.0464, -77.0428)</li>
                            </ol>
                            <small>
                                <strong>Importante:</strong> Las coordenadas deben estar en formato decimal, no en grados/minutos/segundos.
                                Para Lima, la latitud típica es alrededor de -12 y la longitud alrededor de -77.
                            </small>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <InputFormGroup
                            eRef={latitudeRef}
                            label="Latitud (Google Maps)"
                            col="col-12"
                            type="number"
                            step="0.000000000000001"
                            min="-18.5"
                            max="-0.1"
                            placeholder="Ej: -12.042626777544823"
                        />
                        <small className="text-muted">
                            Rango válido para Perú: -18.5 a -0.1<br/>
                            Acepta hasta 15 dígitos decimales de precisión
                        </small>
                    </div>
                    <div className="col-md-6">
                        <InputFormGroup
                            eRef={longitudeRef}
                            label="Longitud (Google Maps)"
                            col="col-12"
                            type="number"
                            step="0.000000000000001"
                            min="-81.5"
                            max="-68.5"
                            placeholder="Ej: -77.04753389161506"
                        />
                        <small className="text-muted">
                            Rango válido para Perú: -81.5 a -68.5<br/>
                            Acepta hasta 15 dígitos decimales de precisión
                        </small>
                    </div>

                    <div className="col-md-6">
                        <InputFormGroup
                            eRef={capacityRef}
                            label="Capacidad de atención (personas/día)"
                            col="col-12"
                            type="number"
                            placeholder="Ej: 50"
                        />
                    </div>

                    <div className="col-md-6">
                        <SwitchFormGroup
                            eRef={statusRef}
                            label="Tienda activa"
                            col="col-12"
                        />
                    </div>

                    <div className="col-12">
                        <ImageFormGroup
                            eRef={imageRef}
                            label="Imagen de la tienda"
                            col="col-12"
                            accept="image/*"
                        />
                    </div>

                    <div className="col-12">
                        <TextareaFormGroup
                            eRef={descriptionRef}
                            label="Descripción"
                            rows={3}
                        />
                    </div>

                    {/* Horarios de atención */}
                    <div className="col-12">
                        <div className="mb-3">
                            <label className="form-label">Horarios de atención</label>
                            <div className="table-responsive">
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Día</th>
                                            <th>Apertura</th>
                                            <th>Cierre</th>
                                            <th>Cerrado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {businessHours.map((schedule, index) => (
                                            <tr key={index}>
                                                <td className="align-middle">
                                                    <strong>{schedule.day}</strong>
                                                </td>
                                                <td>
                                                    <input
                                                        type="time"
                                                        className="form-control form-control-sm"
                                                        value={schedule.open}
                                                        onChange={(e) =>
                                                            updateBusinessHours(index, "open", e.target.value)
                                                        }
                                                        disabled={schedule.closed}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="time"
                                                        className="form-control form-control-sm"
                                                        value={schedule.close}
                                                        onChange={(e) =>
                                                            updateBusinessHours(index, "close", e.target.value)
                                                        }
                                                        disabled={schedule.closed}
                                                    />
                                                </td>
                                                <td>
                                                    <div className="form-check">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            checked={schedule.closed}
                                                            onChange={(e) =>
                                                                updateBusinessHours(index, "closed", e.target.checked)
                                                            }
                                                        />
                                                        <label className="form-check-label">
                                                            Cerrado
                                                        </label>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

CreateReactScript((el, properties) => {
    createRoot(el).render(
        <BaseAdminto {...properties} title="Tiendas / Sucursales">
            <Stores {...properties} />
        </BaseAdminto>
    );
});

export default Stores;
