import BaseAdminto from "@Adminto/Base";
import SwitchFormGroup from "@Adminto/form/SwitchFormGroup";
import TextareaFormGroup from "@Adminto/form/TextareaFormGroup";
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import Swal from "sweetalert2";
import ItemsRest from "../Actions/Admin/ItemsRest";
import Modal from "../Components/Adminto/Modal";
import Table from "../Components/Adminto/Table";
import ImageFormGroup from "../Components/Adminto/form/ImageFormGroup";
import InputFormGroup from "../Components/Adminto/form/InputFormGroup";
import QuillFormGroup from "../Components/Adminto/form/QuillFormGroup";
import SelectAPIFormGroup from "../Components/Adminto/form/SelectAPIFormGroup";
import SelectFormGroup from "../Components/Adminto/form/SelectFormGroup";
import DxButton from "../Components/dx/DxButton";
import CreateReactScript from "../Utils/CreateReactScript";
import Number2Currency from "../Utils/Number2Currency";
import ReactAppend from "../Utils/ReactAppend";
import SetSelectValue from "../Utils/SetSelectValue";
import ItemsGalleryRest from "../Actions/Admin/ItemsGalleryRest";
import DynamicField from "../Components/Adminto/form/DynamicField";
import ModalImportItem from "./Components/ModalImportItem";

const itemsRest = new ItemsRest();

