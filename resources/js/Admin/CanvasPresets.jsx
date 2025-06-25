import BaseAdminto from "@Adminto/Base";
import SwitchFormGroup from "@Adminto/form/SwitchFormGroup";
import TextareaFormGroup from "@Adminto/form/TextareaFormGroup";
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import Swal from "sweetalert2";
import CanvasPresetsRest from "../Actions/Admin/CanvasPresetsRest";
import Modal from "../Components/Adminto/Modal";
import Table from "../Components/Adminto/Table";
import InputFormGroup from "../Components/Adminto/form/InputFormGroup";
import NumberFormGroup from "../Components/Adminto/form/NumberFormGroup";
import SelectFormGroup from "../Components/Adminto/form/SelectFormGroup";
import DxButton from "../Components/dx/DxButton";
import CreateReactScript from "../Utils/CreateReactScript";
import ReactAppend from "../Utils/ReactAppend";
import SetSelectValue from "../Utils/SetSelectValue";

const canvasPresetsRest = new CanvasPresetsRest();

const CanvasPresets = () => {
    const [presets, setPresets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [presetTypes, setPresetTypes] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    
    const gridRef = useRef();
    const modalRef = useRef();
    const formRef = useRef();

    // Referencias para los campos del formulario
    const idRef = useRef();
    const nameRef = useRef();
    const descriptionRef = useRef();
    const widthRef = useRef();
    const heightRef = useRef();
    const dpiRef = useRef();
    const pagesRef = useRef();
    const backgroundColorRef = useRef();
    const isActiveRef = useRef();
    const typeRef = useRef();

    // Cargar los presets y tipos al montar el componente
    useEffect(() => {
        fetchPresets();
        fetchPresetTypes();
    }, []);

    const fetchPresets = async () => {
        try {
            setLoading(true);
            const response = await canvasPresetsRest.paginate();
            setPresets(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar los presets:', error);
            setLoading(false);
            Swal.fire('Error', 'No se pudieron cargar los presets', 'error');
        }
    };

    const fetchPresetTypes = async () => {
        try {
            const response = await canvasPresetsRest.getTypes();
            if (response.success) {
                // Convertir el objeto de tipos a un array para el Select
                const typesArray = Object.entries(response.data).map(([id, name]) => ({
                    id,
                    name
                }));
                setPresetTypes(typesArray);
            }
        } catch (error) {
            console.error('Error al cargar los tipos de preset:', error);
        }
    };

    const handleNewPreset = () => {
        setIsEditing(false);
        formRef.current?.reset();
        // Establecer valores por defecto
        if (dpiRef.current) dpiRef.current.value = 300;
        if (pagesRef.current) pagesRef.current.value = 1;
        if (backgroundColorRef.current) backgroundColorRef.current.value = '#FFFFFF';
        if (isActiveRef.current) isActiveRef.current.checked = true;
        if (typeRef.current) $(typeRef.current).val('other').trigger('change');
        
        $(modalRef.current).modal('show');
    };

    const handleEditPreset = (preset) => {
        setIsEditing(true);
        
        // Llenar el formulario con los datos del preset
        idRef.current.value = preset.id;
        nameRef.current.value = preset.name;
        descriptionRef.current.value = preset.description || '';
        widthRef.current.value = preset.width;
        heightRef.current.value = preset.height;
        dpiRef.current.value = preset.dpi || 300;
        pagesRef.current.value = preset.pages || 1;
        backgroundColorRef.current.value = preset.background_color || '#FFFFFF';
        isActiveRef.current.checked = preset.is_active !== false;
        
        // Establecer el tipo de preset
        $(typeRef.current).val(preset.type || 'other').trigger('change');
        
        $(modalRef.current).modal('show');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = {
            name: nameRef.current.value,
            description: descriptionRef.current.value,
            width: parseFloat(widthRef.current.value),
            height: parseFloat(heightRef.current.value),
            dpi: parseInt(dpiRef.current.value, 10),
            pages: parseInt(pagesRef.current.value, 10),
            background_color: backgroundColorRef.current.value,
            is_active: isActiveRef.current.checked,
            type: typeRef.current.value
        };

        try {
            let response;
            if (isEditing && idRef.current.value) {
                response = await canvasPresetsRest.update(idRef.current.value, formData);
            } else {
                response = await canvasPresetsRest.create(formData);
            }
            
            if (response.success) {
                Swal.fire('¡Éxito!', response.message || 'Operación realizada correctamente', 'success');
                fetchPresets();
                $(modalRef.current).modal('hide');
            } else {
                throw new Error(response.message || 'Error al guardar el preset');
            }
        } catch (error) {
            console.error('Error al guardar el preset:', error);
            Swal.fire('Error', error.message || 'Ocurrió un error al guardar el preset', 'error');
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await canvasPresetsRest.delete(id);
                    if (response.success) {
                        Swal.fire('¡Eliminado!', response.message || 'El preset ha sido eliminado.', 'success');
                        fetchPresets();
                    } else {
                        throw new Error(response.message || 'Error al eliminar el preset');
                    }
                } catch (error) {
                    console.error('Error al eliminar el preset:', error);
                    Swal.fire('Error', error.message || 'No se pudo eliminar el preset.', 'error');
                }
            }
        });
    };

    // Columnas para la tabla de presets
    const columns = [
        { field: 'id', title: 'ID', width: 70 },
        { field: 'name', title: 'Nombre', minWidth: 200 },
        { 
            field: 'dimensions', 
            title: 'Dimensiones', 
            render: (_, item) => `${item.width} x ${item.height} cm`,
            width: 150
        },
        { 
            field: 'type', 
            title: 'Tipo',
            render: (_, item) => {
                const type = presetTypes.find(t => t.id === item.type);
                return type ? type.name : item.type;
            },
            width: 120
        },
        { 
            field: 'pages', 
            title: 'Páginas',
            width: 100,
            align: 'center'
        },
        { 
            field: 'dpi', 
            title: 'DPI',
            width: 80,
            align: 'center'
        },
        { 
            field: 'is_active', 
            title: 'Activo',
            render: (_, item) => (
                <span className={`badge ${item.is_active ? 'bg-success' : 'bg-secondary'}`}>
                    {item.is_active ? 'Sí' : 'No'}
                </span>
            ),
            width: 80,
            align: 'center'
        },
        {
            field: 'actions',
            title: 'Acciones',
            render: (_, item) => (
                <div className="btn-group">
                    <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEditPreset(item)}
                    >
                        <i className="fas fa-edit"></i>
                    </button>
                    <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(item.id)}
                    >
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            ),
            width: 120,
            align: 'center',
            sortable: false
        }
    ];

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h3 className="card-title">Presets de Canvas</h3>
                            <button 
                                className="btn btn-primary"
                                onClick={handleNewPreset}
                            >
                                <i className="fas fa-plus me-2"></i>Nuevo Preset
                            </button>
                        </div>
                        <div className="card-body">
                            <Table
                                ref={gridRef}
                                columns={columns}
                                data={presets}
                                loading={loading}
                                searchable={true}
                                pagination={true}
                                pageSize={10}
                                emptyText="No hay presets disponibles"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para crear/editar presets */}
            <Modal 
                ref={modalRef} 
                title={isEditing ? 'Editar Preset' : 'Nuevo Preset'}
                size="lg"
                onClose={() => $(modalRef.current).modal('hide')}
            >
                <form ref={formRef} onSubmit={handleSubmit}>
                    <input type="hidden" ref={idRef} />
                    
                    <div className="row">
                        <div className="col-md-6">
                            <InputFormGroup
                                ref={nameRef}
                                label="Nombre del Preset"
                                placeholder="Ej: Photobook Estándar 20x30cm"
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <SelectFormGroup
                                ref={typeRef}
                                label="Tipo de Producto"
                                options={presetTypes}
                                optionValue="id"
                                optionLabel="name"
                                required
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <TextareaFormGroup
                                ref={descriptionRef}
                                label="Descripción"
                                placeholder="Descripción del preset (opcional)"
                                rows="2"
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-3">
                            <NumberFormGroup
                                ref={widthRef}
                                label="Ancho (cm)"
                                min="0.1"
                                step="0.1"
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <NumberFormGroup
                                ref={heightRef}
                                label="Alto (cm)"
                                min="0.1"
                                step="0.1"
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <NumberFormGroup
                                ref={dpiRef}
                                label="DPI"
                                min="72"
                                max="1200"
                                defaultValue="300"
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <NumberFormGroup
                                ref={pagesRef}
                                label="N° de Páginas"
                                min="1"
                                defaultValue="1"
                                required
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <InputFormGroup
                                type="color"
                                ref={backgroundColorRef}
                                label="Color de Fondo"
                                defaultValue="#FFFFFF"
                            />
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>Estado</label>
                                <div className="form-check form-switch">
                                    <input 
                                        className="form-check-input" 
                                        type="checkbox" 
                                        ref={isActiveRef}
                                        defaultChecked
                                    />
                                    <label className="form-check-label">Activo</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={() => $(modalRef.current).modal('hide')}
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {isEditing ? 'Actualizar' : 'Crear'} Preset
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

// Inicializar el componente
CreateReactScript((el, properties) => {
    createRoot(el).render(
        <BaseAdminto {...properties} title="Gestión de Presets de Canvas">
            <CanvasPresets {...properties} />
        </BaseAdminto>
    );
});

export default CanvasPresets;
