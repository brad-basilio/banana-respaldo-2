import BaseAdminto from "@Adminto/Base";
import SwitchFormGroup from "@Adminto/form/SwitchFormGroup";
import TextareaFormGroup from "@Adminto/form/TextareaFormGroup";
import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import Swal from "sweetalert2";
import AboutusRest from "../Actions/Admin/AboutusRest";
import WebDetailsRest from "../Actions/Admin/WebDetailsRest";
import BasicEditing from "../Components/Adminto/Basic/BasicEditing";
import Modal from "../Components/Adminto/Modal";
import Table from "../Components/Adminto/Table";
import DxButton from "../Components/dx/DxButton";
import InputFormGroup from "../Components/Adminto/form/InputFormGroup";
import ArrayDetails2Object from "../Utils/ArrayDetails2Object";
import CreateReactScript from "../Utils/CreateReactScript";
import ReactAppend from "../Utils/ReactAppend";
import { title } from "framer-motion/client";
import ImageFormGroup from "../Components/Adminto/form/ImageFormGroup";
import QuillFormGroup from "../Components/Adminto/form/QuillFormGroup";

const aboutusRest = new AboutusRest();
const webDetailsRest = new WebDetailsRest();

const About = ({ details: detailsDB }) => {
    const gridRef = useRef();
    const modalRef = useRef();

    // Form elements ref
    const idRef = useRef();
    const nameRef = useRef();
    const descriptionRef = useRef();
    const titleRef = useRef();
    const linkRef = useRef();
    const imageRef = useRef();

    const [isEditing, setIsEditing] = useState(false);

    const onModalOpen = (data) => {
        if (data?.id) setIsEditing(true);
        else setIsEditing(false);

        idRef.current.value = data?.id ?? "";
        nameRef.current.value = data?.name ?? "";
        descriptionRef.editor.root.innerHTML = data?.description ?? "";
        titleRef.current.value = data?.title ?? "";
        linkRef.current.value = data?.link ?? "";
        imageRef.current.value = null;
        imageRef.image.src = `/storage/images/aboutus/${
            data?.image ?? "undefined"
        }`;
        $(modalRef.current).modal("show");
    };

    const onModalSubmit = async (e) => {
        e.preventDefault();

        const request = {
            id: idRef.current.value || undefined,
            name: nameRef.current.value,
            description: descriptionRef.current.value,
            title: titleRef.current.value,
            link: linkRef.current.value,
        };

        const formData = new FormData();
        for (const key in request) {
            formData.append(key, request[key]);
        }

        const image = imageRef.current.files[0];
        if (image) {
            formData.append("image", image);
        }

        const result = await aboutusRest.save(formData);
        if (!result) return;

        $(gridRef.current).dxDataGrid("instance").refresh();
        $(modalRef.current).modal("hide");
    };

    const onStatusChange = async ({ id, status }) => {
        const result = await aboutusRest.status({ id, status });
        if (!result) return;
        $(gridRef.current).dxDataGrid("instance").refresh();
    };

    const onVisibleChange = async ({ id, value }) => {
        const result = await aboutusRest.boolean({
            id,
            field: "visible",
            value,
        });
        if (!result) return;
        $(gridRef.current).dxDataGrid("instance").refresh();
    };

    const onDeleteClicked = async (id) => {
        const { isConfirmed } = await Swal.fire({
            title: "Eliminar recurso",
            text: "¿Estas seguro de eliminar este about?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Si, eliminar",
            cancelButtonText: "Cancelar",
        });
        if (!isConfirmed) return;
        const result = await aboutusRest.delete(id);
        if (!result) return;
        $(gridRef.current).dxDataGrid("instance").refresh();
    };

    const [details, setDetails] = useState(ArrayDetails2Object(detailsDB));
    const [videoEditing, setVideoEditing] = useState(false);

    const onVideoChange = async (e) => {
        const result = webDetailsRest.save({
            page: "about",
            name: "video",
            description: e.target.value,
        });
        if (!result) return;
        setDetails((old) => ({ ...old, [`about.video`]: e.target.value }));
        setVideoEditing(false);
    };

    return (
        <>
            <Table
                gridRef={gridRef}
                title={
                    <>
                        <BasicEditing correlative="about" details={detailsDB} />
                        {videoEditing ? (
                            <input
                                className="form-control form-control-sm mb-1"
                                defaultValue={details?.[`about.video`]}
                                onBlur={onVideoChange}
                                autoFocus
                            />
                        ) : (
                            <smal
                                className="header-title mt-1"
                                onClick={() => setVideoEditing(true)}
                            >
                                {details?.[`about.video`] || "Sin video"}
                            </smal>
                        )}
                    </>
                }
                rest={aboutusRest}
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
                    //     text: 'Nuevo about',
                    //     hint: 'Nuevo about',
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
                        caption: "Sección",
                    },
                    {
                        dataField: "title",
                        caption: "Titulo",
                    },
                    {
                        dataField: "image",
                        caption: "Imagen",
                        cellTemplate: (container, { data }) => {
                            ReactAppend(
                                container,
                                <img
                                    src={`/storage/images/aboutus/${data.image}`}
                                    style={{
                                        width: "80px",
                                        height: "80px",
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
                            container.append(
                                DxButton({
                                    className: "btn btn-xs btn-soft-primary",
                                    title: "Editar",
                                    icon: "fa fa-pen",
                                    onClick: () => onModalOpen(data),
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
                title={isEditing ? "Editar about" : "Agregar about"}
                onSubmit={onModalSubmit}
                size="md"
            >
                <div className="row" id="aboutuses-container">
                    <input ref={idRef} type="hidden" />
                    <InputFormGroup
                        eRef={nameRef}
                        label="Sección"
                        col="col-12"
                        rows={2}
                        required
                        disabled
                    />
                    <InputFormGroup
                        eRef={titleRef}
                        label="Título"
                        col="col-12"
                        rows={2}
                    />
                    <InputFormGroup
                        eRef={linkRef}
                        label="Link"
                        col="col-12"
                        rows={2}
                    />
                    <QuillFormGroup eRef={descriptionRef} label="Descripción" />
                    <ImageFormGroup
                        eRef={imageRef}
                        label="Imagen"
                        col="col-12"
                        rows={3}
                    />
                </div>
            </Modal>
        </>
    );
};

CreateReactScript((el, properties) => {
    createRoot(el).render(
        <BaseAdminto {...properties} title="Nosotros">
            <About {...properties} />
        </BaseAdminto>
    );
});
