import BaseAdminto from "@Adminto/Base";
import SwitchFormGroup from "@Adminto/form/SwitchFormGroup";
import TextareaFormGroup from "@Adminto/form/TextareaFormGroup";
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import Swal from "sweetalert2";
import ItemsRest from "../Actions/Admin/ItemsRest";
import CanvasPresetsRest from "../Actions/Admin/CanvasPresetsRest";
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
const canvasPresetsRest = new CanvasPresetsRest();

const Items = ({ categories, brands, collections }) => {
    //!FALTA EDIT AND DELETEDE GALERIA
    
    const [itemData, setItemData] = useState([]);
    const [presets, setPresets] = useState([]);
    const [selectedPreset, setSelectedPreset] = useState(null);

    const gridRef = useRef();
    const modalRef = useRef();

    // Form elements ref

    const idRef = useRef();
    const categoryRef = useRef();
  //  const collectionRef = useRef();
    const subcategoryRef = useRef();
   // const brandRef = useRef();
    const nameRef = useRef();
  //  const colorRef = useRef();
    const summaryRef = useRef();
    const priceRef = useRef();
    const discountRef = useRef();
    const tagsRef = useRef();
    //const bannerRef = useRef();
    const imageRef = useRef();
    //const textureRef = useRef();
    const descriptionRef = useRef();
    const skuRef = useRef();
    // Nuevos campos
    const canvasPresetRef = useRef();
    const pagesRef = useRef();
    const coverImageRef = useRef();
    const contentImageRef = useRef();
    const backCoverImageRef = useRef();
    const stockRef = useRef();

   // const featuresRef = useRef([]);
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
        // Cargar presets disponibles
        const loadPresets = async () => {
            try {
                const response = await canvasPresetsRest.paginate({ take: 100, skip: 0 });
                if (response?.data) {
                    setPresets(response.data);
                }
            } catch (error) {
                console.error('Error cargando presets:', error);
            }
        };
        loadPresets();
    }, []);

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
       /* $(collectionRef.current)
            .val(data?.collection_id || null)
            .trigger("change");*/
        SetSelectValue(
            subcategoryRef.current,
            data?.subcategory?.id,
            data?.subcategory?.name
        );
      /*  $(brandRef.current)
            .val(data?.brand_id || null)
            .trigger("change");*/
        nameRef.current.value = data?.name || "";
        skuRef.current.value = data?.sku || "";
        //colorRef.current.value = data?.color || "";
        summaryRef.current.value = data?.summary || "";
        priceRef.current.value = data?.price || 0;
        discountRef.current.value = data?.discount || 0;

        // Campos de presets y páginas
        $(canvasPresetRef.current).val(data?.canvas_preset_id || null).trigger("change");
        pagesRef.current.value = data?.pages || 1;

        SetSelectValue(tagsRef.current, data?.tags ?? [], "id", "name");

      //  bannerRef.current.value = null;
        imageRef.current.value = null;
        coverImageRef.current.value = null;
        contentImageRef.current.value = null;
        backCoverImageRef.current.value = null;
        
      /*  bannerRef.image.src = `/storage/images/item/${
            data?.banner ?? "undefined"
        }`;*/
        imageRef.image.src = `/storage/images/item/${
            data?.image ?? "undefined"
        }`;
      /*  textureRef.image.src = `/storage/images/item/${
            data?.texture ?? "undefined"
        }`;*/
        coverImageRef.image.src = `/storage/images/item/${
            data?.cover_image ?? "undefined"
        }`;
        contentImageRef.image.src = `/storage/images/item/${
            data?.content_image ?? "undefined"
        }`;
        backCoverImageRef.image.src = `/storage/images/item/${
            data?.back_cover_image ?? "undefined"
        }`;

        descriptionRef.editor.root.innerHTML = data?.description ?? "";

        //TODO: Cargar las imágenes existentes de la galería

        // Cargar las imágenes de la galería
        if (data?.images) {
            const existingImages = data.images.map((img) => ({
                id: img.id, // ID de la imagen en la base de datos
                url: `/storage/images/item/${img.url}`, // Ruta de la imagen almacenada
            }));
            setGallery(existingImages);
        } else {
            setGallery([]); // Limpiar la galería si no hay imágenes
        }

        if (data?.specifications) {
            setSpecifications(data.specifications.map(spec => ({
                type: spec.type,
                title: spec.title,
                description: spec.description,
                image: spec.image || "",
            })));
        } else {
            setSpecifications([]);
        }
        
        // Nuevos campos
        setFeatures(data?.features?.map(f => typeof f === 'object' ? f : { feature: f }) || []);
        stockRef.current.value = data?.stock;
        $(modalRef.current).modal("show");
    };

    const onModalSubmit = async (e) => {
        e.preventDefault();

        // Limpia características vacías
        const cleanFeatures = features.filter(f => {
            if (typeof f === 'string') return f.trim() !== '';
            if (typeof f === 'object') return f.feature?.trim() !== '';
            return false;
        });

        // Limpia especificaciones vacías
        const cleanSpecs = specifications.filter(s => 
            (s.title && s.title.trim() !== '') || 
            (s.description && s.description.trim() !== '')
        );

        const request = {
            id: idRef.current.value || undefined,
            category_id: categoryRef.current.value,
          //  collection_id: collectionRef.current.value || null,
            subcategory_id: subcategoryRef.current.value,
           // brand_id: brandRef.current.value,
            name: nameRef.current.value,
            sku: skuRef.current.value,
          //  color: colorRef.current.value,
            summary: summaryRef.current.value,
            price: priceRef.current.value,
            discount: discountRef.current.value,
            tags: $(tagsRef.current).val(),
            description: descriptionRef.current.value,
            stock: stockRef.current.value,
            canvas_preset_id: canvasPresetRef.current.value || null,
            pages: pagesRef.current.value,
            features: cleanFeatures,
            specifications: cleanSpecs,
        };



        const formData = new FormData();
        
        for (const key in request) {
            if (key === 'features' || key === 'specifications') {
                formData.append(key, JSON.stringify(request[key]));
            } else {
                formData.append(key, request[key]);
            }
        }

        const image = imageRef.current.files[0];
        if (image) {
            formData.append("image", image);
        }
       /* const texture = textureRef.current.files[0];
        if (texture) {
            formData.append("texture", texture);
        }*/
        //const banner = bannerRef.current.files[0];
      /*  if (banner) {
            formData.append("banner", banner);
        }*/
        const coverImage = coverImageRef.current.files[0];
        if (coverImage) {
            formData.append("cover_image", coverImage);
        }
        const contentImage = contentImageRef.current.files[0];
        if (contentImage) {
            formData.append("content_image", contentImage);
        }
        const backCoverImage = backCoverImageRef.current.files[0];
        if (backCoverImage) {
            formData.append("back_cover_image", backCoverImage);
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
    const typeOptions = ["Principal", "General", "Icono"];
    const [showImportModal, setShowImportModal] = useState(false);
    const modalImportRef = useRef();

    // Función para manejar el cambio de preset
    const handlePresetChange = (presetId) => {
        const preset = presets.find(p => p.id === presetId);
        setSelectedPreset(preset);
        if (preset && pagesRef.current) {
            pagesRef.current.value = preset.pages || 1;
        }
    };

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
                   /* {
                        dataField: "brand.name",
                        caption: "Marca",
                        width: "120px",
                    },*/
                    {
                        dataField: "canvas_preset.name",
                        caption: "Preset",
                        width: "140px",
                        cellTemplate: (container, { data }) => {
                            if (data.canvas_preset) {
                                container.html(
                                    renderToString(
                                        <>
                                            <b className="d-block">{data.canvas_preset.name}</b>
                                            <small className="text-muted">
                                                {data.canvas_preset.width}x{data.canvas_preset.height}cm
                                                {data.pages && ` • ${data.pages}p`}
                                            </small>
                                        </>
                                    )
                                );
                            } else {
                                container.html(
                                    renderToString(
                                        <i className="text-muted">Sin preset</i>
                                    )
                                );
                            }
                        },
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
                            console.log('data.image', data.image);
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
                title={isEditing ? "Editar item" : "Agregar item"}
                onSubmit={onModalSubmit}
                size="xl"
            >
                <div className="container-fluid" id="principal-container">
                    <input ref={idRef} type="hidden" />
                    
                    {/* Información Básica */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h6 className="card-title mb-0">
                                <i className="fa fa-info-circle me-2"></i>
                                Información Básica
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-4">
                                    <InputFormGroup
                                        eRef={skuRef}
                                        label="SKU"
                                        required
                                    />
                                </div>
                                <div className="col-md-8">
                                    <InputFormGroup
                                        eRef={nameRef}
                                        label="Nombre del Producto"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <TextareaFormGroup
                                        eRef={summaryRef}
                                        label="Resumen"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Categorización */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h6 className="card-title mb-0">
                                <i className="fa fa-tags me-2"></i>
                                Categorización
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
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
                                </div>
                                <div className="col-md-6">
                                    <SelectAPIFormGroup
                                        eRef={subcategoryRef}
                                        label="Subcategoría"
                                        searchAPI="/api/admin/subcategories/paginate"
                                        searchBy="name"
                                        filter={["category_id", "=", selectedCategory]}
                                        dropdownParent="#principal-container"
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12">
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
                            </div>
                        </div>
                    </div>

                    {/* Configuración de Canvas y Producto */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h6 className="card-title mb-0">
                                <i className="fa fa-cog me-2"></i>
                                Configuración de Canvas y Producto
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <SelectFormGroup
                                        eRef={canvasPresetRef}
                                        label="Preset de Canvas"
                                        dropdownParent="#principal-container"
                                        onChange={(e) => handlePresetChange(e.target.value)}
                                    >
                                        <option value="">Seleccionar preset...</option>
                                        {presets.map((preset) => (
                                            <option key={preset.id} value={preset.id}>
                                                {preset.name} ({preset.width}x{preset.height}cm, {preset.pages}p)
                                            </option>
                                        ))}
                                    </SelectFormGroup>
                                </div>
                                <div className="col-md-3">
                                    <InputFormGroup
                                        eRef={pagesRef}
                                        label="Número de Páginas"
                                        type="number"
                                        min="1"
                                        defaultValue="1"
                                    />
                                </div>
                                <div className="col-md-3">
                                    <InputFormGroup
                                        label="Stock"
                                        eRef={stockRef}
                                        type="number"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Precios */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h6 className="card-title mb-0">
                                <i className="fa fa-dollar-sign me-2"></i>
                                Precios
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <InputFormGroup
                                        eRef={priceRef}
                                        label="Precio Regular"
                                        type="number"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <InputFormGroup
                                        eRef={discountRef}
                                        label="Precio con Descuento"
                                        type="number"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Imágenes */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h6 className="card-title mb-0">
                                <i className="fa fa-images me-2"></i>
                                Imágenes del Producto
                            </h6>
                        </div>
                        <div className="card-body">
                            {/* Imagen Principal */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <h6 className="text-primary mb-3">
                                        <i className="fa fa-star me-2"></i>
                                        Imagen Principal
                                    </h6>
                                </div>
                                <div className="col-md-3">
                                    <ImageFormGroup
                                        eRef={imageRef}
                                        label="Imagen Principal"
                                        aspect={1}
                                        col="col-12"
                                    />
                                </div>
                            </div>
                            
                            {/* Imágenes de Producto Específicas */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <h6 className="text-info mb-3">
                                        <i className="fa fa-layer-group me-2"></i>
                                        Imágenes Específicas del Producto
                                    </h6>
                                </div>
                                <div className="col-md-4">
                                    <ImageFormGroup
                                        eRef={coverImageRef}
                                        label="Imagen de Portada"
                                        aspect={1}
                                        col="col-12"
                                    />
                                </div>
                                <div className="col-md-4">
                                    <ImageFormGroup
                                        eRef={contentImageRef}
                                        label="Imagen de Contenido"
                                        aspect={1}
                                        col="col-12"
                                    />
                                </div>
                                <div className="col-md-4">
                                    <ImageFormGroup
                                        eRef={backCoverImageRef}
                                        label="Imagen de Contraportada"
                                        aspect={1}
                                        col="col-12"
                                    />
                                </div>
                            </div>

                            {/* Galería de Imágenes */}
                            <div className="row">
                                <div className="col-12">
                                    <h6 className="text-success mb-3">
                                        <i className="fa fa-images me-2"></i>
                                        Galería de Imágenes Adicionales
                                    </h6>
                                </div>
                                <div className="col-md-5">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Subir Nuevas Imágenes</label>
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
                                            className="border-2 border-dashed p-4 text-center position-relative"
                                            style={{
                                                borderColor: "#28a745",
                                                backgroundColor: "#f8fff9",
                                                cursor: "pointer",
                                                borderRadius: "12px",
                                                minHeight: "180px",
                                                transition: "all 0.3s ease",
                                            }}
                                            onClick={() => galleryRef.current.click()}
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                            onMouseEnter={(e) => {
                                                e.target.style.borderColor = "#20c997";
                                                e.target.style.backgroundColor = "#f0fff4";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.borderColor = "#28a745";
                                                e.target.style.backgroundColor = "#f8fff9";
                                            }}
                                        >
                                            <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                                <i className="fa fa-cloud-upload-alt fa-3x text-success mb-3"></i>
                                                <h6 className="text-success mb-2">Agregar Imágenes</h6>
                                                <p className="text-muted mb-0 small">
                                                    Arrastra y suelta archivos aquí<br />
                                                    o haz clic para seleccionar
                                                </p>
                                                <small className="text-muted mt-2">
                                                    Formatos: JPG, PNG, WebP
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-7">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">
                                            Imágenes de la Galería 
                                            {gallery.length > 0 && (
                                                <span className="badge bg-primary ms-2">{gallery.length}</span>
                                            )}
                                        </label>
                                        <div 
                                            className="border rounded p-3"
                                            style={{ 
                                                minHeight: "180px",
                                                backgroundColor: "#f8f9fa",
                                                overflowY: "auto",
                                                maxHeight: "300px"
                                            }}
                                        >
                                            {gallery.length === 0 ? (
                                                <div className="h-100 d-flex align-items-center justify-content-center">
                                                    <div className="text-center text-muted">
                                                        <i className="fa fa-image fa-2x mb-2 opacity-50"></i>
                                                        <p className="mb-0">No hay imágenes en la galería</p>
                                                        <small>Las imágenes aparecerán aquí después de subirlas</small>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="d-flex flex-wrap gap-3">
                                                    {gallery.map((image, index) => (
                                                        <div
                                                            key={index}
                                                            className="position-relative"
                                                            style={{
                                                                width: "90px",
                                                                height: "90px",
                                                            }}
                                                        >
                                                            <img
                                                                src={`${image.url}`}
                                                                alt={`Imagen ${index + 1}`}
                                                                className="shadow-sm"
                                                                style={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    objectFit: "cover",
                                                                    borderRadius: "8px",
                                                                    border: "2px solid #e9ecef",
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger btn-sm position-absolute shadow"
                                                                style={{ 
                                                                    top: "-8px", 
                                                                    right: "-8px",
                                                                    width: "24px",
                                                                    height: "24px",
                                                                    padding: "0",
                                                                    borderRadius: "50%",
                                                                    fontSize: "12px",
                                                                    lineHeight: "1",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center"
                                                                }}
                                                                onClick={(e) => removeGalleryImage(e, index)}
                                                                title="Eliminar imagen"
                                                            >
                                                                <i className="fa fa-times"></i>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Características y Especificaciones */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h6 className="card-title mb-0">
                                <i className="fa fa-list me-2"></i>
                                Características y Especificaciones
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                              {/*  <div className="col-md-6">
                                    <DynamicField
                                        ref={featuresRef}
                                        label="Características"
                                        structure=""
                                        value={features}
                                        onChange={setFeatures}
                                    />
                                </div> */}
                                <div className="col-md-12">
                                    <DynamicField
                                        ref={specificationsRef}
                                        label="Especificaciones"
                                        structure={{ type: "", title: "", description: "" }}
                                        value={specifications}
                                        onChange={setSpecifications}
                                        typeOptions={typeOptions}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h6 className="card-title mb-0">
                                <i className="fa fa-align-left me-2"></i>
                                Descripción Detallada
                            </h6>
                        </div>
                        <div className="card-body">
                            <QuillFormGroup eRef={descriptionRef} label="Descripción" />
                        </div>
                    </div>

                    {/*   <SelectFormGroup
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
                        </SelectFormGroup> */}

                       {/* <SelectFormGroup
                            eRef={brandRef}
                            label="Marca"
                            dropdownParent="#principal-container"
                        >
                            {brands.map((item, index) => (
                                <option key={index} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </SelectFormGroup> */}

                       {/* <InputFormGroup
                            eRef={colorRef}
                            label="Color"
                            required
                        />
                        <ImageFormGroup
                            eRef={textureRef}
                            label="Imagen Textura"
                            aspect={1}
                            col="col-lg-6 col-md-12 col-sm-6"
                        /> */}

                           {/* <ImageFormGroup
                                eRef={textureRef}
                                label="Textura"
                                aspect={1}
                                col="col-lg-6 col-md-12 col-sm-6"
                            /> */}
                </div>
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
