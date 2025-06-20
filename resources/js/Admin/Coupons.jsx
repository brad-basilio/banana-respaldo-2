import BaseAdminto from "@Adminto/Base";
import SwitchFormGroup from "@Adminto/form/SwitchFormGroup";
import TextareaFormGroup from "@Adminto/form/TextareaFormGroup";
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import Swal from "sweetalert2";
import CouponsRest from "../Actions/Admin/CouponsRest";
import Modal from "../Components/Adminto/Modal";
import Table from "../Components/Adminto/Table";
import InputFormGroup from "../Components/Adminto/form/InputFormGroup";
import SelectFormGroup from "../Components/Adminto/form/SelectFormGroup";
import SelectAPIFormGroup from "../Components/Adminto/form/SelectAPIFormGroup";
import DxButton from "../Components/dx/DxButton";
import CreateReactScript from "../Utils/CreateReactScript";
import Number2Currency from "../Utils/Number2Currency";
import ReactAppend from "../Utils/ReactAppend";
import SetSelectValue from "../Utils/SetSelectValue";

const couponsRest = new CouponsRest();

const Coupons = ({ categories, products }) => {
    const [isEditing, setIsEditing] = useState(false);

    const gridRef = useRef();
    const modalRef = useRef();

    // Form elements ref
    const idRef = useRef();
    const codeRef = useRef();
    const nameRef = useRef();
    const descriptionRef = useRef();
    const typeRef = useRef();
    const valueRef = useRef();
    const minimumAmountRef = useRef();
    const usageLimitRef = useRef();
    const usageLimitPerUserRef = useRef();
    const startsAtRef = useRef();
    const expiresAtRef = useRef();
    const maximumDiscountRef = useRef();
    const firstPurchaseOnlyRef = useRef();
   // const applicableCategoriesRef = useRef();
    //const applicableProductsRef = useRef();

    const [showMaxDiscount, setShowMaxDiscount] = useState(false);

    const onModalOpen = (data) => {
        if (data?.id) setIsEditing(true);
        else setIsEditing(false);

        // Mostrar el modal primero para que los elementos se rendericen
        $(modalRef.current).modal("show");
        
        // Usar setTimeout para asegurar que los elementos estén renderizados
        setTimeout(() => {
            if (idRef.current) idRef.current.value = data?.id ?? "";
            if (codeRef.current) codeRef.current.value = data?.code ?? "";
            if (nameRef.current) nameRef.current.value = data?.name ?? "";
            if (descriptionRef.current) descriptionRef.current.value = data?.description ?? "";
            if (valueRef.current) valueRef.current.value = data?.value ?? "";
            if (minimumAmountRef.current) minimumAmountRef.current.value = data?.minimum_amount ?? "";
            if (usageLimitRef.current) usageLimitRef.current.value = data?.usage_limit ?? "";
            if (usageLimitPerUserRef.current) usageLimitPerUserRef.current.value = data?.usage_limit_per_user ?? 1;
            if (maximumDiscountRef.current) maximumDiscountRef.current.value = data?.maximum_discount ?? "";
            
            // Formatear fechas para input datetime-local
            if (startsAtRef.current) startsAtRef.current.value = data?.starts_at ? formatDateTimeLocal(new Date(data.starts_at)) : "";
            if (expiresAtRef.current) expiresAtRef.current.value = data?.expires_at ? formatDateTimeLocal(new Date(data.expires_at)) : "";
            
            if (firstPurchaseOnlyRef.current) firstPurchaseOnlyRef.current.checked = data?.first_purchase_only ?? false;
            
            // Configurar tipo y mostrar/ocultar descuento máximo
            const selectedType = data?.type || "percentage";
            if (typeRef.current) {
                $(typeRef.current).val(selectedType).trigger("change");
                setShowMaxDiscount(selectedType === "percentage");
            }

            // Configurar selects de categorías y productos
          /*  if (applicableCategoriesRef.current) {
                if (data?.applicable_categories && data.applicable_categories.length > 0) {
                    SetSelectValue(
                        applicableCategoriesRef.current,
                        data.applicable_categories,
                        "id",
                        "name"
                    );
                } else {
                    $(applicableCategoriesRef.current).val(null).trigger('change');
                }
            }*/

          /*  if (applicableProductsRef.current) {
                if (data?.applicable_products && data.applicable_products.length > 0) {
                    SetSelectValue(
                        applicableProductsRef.current,
                        data.applicable_products,
                        "id",
                        "name"
                    );
                } else {
                    $(applicableProductsRef.current).val(null).trigger('change');
                }
            }*/
        }, 100);
    };

    const formatDateTimeLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const onModalSubmit = async (e) => {
        e.preventDefault();

        const request = {
            id: idRef.current.value || undefined,
            code: codeRef.current.value,
            name: nameRef.current.value,
            description: descriptionRef.current.value,
            type: typeRef.current.value,
            value: valueRef.current.value,
            minimum_amount: minimumAmountRef.current.value || 0,
            usage_limit: usageLimitRef.current.value || null,
            usage_limit_per_user: usageLimitPerUserRef.current.value,
            starts_at: startsAtRef.current.value,
            expires_at: expiresAtRef.current.value,
            maximum_discount: maximumDiscountRef.current.value || null,
            first_purchase_only: firstPurchaseOnlyRef.current.checked ? 1 : 0,
          //  applicable_categories: $(applicableCategoriesRef.current).val() || [],
          //  applicable_products: $(applicableProductsRef.current).val() || []
        };        const result = await couponsRest.save(request);
        if (!result) return;

        $(gridRef.current).dxDataGrid("instance").refresh();
        $(modalRef.current).modal("hide");
    };

    const onActiveChange = async ({ id, value }) => {
        const result = await couponsRest.boolean({
            id,
            field: "active",
            value,
        });
        if (!result) return;
        $(gridRef.current).dxDataGrid("instance").refresh();
    };

    const onDeleteClicked = async (id) => {
        const { isConfirmed } = await Swal.fire({
            title: "Eliminar cupón",
            text: "¿Estás seguro de eliminar este cupón?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });
        if (!isConfirmed) return;
        const result = await couponsRest.delete(id);
        if (!result) return;
        $(gridRef.current).dxDataGrid("instance").refresh();
    };

    const onTypeChange = (e) => {
        setShowMaxDiscount(e.target.value === "percentage");
    };    const generateCode = async () => {
        const code = await couponsRest.generateCode();
        if (code && codeRef.current) {
            codeRef.current.value = code;
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'active': 'badge-success',
            'expired': 'badge-danger',
            'pending': 'badge-warning',
            'exhausted': 'badge-secondary',
            'inactive': 'badge-dark'
        };
        return badges[status] || 'badge-secondary';
    };

    return (
        <>
            <Table
                gridRef={gridRef}
                title="Cupones"
                rest={couponsRest}
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
                            text: "Agregar",
                            hint: "Agregar cupón",
                            onClick: () => onModalOpen(),
                        },
                    });
                }}
                exportable={true}
                exportableName="Cupones"
                columns={[
                    {
                        dataField: "id",
                        caption: "ID",
                        visible: false,
                    },
                    {
                        dataField: "code",
                        caption: "Código",
                        width: "120px",
                        cellTemplate: (container, { data }) => {
                            container.html(
                                renderToString(
                                    <div>
                                        <strong className="font-monospace">{data.code}</strong>
                                        <br />
                                        <span className={`badge ${getStatusBadge(data.status)} badge-sm`}>
                                            {data.status_text}
                                        </span>
                                    </div>
                                )
                            );
                        },
                    },
                    {
                        dataField: "name",
                        caption: "Nombre",
                        minWidth: "200px",
                        cellTemplate: (container, { data }) => {
                            container.html(
                                renderToString(
                                    <div>
                                        <strong>{data.name}</strong>
                                        {data.description && (
                                            <>
                                                <br />
                                                <small className="text-muted">
                                                    {data.description.length > 50 
                                                        ? data.description.substring(0, 50) + '...'
                                                        : data.description
                                                    }
                                                </small>
                                            </>
                                        )}
                                    </div>
                                )
                            );
                        },
                    },
                    {
                        dataField: "type",
                        caption: "Tipo",
                        width: "100px",
                        cellTemplate: (container, { data }) => {
                            const typeText = data.type === 'percentage' ? 'Porcentaje' : 'Monto Fijo';
                            const badgeClass = data.type === 'percentage' ? 'badge-info' : 'badge-primary';
                            container.html(
                                renderToString(
                                    <span className={`badge ${badgeClass}`}>
                                        {typeText}
                                    </span>
                                )
                            );
                        },
                    },
                    {
                        dataField: "value",
                        caption: "Valor",
                        width: "100px",
                        cellTemplate: (container, { data }) => {
                            const value = data.type === 'percentage' 
                                ? `${data.value}%` 
                                : `S/. ${Number2Currency(data.value)}`;
                            container.html(renderToString(<strong>{value}</strong>));
                        },
                    },
                    {
                        dataField: "minimum_amount",
                        caption: "Mín. Compra",
                        width: "110px",
                        cellTemplate: (container, { data }) => {
                            container.html(
                                renderToString(
                                    <span>S/. {Number2Currency(data.minimum_amount)}</span>
                                )
                            );
                        },
                    },
                    {
                        dataField: "usage_limit",
                        caption: "Usos",
                        width: "80px",
                        cellTemplate: (container, { data }) => {
                            const text = data.usage_limit 
                                ? `${data.used_count}/${data.usage_limit}`
                                : `${data.used_count}/∞`;
                            container.html(renderToString(<span>{text}</span>));
                        },
                    },
                    {
                        dataField: "starts_at",
                        caption: "Inicio",
                        dataType: "datetime",
                        width: "110px",
                        format: "dd/MM/yyyy",
                    },
                    {
                        dataField: "expires_at",
                        caption: "Expiración",
                        dataType: "datetime",
                        width: "110px",
                        format: "dd/MM/yyyy",
                    },
                    {
                        dataField: "active",
                        caption: "Activo",
                        dataType: "boolean",
                        width: "80px",                        cellTemplate: (container, { data }) => {
                            ReactAppend(
                                container,
                                <SwitchFormGroup
                                    checked={data.active}
                                    onChange={(e) =>
                                        onActiveChange({
                                            id: data.id,
                                            value: e.target.checked,
                                        })
                                    }
                                />
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
                title={isEditing ? "Editar cupón" : "Agregar cupón"}
                onSubmit={onModalSubmit}
                size="xl"
            >
                <div className="row" id="coupons-form">
                    <input ref={idRef} type="hidden" />
                    
                    <div className="col-md-6">
                        <div className="row">
                            <div className="col-md-8">
                                <InputFormGroup
                                    eRef={codeRef}
                                    label="Código del cupón"
                                    required
                                    placeholder="Ej: DESCUENTO20"
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">&nbsp;</label>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary d-block"
                                    onClick={generateCode}
                                >
                                    Generar
                                </button>
                            </div>
                        </div>
                        
                        <InputFormGroup
                            eRef={nameRef}
                            label="Nombre"
                            required
                            placeholder="Nombre descriptivo del cupón"
                        />
                        
                        <TextareaFormGroup
                            eRef={descriptionRef}
                            label="Descripción"
                            rows={3}
                            placeholder="Descripción del cupón"
                        />

                        <div className="row">
                            <div className="col-md-6">
                                <SelectFormGroup
                                    eRef={typeRef}
                                    label="Tipo de descuento"
                                    required
                                    onChange={onTypeChange}
                                    dropdownParent={"#coupons-form"}
                                >
                                    <option value="percentage">Porcentaje</option>
                                    <option value="fixed">Monto fijo</option>
                                </SelectFormGroup>
                            </div>
                            <div className="col-md-6">
                                <InputFormGroup
                                    eRef={valueRef}
                                    label="Valor"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    placeholder="Ej: 20 o 50.00"
                                />
                            </div>
                        </div>

                   
                            <InputFormGroup
                                eRef={maximumDiscountRef}
                                label="Descuento máximo (S/.)"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Opcional - límite máximo de descuento"
                            />
                        

                        <InputFormGroup
                            eRef={minimumAmountRef}
                            label="Monto mínimo de compra (S/.)"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                        />
                    </div>

                    <div className="col-md-6">
                        <div className="row">
                            <div className="col-md-6">
                                <InputFormGroup
                                    eRef={usageLimitRef}
                                    label="Límite de usos"
                                    type="number"
                                    min="1"
                                    placeholder="Dejar vacío para ilimitado"
                                />
                            </div>
                            <div className="col-md-6">
                                <InputFormGroup
                                    eRef={usageLimitPerUserRef}
                                    label="Usos por usuario"
                                    type="number"
                                    min="1"
                                    defaultValue="1"
                                    required
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <InputFormGroup
                                    eRef={startsAtRef}
                                    label="Fecha de inicio"
                                    type="datetime-local"
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <InputFormGroup
                                    eRef={expiresAtRef}
                                    label="Fecha de expiración"
                                    type="datetime-local"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-check mb-3">
                            <input
                                ref={firstPurchaseOnlyRef}
                                className="form-check-input"
                                type="checkbox"
                                id="firstPurchaseOnly"
                            />
                            <label className="form-check-label" htmlFor="firstPurchaseOnly">
                                Solo primera compra
                            </label>
                        </div>

                       {/* <SelectAPIFormGroup
                            eRef={applicableCategoriesRef}
                            label="Categorías aplicables"
                            searchAPI="/api/admin/categories/paginate"
                            searchBy="name"
                            multiple
                            placeholder="Todas las categorías (dejar vacío)"
                             dropdownParent={"#coupons-form"}
                        />

                        <SelectAPIFormGroup
                            eRef={applicableProductsRef}
                            label="Productos aplicables"
                            searchAPI="/api/admin/items/paginate"
                            searchBy="name"
                            multiple
                            placeholder="Todos los productos (dejar vacío)"
                            dropdownParent={"#coupons-form"}
                        /> */}
                    </div>
                </div>
            </Modal>
        </>
    );
};

CreateReactScript((el, properties) => {
    createRoot(el).render(
        <BaseAdminto {...properties} title="Cupones">
            <Coupons {...properties} />
        </BaseAdminto>
    );
});
