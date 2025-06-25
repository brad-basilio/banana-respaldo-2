import BaseAdminto from '@Adminto/Base';
import InputFormGroup from '@Adminto/form/InputFormGroup';
import SelectFormGroup from '@Adminto/form/SelectFormGroup';
import SwitchFormGroup from '@Adminto/form/SwitchFormGroup';
import TextareaFormGroup from '@Adminto/form/TextareaFormGroup';
import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import Swal from 'sweetalert2';
import Modal from '../Components/Adminto/Modal';
import Table from '../Components/Adminto/Table';
import DxButton from '../Components/dx/DxButton';
import CreateReactScript from '../Utils/CreateReactScript';
import ReactAppend from '../Utils/ReactAppend';
import StatusesRest from '../Actions/Admin/StatusesRest';

const statusesRest = new StatusesRest()

const Statuses = ({ icons }) => {
  const gridRef = useRef()
  const modalRef = useRef()

  // Form elements ref
  const idRef = useRef()
  const iconRef = useRef()
  const nameRef = useRef()
  const descriptionRef = useRef()
  const colorRef = useRef()
  const reversibleRef = useRef()

  const [isEditing, setIsEditing] = useState(false)

  const onModalOpen = (data) => {
    if (data?.id) setIsEditing(true)
    else setIsEditing(false)

    idRef.current.value = data?.id ?? ''
    $(iconRef.current).val(data?.icon ?? null).trigger('change');
    nameRef.current.value = data?.name ?? ''
    descriptionRef.current.value = data?.description ?? ''
    colorRef.current.value = data?.color ?? ''
    $(reversibleRef.current).prop('checked', data?.reversible == 0).trigger('click')

    $(modalRef.current).modal('show')
  }

  const onModalSubmit = async (e) => {
    e.preventDefault()

    const request = {
      id: idRef.current.value || undefined,
      icon: iconRef.current.value,
      name: nameRef.current.value,
      description: descriptionRef.current.value,
      color: colorRef.current.value,
      reversible: reversibleRef.current.checked,
    }

    const result = await statusesRest.save(request)
    if (!result) return

    $(gridRef.current).dxDataGrid('instance').refresh()
    $(modalRef.current).modal('hide')
  }

  const onVisibleChange = async ({ id, value }) => {
    const result = await statusesRest.boolean({ id, field: 'visible', value })
    if (!result) return
    $(gridRef.current).dxDataGrid('instance').refresh()
  }

  const onDeleteClicked = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Eliminar registro',
      text: '¿Estas seguro de eliminar este registro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    })
    if (!isConfirmed) return
    const result = await statusesRest.delete(id)
    if (!result) return
    $(gridRef.current).dxDataGrid('instance').refresh()
  }

  const iconTemplate = (e) => {
    return $(renderToString(<span>
      <i className={`${e.id} me-1`}></i>
      {e.text.replace('mdi mdi-', '')}
    </span>))
  }

  return (<>
    <Table gridRef={gridRef} title='Estados de ventas' rest={statusesRest}
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
            text: 'Nuevo registro',
            hint: 'Nuevo registro',
            onClick: () => onModalOpen()
          }
        });
      }}
      columns={[
        {
          dataField: 'id',
          caption: 'ID',
          visible: false
        },
        {
          dataField: 'icon',
          caption: 'Ícono',
          width: '100px',
          cellTemplate: (container, { data }) => {
            container.html(renderToString(<>
              <i className={`${data.icon} me-1`}></i>
              {String(data.icon || '').replace('mdi mdi-', '')}
            </>))
          }
        },
        {
          dataField: 'name',
          caption: 'Estado',
          width: '200px'
        },
        {
          dataField: 'description',
          caption: 'Descripción',
          // cellTemplate: (container, { data }) => {
          //   container.html(renderToString(<>
          //     <i className={`fab ${data.icon} me-1`}></i>
          //     {data.description}
          //   </>))
          // }
        },
        {
          dataField: 'color',
          caption: 'Color',
          width: '100px',
          cellTemplate: (container, { data }) => {
            container.html(renderToString(<>
              <i className={`mdi mdi-checkbox-blank-circle me-1`} style={{ color: data.color }} />
              {data.color}
            </>))
          }
        },
        {
          dataField: 'visible',
          caption: 'Visible',
          dataType: 'boolean',
          width: '100px',
          cellTemplate: (container, { data }) => {
            $(container).empty()
            ReactAppend(container, <SwitchFormGroup checked={data.visible == 1} onChange={() => onVisibleChange({
              id: data.id,
              value: !data.visible
            })} />)
          }
        },
        {
          caption: 'Acciones',
          width: '150px',
          cellTemplate: (container, { data }) => {
            container.css('text-overflow', 'unset')
            container.append(DxButton({
              className: 'btn btn-xs btn-soft-primary',
              title: 'Editar',
              icon: 'fa fa-pen',
              onClick: () => onModalOpen(data)
            }))
            data.editable == 1 && container.append(DxButton({
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
    <Modal modalRef={modalRef} title={isEditing ? 'Editar estado' : 'Agregar estado'} onSubmit={onModalSubmit} size='md'>
      <div className='row' id='statuses-container'>
        <input ref={idRef} type='hidden' />
        <SelectFormGroup eRef={iconRef} label='Ícono' dropdownParent='#statuses-container' col='col-md-4' templateResult={iconTemplate} templateSelection={iconTemplate} >
          {icons.map((icon, index) => {
            return <option key={index} value={icon.id}>{icon.value}</option>
          })}
        </SelectFormGroup>
        <InputFormGroup eRef={nameRef} label='Estado' col='col-md-8' required />
        <TextareaFormGroup eRef={descriptionRef} label='Descripción' col='col-12' />
        <InputFormGroup eRef={colorRef} label='Color (#000000)' type="color" col='col-md-6' rows={2} required />
        <SwitchFormGroup eRef={reversibleRef} label='Reversible' info="Sirve para controlar si el estado se puede revertir o no" col='col-md-6' />
      </div>
    </Modal>
  </>
  )
}

CreateReactScript((el, properties) => {

  createRoot(el).render(<BaseAdminto {...properties} title='Estados de ventas'>
    <Statuses {...properties} />
  </BaseAdminto>);
})