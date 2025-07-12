import BaseAdminto from "@Adminto/Base";
import TextareaFormGroup from "@Adminto/form/TextareaFormGroup";
import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import Swal from "sweetalert2";
import BannersRest from "../Actions/Admin/BannersRest";
import ImageFormGroup from "../Components/Adminto/form/ImageFormGroup";
import SwitchFormGroup from "../Components/Adminto/form/SwitchFormGroup";
import Modal from "../Components/Adminto/Modal";
import Table from "../Components/Adminto/Table";
import DxButton from "../Components/dx/DxButton";
import InputFormGroup from "../Components/Adminto/form/InputFormGroup";
import CreateReactScript from "../Utils/CreateReactScript";
import ReactAppend from "../Utils/ReactAppend";

const bannersRest = new BannersRest();

const Banners = ({ pages }) => {
    const gridRef = useRef();
    const modalRef = useRef();

    // Form elements ref
    const idRef = useRef();
    const nameRef = useRef();
    const descriptionRef = useRef();
    const backgroundRef = useRef();
    const imageRef = useRef();
    const buttonTextRef = useRef();
    const buttonLinkRef = useRef();
    const absoluteRef = useRef();

    const [isEditing, setIsEditing] = useState(false);

    const onModalOpen = (banner) => {
        if (banner?.id) setIsEditing(true);
        else setIsEditing(false);

        idRef.current.value = banner?.id ?? "";
        nameRef.current.value = banner?.data?.name ?? "";
        descriptionRef.current.value = banner?.data?.description ?? "";
        backgroundRef.current.value = null;
        backgroundRef.image.src = `/storage/images/system/${banner?.data?.background}`;
        imageRef.current.value = null;
        imageRef.image.src = `/storage/images/system/${banner?.data?.image}`;
        buttonTextRef.current.value = banner?.data?.button_text ?? "";
        buttonLinkRef.current.value = banner?.data?.button_link ?? "";

        if (absoluteRef.current) {
            absoluteRef.current.checked = banner?.data?.contenedor === 'absoluto';
        }

        $(modalRef.current).modal("show");
    };

    const onModalSubmit = async (e) => {
        e.preventDefault();

        const request = {
            id: idRef.current.value || undefined,
            name: nameRef.current.value,
            description: descriptionRef.current.value,
            button_text: buttonTextRef.current.value,
            button_link: buttonLinkRef.current.value,
            contenedor: absoluteRef.current?.checked ? 'absoluto' : 'relativo'
        };

        const formData = new FormData();
        for (const key in request) {
            formData.append(key, request[key]);
        }

        const background = backgroundRef.current.files[0];
        if (background) {
            formData.append("background", background);
        }
        const image = imageRef.current.files[0];
        if (image) {
            formData.append("image", image);
        }

        const result = await bannersRest.save(formData);
        if (!result) return;

        $(gridRef.current).dxDataGrid("instance").refresh();
        $(modalRef.current).modal("hide");
    };

    const onVisibleChange = async ({ id, value }) => {
        const result = await bannersRest.boolean({
            id,
            field: "visible",
            value,
        });
        if (!result) return;
        $(gridRef.current).dxDataGrid("instance").refresh();
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
        const result = await bannersRest.delete(id);
        if (!result) return;
        $(gridRef.current).dxDataGrid("instance").refresh();
    };

    return (
        <>
            <Table
                gridRef={gridRef}
                title="Banners"
                rest={bannersRest}
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
                    // container.unshift({
                    //   widget: 'dxButton', location: 'after',
                    //   options: {
                    //     icon: 'plus',
                    //     text: 'Nuevo banner',
                    //     hint: 'Nuevo banner',
                    //     onClick: () => onModalOpen()
                    //   }
                    // });
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
                        cellTemplate: (container, { data }) => {
                            const page = pages.find(
                                (x) => x.id == data?.page_id
                            );
                            container.html(
                                renderToString(
                                    <>
                                        <b className="d-block">{data?.name}</b>
                                        <small className="text-muted">
                                            Pagina: {page?.name}
                                        </small>
                                    </>
                                )
                            );
                        },
                    },
                    {
                        dataField: "after.name",
                        caption: "Despues de",
                    },
                    {
                        dataField: "background",
                        caption: "Fondo",
                        width: "90px",
                        allowFiltering: false,
                        cellTemplate: (container, { data }) => {
                            ReactAppend(
                                container,
                                <img
                                    src={`/storage/images/system/${data?.data?.background}`}
                                    style={{
                                        width: "80px",
                                        height: "48px",
                                        objectFit: "cover",
                                        objectPosition: "center",
                                        borderRadius: "4px",
                                    }}
                                    onError={(e) =>
                                        (e.target.src =
                                            "/api/cover/thumbnail/null")
                                    }
                                />
                            );
                        },
                    },
                    {
                        dataField: "image",
                        caption: "Imagen",
                        width: "90px",
                        allowFiltering: false,
                        cellTemplate: (container, { data }) => {
                            ReactAppend(
                                container,
                                <img
                                    src={`/storage/images/system/${data?.data?.image}`}
                                    style={{
                                        width: "80px",
                                        height: "48px",
                                        objectFit: "cover",
                                        objectPosition: "center",
                                        borderRadius: "4px",
                                    }}
                                    onError={(e) =>
                                        (e.target.src =
                                            "/api/cover/thumbnail/null")
                                    }
                                />
                            );
                        },
                    },
                    {
                        dataField: "visible",
                        caption: "Visible",
                        dataType: "boolean",
                        cellTemplate: (container, { data }) => {
                            $(container).empty();
                            ReactAppend(
                                container,
                                <SwitchFormGroup
                                    checked={data.visible == 1}
                                    onChange={() =>
                                        onVisibleChange({
                                            id: data.id,
                                            value: !data.visible,
                                        })
                                    }
                                />
                            );
                        },
                    },
                    {
                        caption: "Acciones",
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
                title={isEditing ? "Editar banner" : "Agregar banner"}
                onSubmit={onModalSubmit}
                size="md"
            >
                <input ref={idRef} type="hidden" />
                <ImageFormGroup eRef={backgroundRef} label="Fondo" />
                <div className="row">
                    <div className="col-sm-6">
                        <ImageFormGroup
                            eRef={imageRef}
                            label="Imagen"
                            aspect={1}
                        />
                    </div>
                    <div className="col-sm-6">
                        <TextareaFormGroup
                            eRef={nameRef}
                            label="Titulo"
                            rows={2}
                        />
                        <TextareaFormGroup
                            eRef={descriptionRef}
                            label="Descripción"
                            rows={2}
                        />
                        <InputFormGroup
                            eRef={buttonTextRef}
                            label="Texto botón"
                        />
                    </div>
                </div>
                <InputFormGroup eRef={buttonLinkRef} label="URL botón" />
                
                <div className="form-group row">
                    <label className="col-sm-3 col-form-label">Posición</label>
                    <div className="col-sm-9">
                        <div className="custom-control custom-switch">
                            <input 
                                type="checkbox" 
                                className="custom-control-input" 
                                id="absoluteSwitch"
                                ref={absoluteRef}
                            />
                            <label className="custom-control-label" htmlFor="absoluteSwitch">
                                Imagen absoluta
                            </label>
                        </div>
                        <small className="form-text text-muted">
                            Marca esta opción para posicionamiento absoluto de la imagen
                        </small>
                    </div>
                </div>
            </Modal>
        </>
    );
};

CreateReactScript((el, properties) => {
    createRoot(el).render(
        <BaseAdminto {...properties} title="Banners">
            <Banners {...properties} />
        </BaseAdminto>
    );
});
