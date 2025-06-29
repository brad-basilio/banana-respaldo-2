import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import BaseAdminto from "@Adminto/Base";
import CreateReactScript from "../Utils/CreateReactScript";
import Table from "../Components/Adminto/Table";
import DxButton from "../Components/dx/DxButton";
import ReactAppend from "../Utils/ReactAppend";
import Swal from "sweetalert2";
import ProjectsRest from "../Actions/Customer/ProjectsRest";
import Global from "../Utils/Global";
import Modal from "../Components/Adminto/Modal";
import Tippy from "@tippyjs/react";

const projectsRest = new ProjectsRest();

const Albums = ({ statuses = [] }) => {
    const gridRef = useRef();
    const modalRef = useRef();

    const [projectLoaded, setProjectLoaded] = useState(null);

    const onDeleteClicked = async (id) => {
        const { isConfirmed } = await Swal.fire({
            title: "Eliminar proyecto",
            text: "¿Estás seguro de eliminar este proyecto?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });
        if (!isConfirmed) return;
        
        const result = await projectsRest.delete(id);
        if (!result) return;
        $(gridRef.current).dxDataGrid("instance").refresh();
    };

    const onModalOpen = async (projectId) => {
        const newProject = await projectsRest.get(projectId);
        setProjectLoaded(newProject.data);
        $(modalRef.current).modal("show");
    };

    const onEditProject = (projectId) => {
        window.location.href = `/canva2?project=${projectId}`;
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'draft': { color: '#fbbf24', text: 'Borrador' },
            'completed': { color: '#10b981', text: 'Completado' },
            'exported': { color: '#3b82f6', text: 'Exportado' },
            'ordered': { color: '#8b5cf6', text: 'Pedido realizado' }
        };
        
        const config = statusConfig[status] || { color: '#6b7280', text: 'Desconocido' };
        return {
            backgroundColor: `${config.color}20`,
            color: config.color,
            text: config.text
        };
    };

    const canEdit = (status) => {
        return status === 'draft';
    };

    // Custom REST object para proyectos
    const projectsRestTable = projectsRest;

    return (
        <>
            <Table
                gridRef={gridRef}
                title="Mis Proyectos"
                rest={projectsRestTable}
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
                            text: "Catálogo",
                           
                            onClick: () => {
                                window.location.href = "/catalago";
                            },
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
                        caption: "Proyecto",
                        width: "300px",
                        cellTemplate: (container, { data }) => {
                            container.css("cursor", "pointer");
                            container.on("click", () => {
                                onModalOpen(data.id);
                            });
                            ReactAppend(
                                container,
                                <div className="d-flex align-items-center">
                                    <div className="me-3">
                                        <img
                                            src={data.thumbnail || "/assets/img/backgrounds/resources/default-image.png"}
                                            alt={data.name}
                                            className="rounded"
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                objectFit: "cover"
                                            }}
                                            onError={(e) => {
                                                e.target.src = "/assets/img/backgrounds/resources/default-image.png";
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <p className="mb-1 fw-bold">
                                            {data.name || 'Proyecto sin título'}
                                        </p>
                                        <small className="text-muted">
                                            {data.description || 'Sin descripción'}
                                        </small>
                                    </div>
                                </div>
                            );
                        },
                    },
                    {
                        dataField: "created_at",
                        caption: "Fecha Creación",
                        dataType: "date",
                        sortOrder: "desc",
                        cellTemplate: (container, { data }) => {
                            container.text(
                                moment(data.created_at).format("DD/MM/YYYY HH:mm")
                            );
                        },
                    },
                    {
                        dataField: "updated_at",
                        caption: "Última Modificación",
                        dataType: "date",
                        cellTemplate: (container, { data }) => {
                            container.text(
                                moment(data.updated_at).format("DD/MM/YYYY HH:mm")
                            );
                        },
                    },
                    {
                        dataField: "status",
                        caption: "Estado",
                        cellTemplate: (container, { data }) => {
                            const badge = getStatusBadge(data.status);
                            ReactAppend(
                                container,
                                <span
                                    className="badge rounded-pill px-3 py-2"
                                    style={{
                                        backgroundColor: badge.backgroundColor,
                                        color: badge.color,
                                        fontSize: '12px'
                                    }}
                                >
                                    {badge.text}
                                </span>
                            );
                        },
                    },
                    {
                        caption: "Acciones",
                        cellTemplate: (container, { data }) => {
                            const isEditable = canEdit(data.status);
                            
                            container.append(
                                DxButton({
                                    className: "btn btn-xs btn-light me-1",
                                    title: "Ver proyecto",
                                    icon: "fa fa-eye",
                                    onClick: () => onModalOpen(data.id),
                                })
                            );

                            if (isEditable) {
                                container.append(
                                    DxButton({
                                        className: "btn btn-xs btn-primary me-1",
                                        title: "Editar proyecto",
                                        icon: "fa fa-edit",
                                        onClick: () => onEditProject(data.id),
                                    })
                                );

                                container.append(
                                    DxButton({
                                        className: "btn btn-xs btn-danger",
                                        title: "Eliminar proyecto",
                                        icon: "fa fa-trash",
                                        onClick: () => onDeleteClicked(data.id),
                                    })
                                );
                            } else {
                                ReactAppend(
                                    container,
                                    <Tippy content="Los proyectos finalizados no se pueden editar o eliminar">
                                        <span className="badge bg-secondary ms-2">Finalizado</span>
                                    </Tippy>
                                );
                            }
                        },
                        allowFiltering: false,
                        allowExporting: false,
                    },
                ]}
            />
            
            <Modal
                modalRef={modalRef}
                title={`Detalles del proyecto: ${projectLoaded?.name || 'Sin título'}`}
                size="lg"
                bodyStyle={{
                    backgroundColor: "#ebeff2",
                }}
                hideButtonSubmit
            >
                <div className="row">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-header p-3">
                                <h5 className="card-title mb-0">
                                    Información del Proyecto
                                </h5>
                            </div>
                            <div className="card-body p-3">
                                <table className="table table-borderless table-sm mb-0">
                                    <tbody>
                                        <tr>
                                            <th style={{width: '140px'}}>Nombre:</th>
                                            <td>{projectLoaded?.name || 'Sin título'}</td>
                                        </tr>
                                        <tr>
                                            <th>Descripción:</th>
                                            <td>{projectLoaded?.description || 'Sin descripción'}</td>
                                        </tr>
                                        <tr>
                                            <th>Estado:</th>
                                            <td>
                                                {(() => {
                                                    const badge = getStatusBadge(projectLoaded?.status);
                                                    return (
                                                        <span
                                                            className="badge rounded-pill px-3 py-2"
                                                            style={{
                                                                backgroundColor: badge.backgroundColor,
                                                                color: badge.color,
                                                            }}
                                                        >
                                                            {badge.text}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Creado:</th>
                                            <td>{projectLoaded ? moment(projectLoaded.created_at).format("DD/MM/YYYY HH:mm") : '-'}</td>
                                        </tr>
                                        <tr>
                                            <th>Modificado:</th>
                                            <td>{projectLoaded ? moment(projectLoaded.updated_at).format("DD/MM/YYYY HH:mm") : '-'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {projectLoaded?.configuration && (
                            <div className="card">
                                <div className="card-header p-3">
                                    <h5 className="card-title mb-0">Configuración</h5>
                                </div>
                                <div className="card-body p-3">
                                    <pre className="bg-light p-3 rounded" style={{fontSize: '12px'}}>
                                        {JSON.stringify(JSON.parse(projectLoaded.configuration || '{}'), null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-header p-3">
                                <h5 className="card-title mb-0">Vista Previa</h5>
                            </div>
                            <div className="card-body p-3 text-center">
                                <img
                                    src={projectLoaded?.thumbnail || "/assets/img/backgrounds/resources/default-image.png"}
                                    alt="Vista previa"
                                    className="img-fluid rounded shadow"
                                    style={{maxHeight: '200px'}}
                                    onError={(e) => {
                                        e.target.src = "/assets/img/backgrounds/resources/default-image.png";
                                    }}
                                />
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header p-3">
                                <h5 className="card-title mb-0">Acciones</h5>
                            </div>
                            <div className="card-body p-3 d-grid gap-2">
                                {canEdit(projectLoaded?.status) ? (
                                    <>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => onEditProject(projectLoaded?.id)}
                                        >
                                            <i className="fa fa-edit me-2"></i>
                                            Continuar Editando
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => {
                                                $(modalRef.current).modal("hide");
                                                onDeleteClicked(projectLoaded?.id);
                                            }}
                                        >
                                            <i className="fa fa-trash me-2"></i>
                                            Eliminar Proyecto
                                        </button>
                                    </>
                                ) : (
                                    <div className="alert alert-info mb-0">
                                        <i className="fa fa-info-circle me-2"></i>
                                        Este proyecto está finalizado y no se puede editar.
                                    </div>
                                )}
                                
                                <a
                                    href="/catalogo"
                                    className="btn btn-success"
                                >
                                    <i className="fa fa-plus me-2"></i>
                                    Ir a la web
                                </a>
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
        <BaseAdminto {...properties} title="Mis Proyectos">
            <Albums {...properties} />
        </BaseAdminto>
    );
});
