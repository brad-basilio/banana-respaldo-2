import BaseAdminto from '@Adminto/Base';
import SwitchFormGroup from '@Adminto/form/SwitchFormGroup';
import TextareaFormGroup from '@Adminto/form/TextareaFormGroup';
import ImageFormGroup from '@Adminto/form/ImageFormGroup';
import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Swal from 'sweetalert2';
import TagsRest from '../Actions/Admin/TagsRets';
import InputFormGroup from '../Components/Adminto/form/InputFormGroup';
import Modal from '../Components/Adminto/Modal';
import Table from '../Components/Adminto/Table';
import DxButton from '../Components/dx/DxButton';
import CreateReactScript from '../Utils/CreateReactScript';
import ReactAppend from '../Utils/ReactAppend';

const tagsRest = new TagsRest()

const Tags = () => {

  const gridRef = useRef()
  const modalRef = useRef()

  // Form elements ref
  const idRef = useRef()
  const nameRef = useRef()
  const descriptionRef = useRef()
  const backgroundColorRef = useRef()
  const textColorRef = useRef()
  const iconRef = useRef()
  const imageRef = useRef()

  const [isEditing, setIsEditing] = useState(false)

  const onModalOpen = (data) => {
    if (data?.id) setIsEditing(true)
    else setIsEditing(false)

    idRef.current.value = data?.id ?? ''
    nameRef.current.value = data?.name ?? ''
    descriptionRef.current.value = data?.description ?? ''
    backgroundColorRef.current.value = data?.background_color ?? '#3b82f6'
    textColorRef.current.value = data?.text_color ?? '#ffffff'
    
    // Para el icono (imagen pequeña que va al lado del texto)
    if (iconRef.current && data?.icon) {
      iconRef.current.src = `/storage/images/tag/${data.icon}`
    }
    
    // Para la imagen principal (otros fines)
    if (imageRef.current && data?.image) {
      imageRef.current.src = `/storage/images/tag/${data.image}`
    }

    $(modalRef.current).modal('show')
  }

  const onModalSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('id', idRef.current.value || '')
    formData.append('name', nameRef.current.value)
    formData.append('description', descriptionRef.current.value)
    formData.append('background_color', backgroundColorRef.current.value)
    formData.append('text_color', textColorRef.current.value)
    
    // Agregar icono (imagen pequeña) si se seleccionó una nueva
    if (iconRef.current.src && iconRef.current.src) {
      formData.append('icon', iconRef.current.files[0])
    }
    
    // Agregar imagen principal si se seleccionó una nueva
    if (imageRef.current.files && imageRef.current.files[0]) {
      formData.append('image', imageRef.current.files[0])
    }

    const result = await tagsRest.save(formData)
    if (!result) return

    $(gridRef.current).dxDataGrid('instance').refresh()
    $(modalRef.current).modal('hide')
  }

  const onVisibleChange = async ({ id, value }) => {
    const result = await tagsRest.boolean({ id, field: 'visible', value })
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
    const result = await tagsRest.delete(id)
    if (!result) return
    $(gridRef.current).dxDataGrid('instance').refresh()
  }

  return (<>
    <Table gridRef={gridRef} title='Etiquetas' rest={tagsRest}
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
          dataField: 'name',
          caption: 'Etiqueta',
          width: '25%',
        },
        {
          dataField: 'description',
          caption: 'Descripción',
          width: '25%',
        },
        {
          dataField: 'preview',
          caption: 'Vista Previa',
          width: '20%',
          allowSorting: false,
          allowFiltering: false,
          cellTemplate: (container, { data }) => {
            $(container).empty()
            const tagStyle = {
              backgroundColor: data.background_color || '#3b82f6',
              color: data.text_color || '#ffffff',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              maxWidth: '150px'
            }
            
            const content = (
              <span style={tagStyle}>
                {data.icon && <img src={`/storage/images/tag/${data.icon}`} style={{width: '16px', height: '16px', borderRadius: '2px'}} alt="icon"   onError={(e) =>
                                        (e.target.src =
                                            "/api/cover/thumbnail/null")
                                    } />}
                <span>{data.name}</span>
              </span>
            )
            ReactAppend(container, content)
          }
        },
        {
          dataField: 'image',
          caption: 'Imagen Principal',
          width: '15%',
          allowSorting: false,
          allowFiltering: false,
          cellTemplate: (container, { data }) => {
            $(container).empty()
            if (data.image) {
              const content = (
                <img 
                  src={`/storage/${data.image}`} 
                  style={{
                    width: '40px', 
                    height: '24px', 
                    objectFit: 'cover', 
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }} 
                  alt="imagen principal" 
                />
              )
              ReactAppend(container, content)
            } else {
              container.text('Sin imagen')
            }
          }
        },
        {
          dataField: 'visible',
          caption: 'Visible',
          dataType: 'boolean',
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
    <Modal modalRef={modalRef} title={isEditing ? 'Editar etiqueta' : 'Agregar etiqueta'} onSubmit={onModalSubmit} size='lg'>
      <div className='row' id='tags-container'>
        <input ref={idRef} type='hidden' />
        
        <InputFormGroup eRef={nameRef} label='Nombre de la Etiqueta' col='col-12' required />
        
        <TextareaFormGroup eRef={descriptionRef} label='Descripción' col='col-12' rows={2} />
        
        <div className='col-md-6'>
          <div className="form-group mb-2">
            <label className="form-label">Color de Fondo</label>
            <input ref={backgroundColorRef} type="color" className="form-control form-control-color" defaultValue="#3b82f6" />
          </div>
        </div>
        
        <div className='col-md-6'>
          <div className="form-group mb-2">
            <label className="form-label">Color de Texto</label>
            <input ref={textColorRef} type="color" className="form-control form-control-color" defaultValue="#ffffff" />
          </div>
        </div>
        
        <ImageFormGroup eRef={iconRef} label='Icono (imagen pequeña que aparece al lado del texto)' col='col-md-6' aspect='1/1' />
        
        <ImageFormGroup eRef={imageRef} label='Imagen Principal (para otros fines)' col='col-md-6' aspect='16/9' />
      </div>
    </Modal>
  </>
  )
}

CreateReactScript((el, properties) => {
  createRoot(el).render(<BaseAdminto {...properties} title='Etiquetas'>
    <Tags {...properties} />
  </BaseAdminto>);
})