const Items = ({ categories, brands, collections }) => {
    //!FALTA EDIT AND DELETEDE GALERIA
    
    const [itemData, setItemData] = useState([]);

    const gridRef = useRef();
    const modalRef = useRef();

    // Form elements ref

    const idRef = useRef();
    const categoryRef = useRef();
    const collectionRef = useRef();
    const subcategoryRef = useRef();
    const brandRef = useRef();
    const nameRef = useRef();
    const colorRef = useRef();
    const summaryRef = useRef();
    const priceRef = useRef();
    const discountRef = useRef();
    const tagsRef = useRef();
    const bannerRef = useRef();
    const imageRef = useRef();
    const textureRef = useRef();
    const descriptionRef = useRef();
    // Nuevos campos

    const stockRef = useRef();

    const featuresRef = useRef([]);

    const specificationsRef = useRef([]);

    const [isEditing, setIsEditing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedCollection, setSelectedCollection] = useState(null);
    /*ADD NEW LINES GALLERY */

    const [gallery, setGallery] = useState([]);
    const galleryRef = useRef();

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));
        setGallery((prev) => [...prev, ...newImages]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        const newImages = files.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));
        setGallery((prev) => [...prev, ...newImages]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const removeGalleryImage = (e, index) => {
        e.preventDefault();
        const image = gallery[index];
        if (image.id) {
            // Si la imagen tiene ID, significa que está guardada en la base de datos.
            setGallery((prev) =>
                prev.map((img, i) =>
                    i === index ? { ...img, toDelete: true } : img
                )
            );
        } else {
            // Si es una imagen nueva, simplemente la eliminamos.
            setGallery((prev) => prev.filter((_, i) => i !== index));
        }
    };

    /*************************/

    useEffect(() => {
        if (itemData && itemData.images) {
            const existingImages = itemData.images.map((img) => ({
                id: img.id, // ID de la imagen en la BD
                url: `/storage/images/item/${img.url}`, // Ruta de la imagen almacenada
            }));
            setGallery(existingImages);
        }
    }, [itemData]);

    const onModalOpen = (data) => {
        console.log('data total',data);
        setItemData(data || null); // Guardamos los datos en el estado
        if (data?.id) setIsEditing(true);
        else setIsEditing(false);

        idRef.current.value = data?.id || "";
        $(categoryRef.current)
            .val(data?.category_id || null)
            .trigger("change");
        $(collectionRef.current)
            .val(data?.collection_id || null)
            .trigger("change");
        SetSelectValue(
            subcategoryRef.current,
            data?.subcategory?.id,
            data?.subcategory?.name
        );
        $(brandRef.current)
            .val(data?.brand_id || null)
            .trigger("change");
        nameRef.current.value = data?.name || "";
        colorRef.current.value = data?.color || "";
        summaryRef.current.value = data?.summary || "";
        priceRef.current.value = data?.price || 0;
        discountRef.current.value = data?.discount || 0;

        SetSelectValue(tagsRef.current, data?.tags ?? [], "id", "name");

        bannerRef.current.value = null;
        imageRef.current.value = null;
        bannerRef.image.src = `/storage/images/item/${
            data?.banner ?? "undefined"
        }`;
        imageRef.image.src = `/storage/images/item/${
            data?.image ?? "undefined"
        }`;
        textureRef.image.src = `/storage/images/item/${
            data?.texture ?? "undefined"
        }`;

        descriptionRef.editor.root.innerHTML = data?.description ?? "";

        //TODO: Cargar las imágenes existentes de la galería

        // Cargar las imágenes de la galería
        if (data?.images) {
            const existingImages = data.images.map((img) => ({
                id: img.id, // ID de la imagen en la base de datos
                url: `/api/items/gallery/media/${img.url}`, // Ruta de la imagen almacenada
            }));
            setGallery(existingImages);
        } else {
            setGallery([]); // Limpiar la galería si no hay imágenes
        }

        if (data?.specifications) {
            setSpecifications(data.specifications.map(spec => ({
                type: spec.type,
                title: spec.title,
                description: spec.description
            })));
        } else {
            setSpecifications([]);
        }
        // Nuevos campos

        stockRef.current.value = data?.stock;

        $(modalRef.current).modal("show");
    };

    const onModalSubmit = async (e) => {
        e.preventDefault();

        const request = {
            id: idRef.current.value || undefined,
            category_id: categoryRef.current.value,
            collection_id: collectionRef.current.value || null,
            subcategory_id: subcategoryRef.current.value,
            brand_id: brandRef.current.value,
            name: nameRef.current.value,
            color: colorRef.current.value,
            summary: summaryRef.current.value,
            price: priceRef.current.value,
            discount: discountRef.current.value,
            tags: $(tagsRef.current).val(),
            description: descriptionRef.current.value,
            stock: stockRef.current.value,
            specifications: JSON.stringify(specifications),
        };

        const formData = new FormData();
        for (const key in request) {
            formData.append(key, request[key]);
        }
        formData.append("features", JSON.stringify(features)); // Características (array de strings)
        formData.append("specifications", JSON.stringify(specifications)); // Especificaciones (array de objetos)

        const image = imageRef.current.files[0];
        if (image) {
            formData.append("image", image);
        }
        const texture = textureRef.current.files[0];
        if (texture) {
            formData.append("texture", texture);
        }
        const banner = bannerRef.current.files[0];
        if (banner) {
            formData.append("banner", banner);
        }

        //TODO: Preparar los datos de la galería

        // Galería
        gallery.forEach((img, index) => {
            if (!img.toDelete) {
                if (img.file) {
                    formData.append(`gallery[${index}]`, img.file); // Imágenes nuevas
                } else {
                    formData.append(`gallery_ids[${index}]`, img.id); // IDs de imágenes existentes
                }
            }
        });

        const deletedImages = gallery
            .filter((img) => img.toDelete)
            .map((img) => parseInt(img.id, 10)); // Asegurar que sean enteros
        if (deletedImages.length > 0) {
            formData.append("deleted_images", JSON.stringify(deletedImages)); // Imágenes eliminadas
        }

        console.log(formData);

        const result = await itemsRest.save(formData);
        if (!result) return;

        $(gridRef.current).dxDataGrid("instance").refresh();
        $(modalRef.current).modal("hide");
        setGallery([]);
    };

    const onVisibleChange = async ({ id, value }) => {
        const result = await itemsRest.boolean({ id, field: "visible", value });
        if (!result) return;
        $(gridRef.current).dxDataGrid("instance").refresh();
    };

    const onBooleanChange = async ({ id, field, value }) => {
        const result = await itemsRest.boolean({ id, field, value });
        if (!result) return;
        $(gridRef.current).dxDataGrid("instance").refresh();
    };

    const onDeleteClicked = async (id) => {
        const { isConfirmed } = await Swal.fire({
            title: "Eliminar curso",
            text: "¿Estás seguro de eliminar este curso?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });
        if (!isConfirmed) return;
        const result = await itemsRest.delete(id);
        if (!result) return;
        $(gridRef.current).dxDataGrid("instance").refresh();
    };
    const [features, setFeatures] = useState([]); // Características
    const [specifications, setSpecifications] = useState([]); // Especificaciones

    // Opciones del campo "type"
    const typeOptions = ["General", "Principal"];
    const [showImportModal, setShowImportModal] = useState(false);
    const modalImportRef = useRef();
    const onModalImportOpen = () => {
        $(modalImportRef.current).modal("show");
    };
    return (
        <>
            <Table
                gridRef={gridRef}
                title="Items"
                rest={itemsRest}
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
                            hint: "Agregar",
                            onClick: () => onModalOpen(),
                        },
                    });
                    container.unshift({
                        widget: "dxButton",
                        location: "after",
                        options: {
                            icon: "upload",
                            text: "Importar Datos",
                            hint: "Importar Datos",
                            onClick: () => onModalImportOpen(),
                        },
                    });
                }}
                exportable={true}
                exportableName="Items"
                columns={[
                    {
                        dataField: "id",
                        caption: "ID",
                        visible: false,
                    },
                    {
                        dataField: "category.name",
                        caption: "Categoría",
                        width: "120px",
                        cellTemplate: (container, { data }) => {
                            container.html(
                                renderToString(
                                    <>
                                        <b className="d-block fst-italic text-muted">
                                            {data.collection?.name}
                                        </b>
                                        <b className="d-block">
                                            {data.category?.name}
                                        </b>
                                        <small className="text-muted">
                                            {data.subcategory?.name}
                                        </small>
                                    </>
                                )
                            );
                        },
                    },
                    {
                        dataField: "subcategory.name",
                        caption: "Subcategoría",
                        visible: false,
                    },
                    {
                        dataField: "brand.name",
                        caption: "Marca",
                        width: "120px",
                    },
                    {
                        dataField: "name",
                        caption: "Nombre",
                        minWidth: "300px",
                        cellTemplate: (container, { data }) => {

                            const truncateWords = (text, maxWords) => {
                                if (!text) return '';
                                const words = text.split(' ');
                                if (words.length > maxWords) {
                                    return words.slice(0, maxWords).join(' ') + '...';
                                }
                                return text;
                            };
                    
                            const truncatedSummary = truncateWords(data.summary, 12);

                            container.html(
                                renderToString(
                                    <>
                                        <b>{data.name}</b>
                                        <br />
                                        <span>
                                            {truncatedSummary}
                                        </span>
                                    </>
                                )
                            );
                        },
                    },
                    {
                        dataField: "final_price",
                        caption: "Precio",
                        dataType: "number",
                        width: "75px",
                        cellTemplate: (container, { data }) => {
                            container.html(
                                renderToString(
                                    <>
                                        {data.discount > 0 && (
                                            <small
                                                className="d-block text-muted"
                                                style={{
                                                    textDecoration:
                                                        "line-through",
                                                }}
                                            >
                                                S/.{Number2Currency(data.price)}
                                            </small>
                                        )}
                                        <span>
                                            S/.
                                            {Number2Currency(
                                                data.discount > 0
                                                    ? data.discount
                                                    : data.price
                                            )}
                                        </span>
                                    </>
                                )
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
                                    src={`/storage/images/item/${data.image}`}
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
                        dataField: "is_new",
                        caption: "Nuevo",
                        dataType: "boolean",
                        width: "80px",
                        cellTemplate: (container, { data }) => {
                            const is_newValue = data.is_new === 1 || data.is_new === '1' || data.is_new === true;
                            ReactAppend(
                                container,
                                <SwitchFormGroup
                                    checked={is_newValue}
                                    onChange={(e) =>
                                        onBooleanChange({
                                            id: data.id,
                                            field: "is_new",
                                            value: e.target.checked ? 1 : 0,
                                        })
                                    }
                                />
                            );
                        },
                    },
                    {
                        dataField: "offering",
                        caption: "En oferta",
                        dataType: "boolean",
                        width: "80px",
                        cellTemplate: (container, { data }) => {
                            const offeringValue = data.offering === 1 || data.offering === '1' || data.offering === true;
                            ReactAppend(
                                container,
                                <SwitchFormGroup
                                    checked={offeringValue}
                                    onChange={(e) =>
                                        onBooleanChange({
                                            id: data.id,
                                            field: "offering",
                                            value: e.target.checked ? 1 : 0,
                                        })
                                    }
                                />
                            );
                        },
                    },
                    {
                        dataField: "recommended",
                        caption: "Recomendado",
                        dataType: "boolean",
                        width: "80px",
                        cellTemplate: (container, { data }) => {
                            const recommendedValue = data.recommended === 1 || data.recommended === '1' || data.recommended === true;
                            ReactAppend(
                                container,
                                <SwitchFormGroup
                                    checked={recommendedValue}
                                    onChange={(e) =>
                                        onBooleanChange({
                                            id: data.id,
                                            field: "recommended",
                                            value: e.target.checked ? 1 : 0,
                                        })
                                    }
                                />
                            );
                        },
                    },
                    {
                        dataField: "featured",
                        caption: "Destacado",
                        dataType: "boolean",
                        width: "80px",
                        cellTemplate: (container, { data }) => {
                            const featuredValue = data.featured === 1 || data.featured === '1' || data.featured === true;
                            
                            ReactAppend(
                                container,
                                <SwitchFormGroup
                                    checked={featuredValue}
                                    onChange={(e) =>
                                        onBooleanChange({
                                            id: data.id,
                                            field: "featured",
                                            value: e.target.checked ? 1 : 0,
                                        })
                                    }
                                />
                            );
                        },
                    },
                    {
                        dataField: "visible",
                        caption: "Visible",
                        dataType: "boolean",
                        width: "80px",
                        cellTemplate: (container, { data }) => {
                            ReactAppend(
                                container,
                                <SwitchFormGroup
                                    checked={data.visible}
                                    onChange={(e) =>
                                        onVisibleChange({
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
                title={isEditing ? "Editar curso" : "Agregar curso"}
                onSubmit={onModalSubmit}
                size="xl"
            >
                <div className="row" id="principal-container">
                    <input ref={idRef} type="hidden" />
                    <div className="col-md-3">
                        <SelectFormGroup
                            eRef={categoryRef}
                            label="Categoría"
                            required
                            dropdownParent="#principal-container"
                            onChange={(e) =>
                                setSelectedCategory(e.target.value)
                            }
                        >
                            {categories.map((item, index) => (
                                <option key={index} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </SelectFormGroup>
                        <SelectFormGroup
                            eRef={collectionRef}
                            label="Colección"
                            dropdownParent="#principal-container"
                            onChange={(e) =>
                                setSelectedCollection(e.target.value)
                            }
                        >
                            {collections.map((item, index) => (
                                <option key={index} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </SelectFormGroup>
                        <SelectAPIFormGroup
                            eRef={subcategoryRef}
                            label="Subcategoría"
                            searchAPI="/api/admin/subcategories/paginate"
                            searchBy="name"
                            filter={["category_id", "=", selectedCategory]}
                            dropdownParent="#principal-container"
                        />

                        <SelectFormGroup
                            eRef={brandRef}
                            label="Marca"
                            dropdownParent="#principal-container"
                        >
                            {brands.map((item, index) => (
                                <option key={index} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </SelectFormGroup>

                        <InputFormGroup
                            label="Stock"
                            eRef={stockRef}
                            type="number"
                        />

                        <InputFormGroup
                            eRef={priceRef}
                            label="Precio"
                            type="number"
                            step="0.01"
                            required
                        />
                        <InputFormGroup
                            eRef={discountRef}
                            label="Descuento"
                            type="number"
                            step="0.01"
                        />

                        <SelectAPIFormGroup
                            id="tags"
                            eRef={tagsRef}
                            searchAPI={"/api/admin/tags/paginate"}
                            searchBy="name"
                            label="Tags"
                            dropdownParent="#principal-container"
                            tags
                            multiple
                        />
                    </div>
                    <div className="col-md-4">
                        {/*Agregar aqui lo que falta */}
                        <InputFormGroup
                            eRef={nameRef}
                            label="Nombre"
                            required
                        />
                        <InputFormGroup
                            eRef={colorRef}
                            label="Color"
                            required
                        />
                        <ImageFormGroup
                            eRef={textureRef}
                            label="Imagen Textura"
                            aspect={1}
                            col="col-lg-6 col-md-12 col-sm-6"
                        />
                        <TextareaFormGroup
                            eRef={summaryRef}
                            label="Resumen"
                            rows={3}
                        />
                        {/* Sección de Características */}
                        {/* Características (Lista de textos) */}
                        <DynamicField
                            ref={featuresRef}
                            label="Características"
                            structure=""
                            onChange={setFeatures}
                        />

                        {/* Especificaciones (Objetos con campos, con "type" como <select>) */}
                        <DynamicField
                            ref={specificationsRef}
                            label="Especificaciones"
                            structure={{ type: "", title: "", description: "" }}
                            value={specifications}
                            onChange={setSpecifications}
                            typeOptions={typeOptions}
                        />
                    </div>
                    <div className="col-md-5">
                        <div className="row">
                            <ImageFormGroup
                                eRef={bannerRef}
                                label="Banner"
                                aspect={2 / 1}
                                col="col-12"
                            />
                            <ImageFormGroup
                                eRef={imageRef}
                                label="Imagen"
                                aspect={1}
                                col="col-lg-6 col-md-12 col-sm-6"
                            />

                            <div className="col-lg-6 col-md-12 col-sm-6">
                                <label className="form-label">Galeria</label>
                                <input
                                    id="input-item-gallery"
                                    ref={galleryRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    hidden
                                    onChange={handleGalleryChange}
                                />
                                <div
                                    style={{
                                        border: "2px dashed #ccc",
                                        padding: "20px",
                                        textAlign: "center",
                                        cursor: "pointer",
                                        borderRadius: "4px",
                                        boxShadow:
                                            "2.5px 2.5px 5px rgba(0,0,0,.125)",
                                        aspectRatio: "21/9",
                                        height: "209px",
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                    onClick={() => galleryRef.current.click()}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                >
                                    <span className="form-label d-block mb-1">
                                        Arrastra y suelta imágenes aquí o haz
                                        clic para agregar
                                    </span>
                                </div>
                            </div>
                            <div className="col-md-12 col-sm-6">
                                <div className="d-flex flex-wrap gap-1  mt-2">
                                    {gallery.map((image, index) => (
                                        <div
                                            key={index}
                                            className="position-relative"
                                            style={{
                                                width: "80px",
                                                height: "80px",
                                            }}
                                        >
                                            <img
                                                src={`${image.url}`}
                                                alt="preview"
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    borderRadius: "4px",
                                                }}
                                            />
                                            <button
                                                className="btn btn-xs btn-danger position-absolute"
                                                style={{ top: 0, right: 0 }}
                                                onClick={(e) =>
                                                    removeGalleryImage(e, index)
                                                }
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <hr className="my-1" />
                <QuillFormGroup eRef={descriptionRef} label="Descripcion" />
            </Modal>
            <Modal modalRef={modalImportRef} title={"Importar Datos"} size="sm">
                <ModalImportItem gridRef={gridRef} modalRef={modalImportRef} />
            </Modal>
        </>
    );
};

CreateReactScript((el, properties) => {
    createRoot(el).render(
        <BaseAdminto {...properties} title="Items">
            <Items {...properties} />
        </BaseAdminto>
    );
});
