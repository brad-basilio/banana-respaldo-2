import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import BaseAdminto from "@Adminto/Base";
import CreateReactScript from "../Utils/CreateReactScript";
import Table from "../Components/Adminto/Table";
import DxButton from "../Components/dx/DxButton";
import ReactAppend from "../Utils/ReactAppend";
import Swal from "sweetalert2";
import SalesRest from "../Actions/Admin/SalesRest";
import Global from "../Utils/Global";
import Number2Currency from "../Utils/Number2Currency";
import Modal from "../Components/Adminto/Modal";
import Tippy from "@tippyjs/react";
import SaleStatusesRest from "../Actions/Admin/SaleStatusesRest";
import SaleExportRest from "../Actions/Admin/SaleExportRest";
import * as XLSX from 'xlsx';

const salesRest = new SalesRest();
const saleStatusesRest = new SaleStatusesRest();
const saleExportRest = new SaleExportRest();

const Sales = ({ statuses = [] }) => {
    const gridRef = useRef();
    const modalRef = useRef();

    const [saleLoaded, setSaleLoaded] = useState(null);
    const [saleStatuses, setSaleStatuses] = useState([]);

    const onStatusChange = async (e) => {
        const result = await salesRest.save({
            id: saleLoaded.id,
            status_id: e.target.value,
        });
        console.log("onStatusChange", result);
        if (!result) return;
        setSaleLoaded(result);
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
        const newSale = await salesRest.get(saleId);
        console.log("Sale data loaded:", newSale.data); // Debug: ver todos los datos que llegan
        setSaleLoaded(newSale.data);
        $(modalRef.current).modal("show");
    };

    const [exportFilters, setExportFilters] = useState({
        startDate: '',
        endDate: '',
        status: ''
    });

    const showExportModal = () => {
        Swal.fire({
            title: 'Exportar Ventas a Excel',
            html: `
                <div style="text-align: left; margin: 20px 0;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Fecha inicio:</label>
                        <input type="date" id="startDate" class="swal2-input" style="width: 100%; box-sizing: border-box;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Fecha fin:</label>
                        <input type="date" id="endDate" class="swal2-input" style="width: 100%; box-sizing: border-box;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Estado (opcional):</label>
                        <select id="statusFilter" class="swal2-input" style="width: 100%; box-sizing: border-box;">
                            <option value="">Todos los estados</option>
                            ${saleStatuses.map(status => 
                                `<option value="${status.id}">${status.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div style="margin-top: 20px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                        <small style="color: #6c757d;">
                            <strong>Tip:</strong> Si no seleccionas fechas, se exportarán todas las ventas.
                        </small>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Exportar Excel',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#28a745',
            width: '500px',
            preConfirm: () => {
                const startDate = document.getElementById('startDate').value;
                const endDate = document.getElementById('endDate').value;
                const status = document.getElementById('statusFilter').value;

                // Validación básica
                if (startDate && endDate && startDate > endDate) {
                    Swal.showValidationMessage('La fecha de inicio no puede ser mayor a la fecha fin');
                    return false;
                }

                return {
                    startDate,
                    endDate,
                    status
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const filters = result.value;
                exportToExcel(filters);
            }
        });
    };

    const exportToExcel = async (filters = {}) => {
        try {
            // Mostrar indicador de carga
            Swal.fire({
                title: 'Exportando datos...',
                text: 'Por favor espere mientras se preparan los datos para exportación',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Preparar parámetros para la consulta
            const params = new URLSearchParams();
            if (filters.startDate) params.append('start_date', filters.startDate);
            if (filters.endDate) params.append('end_date', filters.endDate);
            if (filters.status) params.append('status', filters.status);

            // Obtener datos completos desde el controlador especializado
            const url = `/api/admin/sales/export-data${params.toString() ? '?' + params.toString() : ''}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Error al obtener los datos');
            }

            const salesData = data.data;

            if (salesData.length === 0) {
                Swal.fire({
                    title: "Sin datos",
                    text: `No hay ventas para exportar con los filtros seleccionados.
                           ${filters.startDate ? `\nFecha inicio: ${filters.startDate}` : ''}
                           ${filters.endDate ? `\nFecha fin: ${filters.endDate}` : ''}
                           ${filters.status ? `\nEstado filtrado: ${saleStatuses.find(s => s.id == filters.status)?.name || 'Desconocido'}` : ''}`,
                    icon: "info"
                });
                return;
            }

            // Formatear datos para Excel
            const excelData = salesData.map(sale => ({
                'ID_PEDIDO': sale.correlative_code,
                'FECHA': sale.created_at,
                'ESTADO': sale.status_name,
                'CLIENTE_NOMBRES': sale.fullname,
                'CLIENTE_EMAIL': sale.email,
                'CLIENTE_TELEFONO': sale.phone,
                'TIPO_DOCUMENTO': sale.document_type,
                'NUMERO_DOCUMENTO': sale.document,
                'RAZON_SOCIAL': sale.business_name,
                'TIPO_COMPROBANTE': sale.invoice_type,
                'METODO_PAGO': sale.payment_method,
                'ID_TRANSACCION': sale.culqi_charge_id,
                'ESTADO_PAGO': sale.payment_status,
                'TIPO_ENTREGA': sale.delivery_type,
                'DIRECCION_ENTREGA': sale.full_address,
                'TIENDA_RETIRO': sale.store_name,
                'DIRECCION_TIENDA': sale.store_address,
                'TELEFONO_TIENDA': sale.store_phone,
                'HORARIO_TIENDA': sale.store_schedule,
                'REFERENCIA': sale.reference,
                'COMENTARIO': sale.comment,
                'UBIGEO': sale.ubigeo,
                'PRODUCTOS': sale.products_formatted,
                'CANTIDAD_PRODUCTOS': sale.products_count,
                'CANTIDAD_TOTAL': sale.products_total_quantity,
                'SUBTOTAL': sale.subtotal,
                'COSTO_ENVIO': sale.delivery_cost,
                'DESCUENTO_PAQUETE': sale.bundle_discount,
                'DESCUENTO_RENOVACION': sale.renewal_discount,
                'DESCUENTO_CUPON': sale.coupon_discount,
                'CODIGO_CUPON': sale.coupon_code,
                'DESCUENTO_PROMOCION': sale.promotion_discount,
                'PROMOCIONES_APLICADAS': sale.applied_promotions,
                'TOTAL_FINAL': sale.total_amount
            }));

            // Crear libro de Excel
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(excelData);

            // Configurar ancho de columnas optimizado
            const columnWidths = [
                { wch: 15 }, // ID_PEDIDO
                { wch: 18 }, // FECHA
                { wch: 12 }, // ESTADO
                { wch: 25 }, // CLIENTE_NOMBRES
                { wch: 30 }, // CLIENTE_EMAIL
                { wch: 15 }, // CLIENTE_TELEFONO
                { wch: 15 }, // TIPO_DOCUMENTO
                { wch: 15 }, // NUMERO_DOCUMENTO
                { wch: 30 }, // RAZON_SOCIAL
                { wch: 15 }, // TIPO_COMPROBANTE
                { wch: 15 }, // METODO_PAGO
                { wch: 20 }, // ID_TRANSACCION
                { wch: 15 }, // ESTADO_PAGO
                { wch: 15 }, // TIPO_ENTREGA
                { wch: 50 }, // DIRECCION_ENTREGA
                { wch: 25 }, // TIENDA_RETIRO
                { wch: 30 }, // DIRECCION_TIENDA
                { wch: 15 }, // TELEFONO_TIENDA
                { wch: 20 }, // HORARIO_TIENDA
                { wch: 20 }, // REFERENCIA
                { wch: 30 }, // COMENTARIO
                { wch: 10 }, // UBIGEO
                { wch: 60 }, // PRODUCTOS
                { wch: 10 }, // CANTIDAD_PRODUCTOS
                { wch: 10 }, // CANTIDAD_TOTAL
                { wch: 12 }, // SUBTOTAL
                { wch: 12 }, // COSTO_ENVIO
                { wch: 15 }, // DESCUENTO_PAQUETE
                { wch: 18 }, // DESCUENTO_RENOVACION
                { wch: 15 }, // DESCUENTO_CUPON
                { wch: 15 }, // CODIGO_CUPON
                { wch: 18 }, // DESCUENTO_PROMOCION
                { wch: 40 }, // PROMOCIONES_APLICADAS
                { wch: 12 }  // TOTAL_FINAL
            ];

            worksheet['!cols'] = columnWidths;
            
            // Agregar hoja al libro
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas_Facturacion');

            // Generar nombre del archivo con información de filtros
            let filename = 'ventas_facturacion';
            if (filters.startDate || filters.endDate) {
                filename += '_' + (filters.startDate || 'inicio') + '_al_' + (filters.endDate || 'fin');
            }
            if (filters.status) {
                const statusName = saleStatuses.find(s => s.id == filters.status)?.name || 'estado';
                filename += '_' + statusName.toLowerCase().replace(/\s+/g, '_');
            }
            filename += '_' + moment().format('YYYY-MM-DD_HH-mm') + '.xlsx';

            // Descargar archivo
            XLSX.writeFile(workbook, filename);

            // Mostrar mensaje de éxito con estadísticas detalladas
            let filterInfo = '';
            if (filters.startDate) filterInfo += `\n📅 Desde: ${filters.startDate}`;
            if (filters.endDate) filterInfo += `\n📅 Hasta: ${filters.endDate}`;
            if (filters.status) {
                const statusName = saleStatuses.find(s => s.id == filters.status)?.name;
                filterInfo += `\n📊 Estado: ${statusName}`;
            }

            Swal.fire({
                title: "¡Exportación exitosa! 🎉",
                html: `
                    <div style="text-align: left; margin: 15px 0; font-size: 14px;">
                        <p><strong>📊 Total de ventas exportadas:</strong> ${salesData.length}</p>
                        <p><strong>📄 Archivo generado:</strong> ${filename}</p>
                        ${filterInfo ? `<p><strong>🔍 Filtros aplicados:</strong>${filterInfo}</p>` : ''}
                        <hr style="margin: 10px 0;">
                        <small style="color: #6c757d;">
                            El archivo Excel contiene toda la información detallada de las ventas seleccionadas, 
                            incluyendo datos del cliente, productos, montos y métodos de pago.
                        </small>
                    </div>
                `,
                icon: "success",
                confirmButtonText: "Entendido",
                confirmButtonColor: '#28a745',
                timer: 5000,
                timerProgressBar: true
            });

        } catch (error) {
            console.error('Error al exportar:', error);
            Swal.fire({
                title: "Error en la exportación",
                text: error.message || "No se pudo exportar los datos. Intente nuevamente.",
                icon: "error"
            });
        }
    };

    useEffect(() => {
        // if (!saleLoaded) return
        // saleStatusesRest.bySale(saleLoaded.id).then((data) => {
        //   if (data) setSaleStatuses(data)
        //   else setSaleStatuses([])
        // })
    }, [saleLoaded]);

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
                    container.unshift({
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
                            container.text(
                                moment(data.created_at).format("LLL")
                            );
                        },
                    },
                    {
                        dataField: "status.name",
                        caption: "Estado",
                        cellTemplate: (container, { data }) => {
                            console.log(data);
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
                                                <td>{saleLoaded?.documentType} - {saleLoaded?.document} <br></br> {saleLoaded?.document && ( saleLoaded?.businessName )}</td>
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
                                                        </td>
                                                        <td>
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
                                
                                {/* Mostrar descuentos solo como información debajo de Envío */}
                                {saleLoaded?.bundle_discount > 0 && (
                                    <div className="d-flex justify-content-between text-success">
                                        <span>Descuento por paquete:</span>
                                        <span>
                                            -S/ {Number2Currency(saleLoaded?.bundle_discount)}
                                        </span>
                                    </div>
                                )}
                                {saleLoaded?.renewal_discount > 0 && (
                                    <div className="d-flex justify-content-between text-success">
                                        <span>Descuento por renovación:</span>
                                        <span>
                                            -S/ {Number2Currency(saleLoaded?.renewal_discount)}
                                        </span>
                                    </div>
                                )}
                                {saleLoaded?.coupon_discount > 0 && (
                                    <div className="d-flex justify-content-between text-success">
                                        <span>
                                            Descuento con cupón
                                            {saleLoaded?.coupon_code && (
                                                <small className="text-muted d-block">
                                                    Código: {saleLoaded?.coupon_code}
                                                </small>
                                            )}
                                        </span>
                                        <span>
                                            -S/ {Number2Currency(saleLoaded?.coupon_discount)}
                                        </span>
                                    </div>
                                )}
                                {saleLoaded?.promotion_discount > 0 && (
                                    <div className="d-flex justify-content-between text-info">
                                        <span>
                                            {console.log(saleLoaded?.promotion_discount)    }
                                            Descuentos por promociones
                                            {saleLoaded?.applied_promotions && (
                                                <small className="text-muted d-block">
                                                    {JSON.parse(saleLoaded.applied_promotions).map((promo, index) => (
                                                        <div key={index}>
                                                            • {promo.name}: {promo.description}
                                                        </div>
                                                    ))}
                                                </small>
                                            )}
                                        </span>
                                        <span>
                                            -S/ {Number2Currency(saleLoaded?.promotion_discount)}
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
                            <div className="card-body p-2">
                                <div className="">
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
                                        //  disabled={!saleLoaded?.status?.reversible}
                                    >
                                        {statuses.map((status, index) => {
                                            return (
                                                <option value={status.id}>
                                                    {status.name}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="card" hidden>
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
                                            class="border py-1 px-2 ms-3"
                                            style={{
                                                position: "relative",
                                                borderRadius:
                                                    "16px 4px 4px 16px",
                                                backgroundColor: ss.status.color
                                                    ? `${ss.status.color}2e`
                                                    : "#3333332e",
                                            }}
                                        >
                                            <i
                                                className="mdi mdi-circle left-2"
                                                style={{
                                                    color:
                                                        ss.status.color ||
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
                                                        ss.status.color ||
                                                        "#333",
                                                }}
                                            >
                                                {ss?.status?.name}
                                            </b>
                                            <small className="d-block text-truncate">
                                                {ss?.user?.name}{" "}
                                                {ss?.user?.lastname}
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
