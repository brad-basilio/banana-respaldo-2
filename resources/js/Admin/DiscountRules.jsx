import React, { useRef, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import BaseAdminto from '@Adminto/Base';
import CreateReactScript from '../Utils/CreateReactScript';
import Table from '../Components/Adminto/Table';
import InputFormGroup from '../Components/Adminto/form/InputFormGroup';
import ReactAppend from '../Utils/ReactAppend';
import DxButton from '../Components/dx/DxButton';
import SwitchFormGroup from '@Adminto/form/SwitchFormGroup';
import SelectFormGroup from '../Components/Adminto/form/SelectFormGroup';
import TextareaFormGroup from '../Components/Adminto/form/TextareaFormGroup';
import Modal from '../Components/Adminto/Modal';
import Swal from 'sweetalert2';
import DiscountRulesRest from '../Actions/Admin/DiscountRulesRest';
import { renderToString } from 'react-dom/server';

const discountRulesRest = new DiscountRulesRest();

const DiscountRules = ({ }) => {
  const gridRef = useRef()
  const modalRef = useRef()
  const conditionsModalRef = useRef()
  // Form elements ref
  const idRef = useRef();
  const nameRef = useRef();
  const descriptionRef = useRef();
  const ruleTypeRef = useRef();
  const activeRef = useRef();
  const priorityRef = useRef();
  const startsAtRef = useRef();
  const endsAtRef = useRef();
  const usageLimitRef = useRef();
  const usageLimitPerCustomerRef = useRef();
  const combinableRef = useRef();
  const stopFurtherRulesRef = useRef();
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);
  const [ruleTypes, setRuleTypes] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [conditions, setConditions] = useState({});
  const [actions, setActions] = useState({});
  const [selectedRuleType, setSelectedRuleType] = useState('');

  const formatDateTimeLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getDefaultConfiguration = (ruleType) => {
    const defaults = {
      'quantity_discount': {
        conditions: { min_quantity: 2, product_ids: [], category_ids: [] },
        actions: { discount_type: 'percentage', discount_value: 10 }
      },
      'cart_discount': {
        conditions: { min_amount: 100, currency: 'PEN' },
        actions: { discount_type: 'percentage', discount_value: 10 }
      },
      'buy_x_get_y': {
        conditions: { buy_quantity: 2, product_ids: [] },
        actions: { get_quantity: 1, discount_type: 'fixed', discount_value: 0 }
      },
      'category_discount': {
        conditions: { category_ids: [], min_quantity: 1 },
        actions: { discount_type: 'percentage', discount_value: 15 }
      },
      'tiered_discount': {
        conditions: {
          tiers: [
            { min_quantity: 3, max_quantity: 5 },
            { min_quantity: 6, max_quantity: 10 },
            { min_quantity: 11, max_quantity: null }
          ]
        },
        actions: {
          tier_discounts: [
            { discount_type: 'percentage', discount_value: 5 },
            { discount_type: 'percentage', discount_value: 10 },
            { discount_type: 'percentage', discount_value: 15 }
          ]
        }
      },
      'bundle_discount': {
        conditions: { required_products: [], min_quantity_each: 1 },
        actions: { discount_type: 'percentage', discount_value: 25 }
      }
    };

    return defaults[ruleType] || {
      conditions: { min_quantity: 1 },
      actions: { discount_type: 'percentage', discount_value: 10 }
    };
  };
  const onRuleTypeChange = (ruleType) => {
    setSelectedRuleType(ruleType);
    if (ruleType) {
      const defaultConfig = getDefaultConfiguration(ruleType);
      setConditions(defaultConfig.conditions);
      setActions(defaultConfig.actions);
    } else {
      setConditions({});
      setActions({});
    }
  };

  useEffect(() => {
    loadAuxiliaryData()
  }, [])

  const loadAuxiliaryData = async () => {
    const [ruleTypesData, productsData, categoriesData] = await Promise.all([
      discountRulesRest.getRuleTypes(),
      discountRulesRest.getProducts(),
      discountRulesRest.getCategories()
    ])
    
    setRuleTypes(ruleTypesData)
    setProducts(productsData)
    setCategories(categoriesData)
  }
  const onModalOpen = (data) => {
    if (data?.id) {
      setIsEditing(true)
      setCurrentRule(data)
    } else {
      setIsEditing(false)
      setCurrentRule(null)
    }

    idRef.current.value = data?.id ?? ''
    nameRef.current.value = data?.name ?? ''
    descriptionRef.current.value = data?.description ?? ''
    
    const ruleType = data?.rule_type ?? '';
    setSelectedRuleType(ruleType);
    
    if (ruleTypeRef.current) {
      $(ruleTypeRef.current).val(ruleType).trigger('change')
      // Configurar el evento change para jQuery select
      $(ruleTypeRef.current).off('change.ruleType').on('change.ruleType', function() {
        const selectedType = $(this).val();
        onRuleTypeChange(selectedType);
      });
    }
      priorityRef.current.value = data?.priority ?? 0;
    startsAtRef.current.value = data?.starts_at ? formatDateTimeLocal(new Date(data.starts_at)) : '';
    endsAtRef.current.value = data?.ends_at ? formatDateTimeLocal(new Date(data.ends_at)) : '';
    usageLimitRef.current.value = data?.usage_limit ?? ''
    usageLimitPerCustomerRef.current.value = data?.usage_limit_per_customer ?? ''
    
    // Set switches
    if (data?.active !== undefined) {
      $(activeRef.current).prop('checked', data.active).trigger('change')
    } else {
      $(activeRef.current).prop('checked', true).trigger('change')
    }
    
    $(combinableRef.current).prop('checked', data?.combinable ?? false).trigger('change')
    $(stopFurtherRulesRef.current).prop('checked', data?.stop_further_rules ?? false).trigger('change')

    // Configurar conditions y actions
    if (data?.conditions || data?.actions) {
      setConditions(data?.conditions ?? {})
      setActions(data?.actions ?? {})
    } else if (ruleType) {
      // Si es una nueva regla, aplicar configuración por defecto
      const defaultConfig = getDefaultConfiguration(ruleType);
      setConditions(defaultConfig.conditions);
      setActions(defaultConfig.actions);
    } else {
      setConditions({})
      setActions({})
    }

    $(modalRef.current).modal('show')
  }

  const onModalSubmit = async (e) => {
    e.preventDefault()

    const request = {
      id: idRef.current.value || undefined,
      name: nameRef.current.value,
      description: descriptionRef.current.value,
      rule_type: $(ruleTypeRef.current).val(),
      active: activeRef.current.checked,
      priority: parseInt(priorityRef.current.value) || 0,
      starts_at: startsAtRef.current.value || null,
      ends_at: endsAtRef.current.value || null,
      usage_limit: parseInt(usageLimitRef.current.value) || null,
      usage_limit_per_customer: parseInt(usageLimitPerCustomerRef.current.value) || null,
      combinable: combinableRef.current.checked,
      stop_further_rules: stopFurtherRulesRef.current.checked,
      conditions: conditions,
      actions: actions
    }

    const result = await discountRulesRest.save(request)
    if (!result) return

    $(gridRef.current).dxDataGrid('instance').refresh()
    $(modalRef.current).modal('hide')
  }

  const onActiveChange = async ({ id, value }) => {
    const result = await discountRulesRest.toggleActive(id, value)
    if (!result) return
    $(gridRef.current).dxDataGrid('instance').refresh()
  }

  const onDuplicateClicked = async (id) => {
    const result = await discountRulesRest.duplicate(id)
    if (!result) return
    $(gridRef.current).dxDataGrid('instance').refresh()
  }

  const onDeleteClicked = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Eliminar regla de descuento',
      text: '¿Estás seguro de eliminar esta regla?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })
    if (!isConfirmed) return
    const result = await discountRulesRest.delete(id)
    if (!result) return
    $(gridRef.current).dxDataGrid('instance').refresh()
  }

  const openConditionsModal = () => {
    $(conditionsModalRef.current).modal('show')
  }

  const getStatusBadge = (rule) => {
    const status = rule.status || 'Activa'
    const colors = {
      'Activa': 'success',
      'Inactiva': 'secondary',
      'Programada': 'info',
      'Expirada': 'warning',
      'Agotada': 'danger'
    }
    return `<span class="badge badge-${colors[status] || 'secondary'}">${status}</span>`
  }

  const formatRuleDescription = (rule) => {
    const conditions = rule.conditions || {}
    const actions = rule.actions || {}
    
    let description = rule.description || ''
    
    // Generar descripción automática basada en el tipo
    if (rule.rule_type === 'quantity_discount' && conditions.min_quantity && actions.discount_value) {
      description = `Compra ${conditions.min_quantity}+ items → ${actions.discount_value}${actions.discount_type === 'percentage' ? '%' : ' soles'} desc.`
    } else if (rule.rule_type === 'cart_discount' && conditions.min_amount && actions.discount_value) {
      description = `Compras desde S/${conditions.min_amount} → ${actions.discount_value}${actions.discount_type === 'percentage' ? '%' : ' soles'} desc.`
    } else if (rule.rule_type === 'buy_x_get_y' && conditions.buy_quantity && actions.get_quantity) {
      description = `Compra ${conditions.buy_quantity} lleva ${actions.get_quantity} gratis`
    }
    
    return description
  }

  return (<>
    <Table gridRef={gridRef} title='Reglas de Descuento' rest={discountRulesRest}
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
            text: 'Nueva regla',
            hint: 'Crear nueva regla de descuento',
            onClick: () => onModalOpen()
          }
        });
      }}
      columns={[
        {
          dataField: 'id',
          caption: 'ID',
          width: '60px',
          visible: false
        },
        {
          dataField: 'name',
          caption: 'Nombre',
          width: '25%',
          cellTemplate: (container, { data }) => {
            ReactAppend(container, 
              <div>
                <strong className="d-block">{data.name}</strong>
                <small className="text-muted">{formatRuleDescription(data)}</small>
              </div>
            )
          }
        },
        {
          dataField: 'rule_type',
          caption: 'Tipo',
          width: '15%',
          cellTemplate: (container, { data }) => {
            const typeName = ruleTypes[data.rule_type]?.name || data.rule_type
            container.html(renderToString(
              <span className="badge badge-info">{typeName}</span>
            ))
          }
        },
        {
          dataField: 'priority',
          caption: 'Prioridad',
          width: '80px',
          cellTemplate: (container, { data }) => {
            container.html(renderToString(
              <span className="badge badge-primary">{data.priority}</span>
            ))
          }
        },
        {
          dataField: 'dates',
          caption: 'Vigencia',
          width: '15%',
          allowFiltering: false,
          cellTemplate: (container, { data }) => {
            const content = (data.starts_at || data.ends_at) 
              ? <>                  {data.starts_at && <div><small><strong>Desde:</strong> {formatDisplayDate(data.starts_at)}</small></div>}
                  {data.ends_at && <div><small><strong>Hasta:</strong> {formatDisplayDate(data.ends_at)}</small></div>}
                </>
              : <small className="text-muted">Sin límite de tiempo</small>
            
            container.html(renderToString(content))
          }
        },
        {
          dataField: 'usage',
          caption: 'Uso',
          width: '10%',
          allowFiltering: false,
          cellTemplate: (container, { data }) => {
            const usage = data.used_count || 0
            const limit = data.usage_limit
            const content = limit 
              ? `${usage}/${limit}`
              : `${usage}`
            
            container.html(renderToString(
              <div className="text-center">
                <strong>{content}</strong>
                {limit && <div className="progress progress-sm mt-1">
                  <div className="progress-bar" style={{width: `${Math.min((usage/limit)*100, 100)}%`}}></div>
                </div>}
              </div>
            ))
          }
        },
        {
          dataField: 'status',
          caption: 'Estado',
          width: '10%',
          cellTemplate: (container, { data }) => {
            container.html(getStatusBadge(data))
          }
        },
        {
          dataField: 'active',
          caption: 'Activa',
          width: '80px',
          cellTemplate: (container, { data }) => {
            ReactAppend(container, 
              <SwitchFormGroup 
                checked={data.active} 
                onChange={(e) => onActiveChange({ id: data.id, value: e.target.checked })} 
              />
            )
          }
        },
        {
          caption: 'Acciones',
          width: '120px',
          cellTemplate: (container, { data }) => {
            container.css('text-overflow', 'unset')
            container.append(DxButton({
              className: 'btn btn-xs btn-soft-info mr-1',
              title: 'Duplicar',
              icon: 'fa fa-copy',
              onClick: () => onDuplicateClicked(data.id)
            }))
            container.append(DxButton({
              className: 'btn btn-xs btn-soft-primary mr-1',
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

    {/* Modal principal */}
    <Modal modalRef={modalRef} title={isEditing ? 'Editar regla de descuento' : 'Nueva regla de descuento'} onSubmit={onModalSubmit} size='lg'>
      <div className='row' id='discount-rule-form'>
        <input ref={idRef} type='hidden' />
        
        {/* Información básica */}
        <div className="col-md-8">
          <InputFormGroup eRef={nameRef} label='Nombre de la regla' required />
          <TextareaFormGroup eRef={descriptionRef} label='Descripción' rows={2} />
        </div>
        <div className="col-md-4">
          <SwitchFormGroup eRef={activeRef} label='Regla activa' />
          <InputFormGroup eRef={priorityRef} label='Prioridad' type='number' min={0} specification='Mayor número = mayor prioridad' />
        </div>

        {/* Tipo de regla */}
        <div className="col-md-6">
          <SelectFormGroup 
            eRef={ruleTypeRef} 
            label='Tipo de regla' 
           
            required 
            dropdownParent={
                "#discount-rule-form"
            }
          >
            <option value=''>Seleccione un tipo</option>
            {Object.entries(ruleTypes).map(([key, type]) => (
                <option key={key} value={key}>{type.name}</option>
                ))}
          </SelectFormGroup>
        </div>

        {/* Fechas */}
        <div className="col-md-3">
          <InputFormGroup eRef={startsAtRef} label='Inicia' type='datetime-local' />
        </div>
        <div className="col-md-3">
          <InputFormGroup eRef={endsAtRef} label='Termina' type='datetime-local' />
        </div>

        {/* Límites de uso */}
        <div className="col-md-6">
          <InputFormGroup eRef={usageLimitRef} label='Límite total de usos' type='number' min={1} />
        </div>
        <div className="col-md-6">
          <InputFormGroup eRef={usageLimitPerCustomerRef} label='Límite por cliente' type='number' min={1} />
        </div>

        {/* Configuración avanzada */}
        <div className="col-md-6">
          <SwitchFormGroup eRef={combinableRef} label='Combinable con otras reglas' />
        </div>
        <div className="col-md-6">
          <SwitchFormGroup eRef={stopFurtherRulesRef} label='Detener evaluación de otras reglas' />
        </div>

        {/* Botón para configurar condiciones y acciones */}
        <div className="col-12">
          <hr />
          <button type="button" className="btn btn-info btn-block" onClick={openConditionsModal}>
            <i className="fa fa-cogs mr-2"></i>
            Configurar Condiciones y Acciones
          </button>
          <small className="text-muted">
            Define cuándo se aplica la regla y qué descuento otorga
          </small>
        </div>
      </div>
    </Modal>    {/* Modal para condiciones y acciones - Mejorado */}
    <Modal modalRef={conditionsModalRef} title='Configurar Condiciones y Acciones' size='lg' hideSubmit>
      <div className="row">
        <div className="col-12">
          {selectedRuleType ? (
            <div>
              <div className="alert alert-info">
                <h5><i className="fa fa-info-circle mr-2"></i>Tipo de regla: {ruleTypes[selectedRuleType]?.name}</h5>
                <p>{ruleTypes[selectedRuleType]?.description}</p>
                <small><strong>Ejemplo:</strong> {ruleTypes[selectedRuleType]?.example}</small>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <h6><i className="fa fa-filter mr-2"></i>Condiciones</h6>
                  <div className="bg-light p-3 rounded">
                    {Object.keys(conditions).length > 0 ? (
                      <ul className="mb-0">
                        {Object.entries(conditions).map(([key, value]) => (
                          <li key={key}>
                            <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') || 'No especificado' : value || 'No especificado'}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <em className="text-muted">No hay condiciones configuradas</em>
                    )}
                  </div>
                </div>
                
                <div className="col-md-6">
                  <h6><i className="fa fa-bolt mr-2"></i>Acciones</h6>
                  <div className="bg-light p-3 rounded">
                    {Object.keys(actions).length > 0 ? (
                      <ul className="mb-0">
                        {Object.entries(actions).map(([key, value]) => (
                          <li key={key}>
                            <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <em className="text-muted">No hay acciones configuradas</em>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="alert alert-warning">
                  <i className="fa fa-exclamation-triangle mr-2"></i>
                  <strong>Configuración automática aplicada:</strong> Esta regla ha sido configurada automáticamente con valores por defecto basados en el tipo seleccionado. 
                  La funcionalidad de edición manual de condiciones y acciones se implementará en una versión futura.
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning">
              <h5><i className="fa fa-exclamation-triangle mr-2"></i>Selecciona un tipo de regla</h5>
              <p>Primero debes seleccionar un tipo de regla para configurar las condiciones y acciones.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  </>)
}

CreateReactScript((el, properties) => {
  createRoot(el).render(
  <BaseAdminto {...properties} title='Reglas de Descuento'>
    <DiscountRules {...properties} />
  </BaseAdminto>);
})
