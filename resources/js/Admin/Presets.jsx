import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import BaseAdminto from '@Adminto/Base';
import CreateReactScript from '../Utils/CreateReactScript';
import Table from '../Components/Adminto/Table';
import InputFormGroup from '../Components/Adminto/form/InputFormGroup';
import ReactAppend from '../Utils/ReactAppend';
import DxButton from '../Components/dx/DxButton';
import SwitchFormGroup from '@Adminto/form/SwitchFormGroup';
import TextareaFormGroup from '../Components/Adminto/form/TextareaFormGroup';
import SelectFormGroup from '../Components/Adminto/form/SelectFormGroup';
import Modal from '../Components/Adminto/Modal';
import Swal from 'sweetalert2';
import CanvasPresetsRest from '../Actions/Admin/CanvasPresetsRest';

const canvasPresetsRest = new CanvasPresetsRest();

const Presets = ({ presetTypes = {} }) => {
  const gridRef = useRef();
  const modalRef = useRef();

  // Form elements ref
  const idRef = useRef();
  const nameRef = useRef();
  const descriptionRef = useRef();
  const widthRef = useRef();
  const heightRef = useRef();
  const dpiRef = useRef();
 // const pagesRef = useRef();
  const backgroundColorRef = useRef();

  //const typeRef = useRef();

  const [isEditing, setIsEditing] = useState(false);

  const onModalOpen = (data) => {
    if (data?.id) {
      setIsEditing(true);
      idRef.current.value = data.id;
      nameRef.current.value = data.name || '';
      descriptionRef.current.value = data.description || '';
      widthRef.current.value = data.width || '';
      heightRef.current.value = data.height || '';
      dpiRef.current.value = data.dpi || 300;
      //pagesRef.current.value = data.pages || 1;
      backgroundColorRef.current.value = data.background_color || '#FFFFFF';

     /* if (typeRef.current) {
        $(typeRef.current).val(data.type || 'other').trigger('change');
      }*/
    } else {
      setIsEditing(false);
      idRef.current.value = '';
      nameRef.current.value = '';
      descriptionRef.current.value = '';
      widthRef.current.value = '';
      heightRef.current.value = '';
      dpiRef.current.value = 300;
     // pagesRef.current.value = 1;
      backgroundColorRef.current.value = '#FFFFFF';

     // if (typeRef.current) $(typeRef.current).val('other').trigger('change');
    }
    $(modalRef.current).modal('show');
  };

  const onModalSubmit = async (e) => {
    e.preventDefault();

    const request = {
      id: idRef.current.value || undefined,
      name: nameRef.current.value,
      description: descriptionRef.current.value,
      width: parseFloat(widthRef.current.value),
      height: parseFloat(heightRef.current.value),
      dpi: parseInt(dpiRef.current.value, 10),
     // pages: parseInt(pagesRef.current.value, 10),
     pages:0,
      background_color: backgroundColorRef.current.value,

      //type: typeRef.current.value
      type:'photo'
    };

    const result = await canvasPresetsRest.save(request);
    if (!result) return;

    $(gridRef.current).dxDataGrid('instance').refresh();
    $(modalRef.current).modal('hide');
  };

  const onStatusChange = async ({ id, value }) => {
    const result = await canvasPresetsRest.boolean({ id, field: 'is_active', value });
    if (!result) return;
    $(gridRef.current).dxDataGrid('instance').refresh();
  };

  const onDeleteClicked = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Eliminar preset',
      text: '¿Estás seguro de eliminar este preset?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!isConfirmed) return;
    const result = await canvasPresetsRest.delete(id);
    if (!result) return;
    $(gridRef.current).dxDataGrid('instance').refresh();
  };

  const getPresetTypeOptions = () => {
    if (!presetTypes) return [];
    return Object.entries(presetTypes).map(([value, label]) => ({ value, label }));
  };
  const onVisibleChange = async ({ id, value }) => {
    const result = await canvasPresetsRest.boolean({ id, field: "active", value });
    if (!result) return;
    $(gridRef.current).dxDataGrid("instance").refresh();
  };
  return (<>
    <Table gridRef={gridRef} title='Presets de Canvas' rest={canvasPresetsRest}
      toolBar={(container) => {
        container.unshift({
          widget: 'dxButton', location: 'after',
          options: {
            icon: 'refresh',
            hint: 'Refrescar tabla',
            onClick: () => $(gridRef.current).dxDataGrid('instance').refresh()
          }
        });
        container.unshift({
          widget: 'dxButton', location: 'after',
          options: {
            icon: 'plus',
            text: 'Nuevo preset',
            hint: 'Nuevo preset',
            onClick: () => onModalOpen()
          }
        });
      }}
      columns={[
        {/*
          dataField: 'id',
          caption: 'ID',
          width: 70
        */},
        {
          dataField: 'name',
          caption: 'Nombre',
          minWidth: 200
        },
        {
          caption: 'Dimensiones',
          cellTemplate: (container, { data }) => {
            container.text(`${data.width} x ${data.height} mm`);
          },
          width: 150,
          allowFiltering: false
        },
        {/*
          dataField: 'type',
          caption: 'Tipo',
          cellTemplate: (container, { data }) => {
            const type = data.type;
            const typeLabel = presetTypes[type] || type || 'Otro';
            container.text(typeLabel);
          },
          width: 120
        },
        {
          dataField: 'pages',
          caption: 'Páginas',
          width: 100,
          alignment: 'center'
        */},
        {
          dataField: 'dpi',
          caption: 'DPI',
          width: 100,
          alignment: 'center'
        },
        {
          dataField: "active",
          caption: "Visible",
          dataType: "boolean",
          width: "80px",
          cellTemplate: (container, { data }) => {
           
            ReactAppend(
              container,
              <SwitchFormGroup
                checked={data.active}
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
          caption: 'Acciones',
          cellTemplate: (container, { data }) => {
            container.css('text-overflow', 'unset')
            container.append(DxButton({
              className: 'btn btn-xs btn-soft-primary',
              title: 'Editar',
              icon: 'fa fa-pen',
              onClick: () => onModalOpen(data)
            }))
            container.append(DxButton({
              className: 'btn btn-xs btn-soft-danger',
              title: 'Eliminar',
              icon: 'fa fa-trash',
              onClick: () => onDeleteClicked(data.id)
            }))
          },
          allowFiltering: false,
          allowExporting: false
        }
      ]} />
    <Modal modalRef={modalRef} title={isEditing ? 'Editar preset' : 'Agregar preset'} onSubmit={onModalSubmit} size='lg'>
      <div className='row' id='principal-container'>
        <input ref={idRef} type='hidden' />
        <div className="col-md-6">
          <InputFormGroup eRef={nameRef} label='Nombre del Preset' placeholder='Ej: Canvas 30x40mm' required />
        </div>
        {/*<div className="col-md-6">
          <SelectFormGroup dropdownParent={"#principal-container"} eRef={typeRef} label='Tipo de Producto' optionValue='value' optionLabel='label' required >
            {presetTypes && Object.entries(presetTypes).map(([value]) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </SelectFormGroup>

        </div> */}
        <div className="col-md-12">
          <TextareaFormGroup eRef={descriptionRef} label='Descripción' placeholder='Descripción del preset (opcional)' rows={2} />
        </div>
        <div className="col-md-3">
          <InputFormGroup eRef={widthRef} label='Ancho (mm)' type='number' min='0.1' step='0.1' required />
        </div>
        <div className="col-md-3">
          <InputFormGroup eRef={heightRef} label='Alto (mm)' type='number' min='0.1' step='0.1' required />
        </div>
        <div className="col-md-3">
          <InputFormGroup eRef={dpiRef} label='DPI' type='number' min='72' max='1200' required />
        </div>
       {/* <div className="col-md-3">
          <InputFormGroup eRef={pagesRef} label='N° de Páginas' type='number' min='1' required />
        </div> */}
        <div className="col-md-6">
          <InputFormGroup eRef={backgroundColorRef} label='Color de Fondo' type='color' />
        </div>

      </div>
    </Modal>
  </>
  );
};

CreateReactScript((el, properties) => {
  createRoot(el).render(<BaseAdminto {...properties} title='Presets de Canvas'>
    <Presets {...properties} />
  </BaseAdminto>);
})

