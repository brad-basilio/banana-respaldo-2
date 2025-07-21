import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import BaseAdminto from "@Adminto/Base";
import CreateReactScript from "../Utils/CreateReactScript";
import Table from "../Components/Adminto/Table";
import DxButton from "../Components/dx/DxButton";
import ReactAppend from "../Utils/ReactAppend";
import Swal from "sweetalert2";
import moment from "moment";
import SalesRest from "../Actions/Admin/SalesRest";
import Global from "../Utils/Global";
import Number2Currency from "../Utils/Number2Currency";
import Modal from "../Components/Adminto/Modal";
import Tippy from "@tippyjs/react";
import SaleStatusesRest from "../Actions/Admin/SaleStatusesRest";
import SaleExportRest from "../Actions/Admin/SaleExportRest";
import * as XLSX from 'xlsx';
import SelectFormGroup from "../Components/Adminto/form/SelectFormGroup";
import { renderToString } from "react-dom/server";

const salesRest = new SalesRest();
const saleStatusesRest = new SaleStatusesRest();
const saleExportRest = new SaleExportRest();

const Sales = ({ statuses = [] }) => {
    const gridRef = useRef();
    const notifyClientRef = useRef()
    const modalRef = useRef();

    const [saleLoaded, setSaleLoaded] = useState(null);
    const [saleStatuses, setSaleStatuses] = useState([]);
    const [projectPDFs, setProjectPDFs] = useState({}); // Para cargar PDFs de proyectos
    const [statusLoading, setStatusLoading] = useState(false);

    const onStatusChange = async (e, sale) => {
        console.log({sale, saleLoaded})
        const status = statuses.find((s) => s.id == e.target.value)
        if (status.reversible == 0) {
            const { isConfirmed } = await Swal.fire({
                title: "Cambiar estado",
                text: `¿Estas seguro de cambiar el estado a ${status.name}?\nEsta acción no se puede revertir`,
                icon: "warning",
                showCancelButton: true,
            })
            if (!isConfirmed) return;
        }

        setStatusLoading(true)
        const result = await salesRest.save({
            id: sale.id,
            status_id: status.id,
            notify_client: notifyClientRef.current.checked
        });
        setStatusLoading(false)
        if (!result) return;
        const newSale = await salesRest.get(sale.id);
        setSaleLoaded(newSale.data);
        setSaleStatuses(newSale.data.tracking.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        $(gridRef.current).dxDataGrid("instance").refresh();
    };

    const onDeleteClicked = async (id) => {
        const { isConfirmed } = await Swal.fire({
            title: "Anular pedido",
            text: "¿Estas seguro de anular este pedido?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Si, anular",
            cancelButtonText: "Cancelar",
        });
        if (!isConfirmed) return;
        const result = await salesRest.delete(id);
        if (!result) return;
        $(gridRef.current).dxDataGrid("instance").refresh();
    };

    const onModalOpen = async (saleId) => {
        notifyClientRef.current.checked = true
        const newSale = await salesRest.get(saleId);
        console.log("Sale data loaded:", newSale.data); // Debug: ver todos los datos que llegan
        setSaleLoaded(newSale.data);
        
        // Cargar información de PDFs para todos los proyectos en el pedido
        const projectIds = newSale.data?.details?.map(detail => detail.colors).filter(Boolean) || [];
        const pdfData = {};
        
        for (const projectId of projectIds) {
            try {
                // Verificar si el PDF existe haciendo una petición HEAD
                const response = await fetch(`/api/customer/projects/${projectId}/download-pdf`, {
                    method: 'HEAD'
                });
                
                if (response.ok) {
                    pdfData[projectId] = {
                        pdf_generated_at: new Date().toISOString(), // Podríamos obtener la fecha real del archivo
                        exists: true
                    };
                }
            } catch (error) {
                console.log(`PDF no disponible para proyecto ${projectId}`);
                pdfData[projectId] = {
                    exists: false
                };
            }
        }
        
        setProjectPDFs(pdfData);
        $(modalRef.current).modal("show");
    };

    const downloadProjectPDF = async (projectId) => {
        try {
            const response = await fetch(`/api/customer/projects/${projectId}/download-pdf`);
            
            if (!response.ok) {
                throw new Error('PDF no disponible');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `proyecto-${projectId}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Error al descargar PDF:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo descargar el PDF del proyecto',
                icon: 'error'
            });
        }
    };

    const showExportModal = () => {
        // Función placeholder para el modal de exportación
        Swal.fire({
            title: 'Función en desarrollo',
            text: 'La funcionalidad de exportación estará disponible pronto',
            icon: 'info'
        });
    };

    useEffect(() => {
        // if (!saleLoaded) return
        // saleStatusesRest.bySale(saleLoaded.id).then((data) => {
        //   if (data) setSaleStatuses(data)
        //   else setSaleStatuses([])
        // })
    }, [saleLoaded]);

    const statusTemplate = (e) => {
        const data = $(e.element).data('status')
        if (!e.id) return
        return $(renderToString(<span title={data.description}>
            <i className={`${data?.icon || 'mdi mdi-circle'} me-1`}></i>
            {e.text}
        </span>))
    }

    const totalAmount =
        Number(saleLoaded?.amount) +
        Number(saleLoaded?.delivery || 0) -
        Number(saleLoaded?.bundle_discount || 0) -
        Number(saleLoaded?.renewal_discount || 0) -
        Number(saleLoaded?.coupon_discount || 0) 
     // -Number(saleLoaded?.promotion_discount || 0)
        ;

    return (
        <>

            <Table
                gridRef={gridRef}
                title="Pedidos"
                rest={salesRest}
                toolBar={(container) => {
                   /* container.unshift({
                        widget: "dxButton",
                        location: "after",
                        options: {
                            icon: "exportxlsx",
                            text: "Exportar para Facturación",
                            hint: "Exportar datos completos para facturador",
                            onClick: showExportModal,
                            type: "normal",
                            stylingMode: "outlined"
                        },
                    }); */
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
                }}
                columns={[
                    {
                        dataField: "id",
                        caption: "ID",
                        visible: false,
                    },
                    {
                        dataField: "name",
                        caption: "Orden",
                        width: "250px",
                        cellTemplate: (container, { data }) => {
                            container.css("cursor", "pointer");
                            container.on("click", () => {
                                onModalOpen(data.id);
                            });
                            ReactAppend(
                                container,
                                <p className="mb-0" style={{ width: "100%" }}>
                                    <b className="d-block">
                                        {data.name} {data.lastname}
                                    </b>
                                    <small
                                        className="text-nowrap text-muted"
                                        style={{
                                            overflow: "hidden",
                                            display: "-webkit-box",
                                            WebkitBoxOrient: "vertical",
                                            WebkitLineClamp: 2,
                                            fontFamily: "monospace",
                                        }}
                                    >
                                        #{Global.APP_CORRELATIVE}-{data.code}
                                    </small>
                                </p>
                            );
                        },
                    },
                    {
                        dataField: "created_at",
                        caption: "Fecha",
                        dataType: "date",
                        sortOrder: "desc",
                        cellTemplate: (container, { data }) => {
                            // container.text(moment(data.created_at).fromNow())
                            container.text(moment(data.created_at).subtract(5, 'hours').format("LLL"));
                        },
                    },
                    {
                        dataField: "status.name",
                        caption: "Estado",
                        cellTemplate: (container, { data }) => {
                            ReactAppend(
                                container,
                                <span
                                    className="badge rounded-pill"
                                    style={{
                                        backgroundColor: data.status.color
                                            ? `${data.status.color}2e`
                                            : "#3333332e",
                                        color: data.status.color ?? "#333",
                                    }}
                                >
                                    {data.status.name}
                                </span>
                            );
                        },
                    },
                    {
                        dataField: "amount",
                        caption: "Total",
                        dataType: "number",
                        cellTemplate: (container, { data }) => {
                            const amount = Number(data.amount) || 0;
                            const delivery = Number(data.delivery) || 0;
                            const bundle_discount =
                                Number(data.bundle_discount) || 0;
                            const renewal_discount =
                                Number(data.renewal_discount) || 0;
                            const coupon_discount =
                                Number(data.coupon_discount) || 0;
                            container.text(
                                `S/. ${Number2Currency(
                                    amount +
                                    delivery -
                                    bundle_discount -
                                    renewal_discount -
                                    coupon_discount
                                )}`
                            );
                        },
                    },
                    {
                        caption: "Acciones",
                        cellTemplate: (container, { data }) => {
                            container.append(
                                DxButton({
                                    className: "btn btn-xs btn-light",
                                    title: "Ver pedido",
                                    icon: "fa fa-eye",
                                    onClick: () => onModalOpen(data.id),
                                })
                            );
                            container.append(
                                DxButton({
                                    className: "btn btn-xs btn-soft-danger",
                                    title: "Anular pedido",
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
                title={`Detalles del pedido #${Global.APP_CORRELATIVE}-${saleLoaded?.code}`}
                size="xl"
                bodyStyle={{
                    backgroundColor: "#ebeff2",
                }}
                hideButtonSubmit
            >
                <div className="row">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-header p-2">
                                <h5 className="card-title mb-0">
                                    Detalles de Venta
                                </h5>
                            </div>
                            <div className="card-body p-2">
                                <table className="table table-borderless table-sm mb-0">
                                    <tbody>
                                        {saleLoaded?.payment_method && (
                                            <tr>
                                                <th>Método de pago:</th>
                                                <td>{saleLoaded?.payment_method}</td>
                                            </tr>
                                        )}
                                        {saleLoaded?.culqi_charge_id && (
                                            <tr>
                                                <th>ID de transacción:</th>
                                                <td>{saleLoaded?.culqi_charge_id}</td>
                                            </tr>
                                        )}
                                        <tr>
                                            <th>Nombres:</th>
                                            <td>{saleLoaded?.fullname}</td>
                                        </tr>
                                        <tr>
                                            <th>Email:</th>
                                            <td>{saleLoaded?.email}</td>
                                        </tr>
                                        <tr>
                                            <th>Teléfono:</th>
                                            <td>{saleLoaded?.phone}</td>
                                        </tr>
                                        {(saleLoaded?.document_type || saleLoaded?.documentType) && (
                                            <tr>
                                                <th>Tipo de documento:</th>
                                                <td>{saleLoaded?.document_type || saleLoaded?.documentType}</td>
                                            </tr>
                                        )}
                                        {saleLoaded?.document && (
                                            <tr>
                                                <th>Número de documento:</th>
                                                <td>{saleLoaded?.document}</td>
                                            </tr>
                                        )}
                                        
                                        {saleLoaded?.delivery_type && (
                                            <tr>
                                                <th>Tipo de entrega:</th>
                                                <td>
                                                    <span className="badge bg-info">
                                                        {saleLoaded?.delivery_type === 'store_pickup' ? 'Retiro en Tienda' : 
                                                         saleLoaded?.delivery_type === 'free' ? 'Envío Gratis' : 
                                                         saleLoaded?.delivery_type === 'express' ? 'Envío Express' : 
                                                         saleLoaded?.delivery_type === 'standard' ? 'Envío Estándar' :
                                                         saleLoaded?.delivery_type === 'agency' ? 'Entrega en Agencia' : 
                                                         saleLoaded?.delivery_type}
                                                    </span>
                                                </td>
                                            </tr>
                                        )}

                                        {saleLoaded?.delivery_type === 'store_pickup' && saleLoaded?.store && (
                                            <tr>
                                                <th>Tienda para retiro:</th>
                                                <td>
                                                    <strong>{saleLoaded?.store?.name}</strong>
                                                    <small className="text-muted d-block">
                                                        {saleLoaded?.store?.address}
                                                        {saleLoaded?.store?.district && (
                                                            <>, {saleLoaded?.store?.district}</>
                                                        )}
                                                        {saleLoaded?.store?.province && (
                                                            <>, {saleLoaded?.store?.province}</>
                                                        )}
                                                    </small>
                                                    {saleLoaded?.store?.phone && (
                                                        <small className="text-info d-block">
                                                            📞 {saleLoaded?.store?.phone}
                                                        </small>
                                                    )}
                                                    {saleLoaded?.store?.schedule && (
                                                        <small className="text-success d-block">
                                                            🕒 {saleLoaded?.store?.schedule}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                        )}

                                        {saleLoaded?.delivery_type && saleLoaded?.delivery_type !== 'store_pickup' && (
                                            <tr>
                                                <th>Dirección de entrega:</th>
                                                <td>
                                                    {saleLoaded?.address}{" "}
                                                    {saleLoaded?.number}
                                                    <small className="text-muted d-block">
                                                        {saleLoaded?.district},{" "}
                                                        {saleLoaded?.province},{" "}
                                                        {saleLoaded?.department}
                                                        , {saleLoaded?.country}{" "}
                                                        {saleLoaded?.zip_code && (
                                                            <>
                                                                -{" "}
                                                                {
                                                                    saleLoaded?.zip_code
                                                                }
                                                            </>
                                                        )}
                                                    </small>
                                                </td>
                                            </tr>
                                        )}

                                        {saleLoaded?.reference && (
                                            <tr>
                                                <th>Referencia:</th>
                                                <td>{saleLoaded?.reference}</td>
                                            </tr>
                                        )}

                                        {saleLoaded?.comment && (
                                            <tr>
                                                <th>Comentario:</th>
                                                <td>{saleLoaded?.comment}</td>
                                            </tr>
                                        )}

                                        {saleLoaded?.coupon_code && (
                                            <tr>
                                                <th>Cupón aplicado:</th>
                                                <td>
                                                    <span className="badge bg-success">
                                                        {saleLoaded?.coupon_code}
                                                    </span>
                                                    <small className="text-success d-block">
                                                        Descuento: S/ {Number2Currency(saleLoaded?.coupon_discount || 0)}
                                                    </small>
                                                </td>
                                            </tr>
                                        )}

                                   

                                        {saleLoaded?.invoiceType && (
                                            <tr>
                                                <th>{saleLoaded?.invoiceType}:</th>
                                                <td>{saleLoaded?.documentType} - {saleLoaded?.document} <br></br> {saleLoaded?.document && (saleLoaded?.businessName)}</td>
                                            </tr>
                                        )}

                                        {saleLoaded?.payment_proof && (
                                            <tr>
                                                <th>Comprobante de pago:</th>
                                                <td>
                                                    <Tippy
                                                        content="Ver comprobante de pago"
                                                        placement="top"
                                                    >
                                                        <a
                                                            href={`/storage/images/sale/${saleLoaded?.payment_proof}`}
                                                            target="_blank"
                                                        >
                                                            <img
                                                                src={`/storage/images/sale/${saleLoaded?.payment_proof}`}
                                                                alt="Comprobante de pago"
                                                                className="img-thumbnail"
                                                                style={{
                                                                    maxWidth:
                                                                        "150px",
                                                                    cursor: "pointer",
                                                                }}
                                                            />
                                                        </a>
                                                    </Tippy>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header p-2">
                                <h5 className="card-title mb-0">Artículos</h5>
                            </div>
                            <div className="card-body p-2 table-responsive">
                                <table className="table table-striped table-bordered table-sm table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th className="w-20">Imagen</th>
                                            <th>Nombre</th>
                                            <th>Precio</th>
                                            <th>Cantidad</th>
                                            <th>Subtotal</th>
                                            <th>PDF</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {saleLoaded?.details?.map(
                                            (detail, index) => {
                                                const quantity =
                                                    (detail.quantity * 100) /
                                                    100;
                                                const totalPrice =
                                                    detail.price *
                                                    detail.quantity;
                                                return (
                                                    <tr key={index}>
                                                        <td className="max-w-20 p-0">
                                                            {detail.image ? (
                                                                <img
                                                                    className="object-scale-down mx-auto block"
                                                                    src={`/storage/images/item/${detail.image}`}
                                                                    alt={detail.name}
                                                                    style={{
                                                                        height: '5rem',
                                                                        width: '5rem',
                                                                        objectFit: 'scale-down',
                                                                    }}
                                                                />
                                                            ) : null}
                                                        </td>                                        <td>
                                            {detail.name}{detail.colors ? ' - ' + detail.colors : ''}
                                        </td>
                                        <td align="right">
                                            <span className="text-nowrap">
                                                S/{" "}
                                                {Number2Currency(
                                                    detail.price
                                                )}
                                            </span>
                                        </td>
                                        <td align="center">
                                            {quantity}
                                        </td>
                                        <td align="right">
                                            <span className="text-nowrap">
                                                S/{" "}
                                                {Number2Currency(
                                                    totalPrice
                                                )}
                                            </span>
                                        </td>
                                        <td align="center">
                                            {detail.colors ? (
                                                <div className="d-flex flex-column gap-1">
                                                    {projectPDFs[detail.colors]?.exists !== false ? (
                                                        <>
                                                            <Tippy content="Descargar PDF del proyecto">
                                                                <button
                                                                    className="btn btn-xs btn-success"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        downloadProjectPDF(detail.colors);
                                                                    }}
                                                                >
                                                                    <i className="fa fa-download"></i> PDF
                                                                </button>
                                                            </Tippy>
                                                            <small className="text-muted">
                                                                Proyecto: {detail.colors}
                                                            </small>
                                                            {projectPDFs[detail.colors]?.pdf_generated_at && (
                                                                <small className="text-success">
                                                                    Generado: {moment(projectPDFs[detail.colors].pdf_generated_at).format('DD/MM/YY HH:mm')}
                                                                </small>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div>
                                                            <small className="text-warning">
                                                                <i className="fa fa-clock"></i> Proyecto: {detail.colors}
                                                            </small>
                                                            <small className="text-muted d-block">
                                                                PDF no disponible
                                                            </small>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <small className="text-muted">
                                                    N/A
                                                </small>
                                            )}
                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header p-2">
                                <h5 className="card-title mb-0">Resumen</h5>
                            </div>
                            <div className="card-body p-2">
                                <div className="d-flex justify-content-between">
                                    <b>Subtotal:</b>
                                    <span>
                                        S/{" "}
                                        {Number2Currency(
                                            saleLoaded?.amount * 1
                                        )}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <b>Envío:</b>
                                    <span>
                                        S/{" "}
                                        {Number2Currency(saleLoaded?.delivery)}
                                    </span>
                                </div>
                                {saleLoaded?.coupon_discount > 0 && (<div className="d-flex justify-content-between">
                                    <b>Descuento por cupon:</b>
                                    <span>
                                        - S/{" "}
                                        {Number2Currency(saleLoaded?.coupon_discount)}
                                    </span>
                                </div>
                                )}
                                <hr className="my-2" />
                                <div className="d-flex justify-content-between">
                                    <b>Total:</b>
                                    <span>
                                        <strong>
                                            S/ {Number2Currency(totalAmount)}
                                        </strong>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-header p-2">
                                <h5 className="card-title mb-0">Estado</h5>
                            </div>
                            <div className="card-body p-2 position-relative" id="statusSelectContainer">
                                {statusLoading && (
                                    <div className="position-absolute d-flex align-items-center justify-content-center" style={{
                                        top: 0, left: 0, right: 0, bottom: 0,
                                        zIndex: 1,
                                        backgroundColor: 'rgba(255, 255, 255, 0.125)',
                                        backdropFilter: 'blur(2px)',
                                        cursor: 'not-allowed'
                                    }}>
                                        <div className="spinner-border spinner-border-sm" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                )}
                                <div>
                                <SelectFormGroup label='Estado actual' dropdownParent='#statusSelectContainer' minimumResultsForSearch={-1} templateResult={statusTemplate} templateSelection={statusTemplate} onChange={(e) => onStatusChange(e, saleLoaded)} value={saleLoaded?.status_id} changeWith={[saleLoaded]} disabled={statusLoading || saleLoaded?.status?.reversible == 0}>
                                    {statuses.map((status, index) => {
                                        return (
                                            <option key={index} value={status.id} data-status={JSON.stringify(status)}>
                                                {status.name}
                                            </option>
                                        );
                                    })}
                                </SelectFormGroup>
                                </div>
                                {/* <div className="mb-2">
                                    <label
                                        htmlFor="statusSelect"
                                        className="form-label"
                                    >
                                        Estado Actual
                                    </label>
                                    <select
                                        className="form-select"
                                        id="statusSelect"
                                        value={saleLoaded?.status_id}
                                        onChange={onStatusChange}
                                        disabled={saleLoaded?.status?.reversible == 0}
                                    >
                                        {statuses.map((status, index) => {
                                            return (
                                                <option value={status.id}>
                                                    {status.name}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div> */}
                                <div className="form-check" style={{
                                    cursor: saleLoaded?.status?.reversible == 0 ? 'not-allowed' : 'pointer'
                                }}>
                                    <input
                                        ref={notifyClientRef}
                                        className="form-check-input"
                                        type="checkbox"
                                        id="notifyClient"
                                        defaultChecked
                                        disabled={saleLoaded?.status?.reversible == 0}
                                        style={{
                                            cursor: saleLoaded?.status?.reversible == 0 ? 'not-allowed' : 'pointer'
                                        }}
                                    />
                                    <label className="form-check-label" htmlFor="notifyClient" style={{
                                        cursor: saleLoaded?.status?.reversible == 0 ? 'not-allowed' : 'pointer'
                                    }}>
                                        Notificar al cliente
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header p-2">
                                <h5 className="card-title mb-0">
                                    Cambios de Estado
                                </h5>
                            </div>
                            <div className="card-body p-2 d-flex flex-column gap-1">
                                {saleStatuses?.map((ss, index) => {
                                    return (
                                        <article
                                            key={index}
                                            className="border py-1 px-2 ms-3"
                                            style={{
                                                position: "relative",
                                                borderRadius:
                                                    "16px 4px 4px 16px",
                                                backgroundColor: ss.color
                                                    ? `${ss.color}2e`
                                                    : "#3333332e",
                                            }}
                                        >
                                            <i
                                                className={`${ss.icon || 'mdi mdi-circle'} left-2`}
                                                style={{
                                                    color:
                                                        ss.color ||
                                                        "#333",
                                                    position: "absolute",
                                                    left: "-25px",
                                                    top: "50%",
                                                    transform:
                                                        "translateY(-50%)",
                                                }}
                                            ></i>
                                            <b
                                                style={{
                                                    color:
                                                        ss.color ||
                                                        "#333",
                                                }}
                                            >
                                                {ss?.name}
                                            </b>
                                            <small className="d-block text-truncate">
                                                {ss?.user_name}{" "}
                                                {ss?.user_lastname}
                                            </small>
                                            <small className="d-block text-muted">
                                                {moment(ss.created_at).format(
                                                    "YYYY-MM-DD HH:mm"
                                                )}
                                            </small>
                                        </article>
                                    );
                                })}
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
        <BaseAdminto {...properties} title="Pedidos">
            <Sales {...properties} />
        </BaseAdminto>
    );
});
