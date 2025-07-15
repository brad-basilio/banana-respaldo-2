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
import SelectAPIFormGroup from '../Components/Adminto/form/SelectAPIFormGroup';
import TextareaFormGroup from '../Components/Adminto/form/TextareaFormGroup';
import Modal from '../Components/Adminto/Modal';
import Swal from 'sweetalert2';
import DiscountRulesRest from '../Actions/Admin/DiscountRulesRest';
import { renderToString } from 'react-dom/server';
import SetSelectValue from '../Utils/SetSelectValue';

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
  
  // Refs para condiciones y acciones
  const minQuantityRef = useRef();
  const minAmountRef = useRef();
  const buyQuantityRef = useRef();
  const getQuantityRef = useRef();
  const minQuantityEachRef = useRef();
  const discountTypeRef = useRef();
  const discountValueRef = useRef();  const productIdsRef = useRef();
  const categoryIdsRef = useRef();
  const requiredProductsRef = useRef();
  const maxDiscountRef = useRef();
  const freeProductIdsRef = useRef();
  
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
    $(stopFurtherRulesRef.current).prop('checked', data?.stop_further_rules ?? false).trigger('change')    // Configurar conditions y actions
    console.log('Datos recibidos en onModalOpen:', { 
      dataConditions: data?.conditions, 
      dataActions: data?.actions,
      ruleType 
    });
    
    if (data?.conditions || data?.actions) {
      const parsedConditions = typeof data.conditions === 'string' 
        ? JSON.parse(data.conditions) 
        : data.conditions || {};
      const parsedActions = typeof data.actions === 'string' 
        ? JSON.parse(data.actions) 
        : data.actions || {};
        
      console.log('Conditions y actions parseados:', { parsedConditions, parsedActions });
      
      setConditions(parsedConditions);
      setActions(parsedActions);
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

    // Validar la configuración antes de guardar
    if (!validateRuleConfiguration()) {
      return;
    }

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
    
    // Mostrar mensaje de éxito
    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: isEditing ? 'La regla ha sido actualizada correctamente' : 'La nueva regla ha sido creada correctamente',
      timer: 2000,
      showConfirmButton: false
    });
  }
  const onBooleanChange = async ({ id, field, value }) => {
        const result = await discountRulesRest.boolean({ id, field, value });
        if (!result) return;
        $(gridRef.current).dxDataGrid("instance").refresh();
    };

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
    $(gridRef.current).dxDataGrid('instance').refresh()  }
  const openConditionsModal = () => {
    console.log('Abriendo modal de condiciones...', { isEditing, conditions, actions });
    
    // Mostrar el modal primero
    $(conditionsModalRef.current).modal('show');
    
    // Si hay condiciones o acciones guardadas (indicando que es una regla existente), cargarlas
    if (Object.keys(conditions).length > 0 || Object.keys(actions).length > 0) {
      console.log('Regla con datos existentes detectada, cargando valores...');
      
      // Esperar a que el modal esté completamente visible
      $(conditionsModalRef.current).one('shown.bs.modal', () => {
        console.log('Modal completamente visible, cargando valores...');
        setTimeout(() => {
          setFieldValues({ conditions, actions });
        }, 500);
      });
    }
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
  // Función para actualizar condiciones
  const updateCondition = (key, value) => {
    setConditions(prev => ({ ...prev, [key]: value }));
  };

  // Función para actualizar acciones
  const updateAction = (key, value) => {
    setActions(prev => ({ ...prev, [key]: value }));
  };

  // Función para obtener valores de los campos usando refs
  const getFieldValues = () => {
    const fieldValues = {
      conditions: {},
      actions: {}
    };

    // Obtener valores de condiciones
    if (minQuantityRef.current) fieldValues.conditions.min_quantity = parseInt(minQuantityRef.current.value) || 1;
    if (minAmountRef.current) fieldValues.conditions.min_amount = parseFloat(minAmountRef.current.value) || 0;
    if (buyQuantityRef.current) fieldValues.conditions.buy_quantity = parseInt(buyQuantityRef.current.value) || 1;
    if (minQuantityEachRef.current) fieldValues.conditions.min_quantity_each = parseInt(minQuantityEachRef.current.value) || 1;

    // Obtener valores de select API para condiciones
    if (productIdsRef.current) {
      const selectedProducts = $(productIdsRef.current).val();
      fieldValues.conditions.product_ids = selectedProducts || [];
    }
    if (categoryIdsRef.current) {
      const selectedCategories = $(categoryIdsRef.current).val();
      fieldValues.conditions.category_ids = selectedCategories || [];
    }
    if (requiredProductsRef.current) {
      const selectedRequired = $(requiredProductsRef.current).val();
      fieldValues.conditions.required_products = selectedRequired || [];
    }

    // Obtener valores de acciones
    if (discountTypeRef.current) fieldValues.actions.discount_type = discountTypeRef.current.value;
    if (discountValueRef.current) fieldValues.actions.discount_value = parseFloat(discountValueRef.current.value) || 0;
    if (maxDiscountRef.current) fieldValues.actions.max_discount = parseFloat(maxDiscountRef.current.value) || null;
    if (getQuantityRef.current) fieldValues.actions.get_quantity = parseInt(getQuantityRef.current.value) || 1;

    // Obtener valores de select API para acciones
    if (freeProductIdsRef.current) {
      const selectedFree = $(freeProductIdsRef.current).val();
      fieldValues.actions.free_product_ids = selectedFree || [];
    }

    return fieldValues;
  };  // Función para establecer valores en los campos usando refs
  const setFieldValues = (ruleData) => {
    const conditionsData = ruleData.conditions || {};
    const actionsData = ruleData.actions || {};

    console.log('setFieldValues ejecutándose con:', { 
      conditionsData, 
      actionsData,
      selectedRuleType,
      refs: {
        buyQuantityRef: buyQuantityRef.current,
        productIdsRef: productIdsRef.current,
        getQuantityRef: getQuantityRef.current,
        freeProductIdsRef: freeProductIdsRef.current
      }
    });

    // Establecer valores de condiciones
    if (minQuantityRef.current) {
      minQuantityRef.current.value = conditionsData.min_quantity || '';
      console.log('Cantidad mínima establecida:', conditionsData.min_quantity);
    }
    if (minAmountRef.current) {
      minAmountRef.current.value = conditionsData.min_amount || '';
      console.log('Monto mínimo establecido:', conditionsData.min_amount);
    }
    if (buyQuantityRef.current) {
      buyQuantityRef.current.value = conditionsData.buy_quantity || '';
      console.log('Cantidad compra establecida:', conditionsData.buy_quantity);
    }
    if (minQuantityEachRef.current) {
      minQuantityEachRef.current.value = conditionsData.min_quantity_each || '';
    }

    // Establecer valores de acciones
    if (discountTypeRef.current) {
      discountTypeRef.current.value = actionsData.discount_type || 'percentage';
      console.log('Tipo descuento establecido:', actionsData.discount_type);
    }
    if (discountValueRef.current) {
      discountValueRef.current.value = actionsData.discount_value || '';
      console.log('Valor descuento establecido:', actionsData.discount_value);
    }
    if (maxDiscountRef.current) {
      maxDiscountRef.current.value = actionsData.max_discount || '';
    }
    if (getQuantityRef.current) {
      getQuantityRef.current.value = actionsData.get_quantity || '';
      console.log('Cantidad gratis establecida:', actionsData.get_quantity);
    }    // Para los selects API, necesitamos cargar los datos desde la API y usar SetSelectValue
    const setSelectValues = async () => {
      console.log('Estableciendo valores de selects con SetSelectValue...');
      
      try {
        // Cargar productos si se necesitan
        if (productIdsRef.current && conditionsData.product_ids && Array.isArray(conditionsData.product_ids) && conditionsData.product_ids.length > 0) {
          console.log('Cargando productos para establecer:', conditionsData.product_ids);
          const productsToSet = await discountRulesRest.getProductsByIds(conditionsData.product_ids);
          console.log('Productos cargados:', productsToSet);
          SetSelectValue(productIdsRef.current, productsToSet, "id", "name");
        }
        
        // Cargar categorías si se necesitan
        if (categoryIdsRef.current && conditionsData.category_ids && Array.isArray(conditionsData.category_ids) && conditionsData.category_ids.length > 0) {
          console.log('Cargando categorías para establecer:', conditionsData.category_ids);
          const categoriesToSet = await discountRulesRest.getCategoriesByIds(conditionsData.category_ids);
          console.log('Categorías cargadas:', categoriesToSet);
          SetSelectValue(categoryIdsRef.current, categoriesToSet, "id", "name");
        }
        
        // Cargar productos requeridos si se necesitan
        if (requiredProductsRef.current && conditionsData.required_products && Array.isArray(conditionsData.required_products) && conditionsData.required_products.length > 0) {
          console.log('Cargando productos requeridos para establecer:', conditionsData.required_products);
          const requiredToSet = await discountRulesRest.getProductsByIds(conditionsData.required_products);
          console.log('Productos requeridos cargados:', requiredToSet);
          SetSelectValue(requiredProductsRef.current, requiredToSet, "id", "name");
        }
          // Cargar productos gratis si se necesitan
        if (freeProductIdsRef.current && actionsData.free_product_ids && Array.isArray(actionsData.free_product_ids) && actionsData.free_product_ids.length > 0) {
          console.log('Cargando productos gratis para establecer:', actionsData.free_product_ids);
          const freeToSet = await discountRulesRest.getProductsByIds(actionsData.free_product_ids);
          console.log('Productos gratis cargados:', freeToSet);
          SetSelectValue(freeProductIdsRef.current, freeToSet, "id", "name");
        }
        
      } catch (error) {
        console.error('Error cargando datos para selects:', error);
      }
    };

    // Establecer valores de select de forma asíncrona
    setTimeout(() => setSelectValues(), 300);
    setTimeout(() => setSelectValues(), 700);
    setTimeout(() => setSelectValues(), 1200);
  };
  // Renderizar formulario de condiciones según el tipo de regla
  const renderConditionsForm = () => {
    switch (selectedRuleType) {
      case 'quantity_discount':
        return (
          <>
            <InputFormGroup 
              eRef={minQuantityRef}
              label="Cantidad mínima requerida"
              type="number"
              min="1"
              required
              specification="El cliente debe comprar al menos esta cantidad"
            />
              <SelectAPIFormGroup
              eRef={productIdsRef}
              label="Productos específicos (opcional)"
              searchAPI="/api/admin/items/paginate"
              searchBy="name"
              dropdownParent="#conditions-actions-form"
              multiple
              tags
              specification="Si no selecciona ninguno, aplicará a todos los productos"
            />
            
            <SelectAPIFormGroup
              eRef={categoryIdsRef}
              label="Categorías específicas (opcional)"
              searchAPI="/api/admin/categories/paginate"
              searchBy="name"
              dropdownParent="#conditions-actions-form"
              multiple
              tags
              specification="Si no selecciona ninguna, aplicará a todas las categorías"
            />
          </>
        );

      case 'cart_discount':
        return (
          <>
            <InputFormGroup 
              eRef={minAmountRef}
              label="Monto mínimo del carrito"
              type="number"
              min="0"
              step="0.01"
              required
              prefix="S/ "
              specification="El carrito debe alcanzar este monto mínimo"
            />
          </>
        );

      case 'buy_x_get_y':
        return (
          <>
            <InputFormGroup 
              eRef={buyQuantityRef}
              label="Cantidad a comprar"
              type="number"
              min="1"
              required
              specification="Cuántos productos debe comprar el cliente"
            />
              <SelectAPIFormGroup
              eRef={productIdsRef}
              label="Productos aplicables"
              searchAPI="/api/admin/items/paginate"
              searchBy="name"
              dropdownParent="#conditions-actions-form"
              multiple
              tags
              required
              specification="Debe seleccionar al menos un producto"
            />
          </>
        );

      case 'category_discount':
        return (
          <>            <SelectAPIFormGroup
              eRef={categoryIdsRef}
              label="Categorías"
              searchAPI="/api/admin/categories/paginate"
              searchBy="name"
              dropdownParent="#conditions-actions-form"
              multiple
              tags
              required
              specification="Seleccione las categorías que tendrán descuento"
            />
            
            <InputFormGroup 
              eRef={minQuantityRef}
              label="Cantidad mínima por categoría"
              type="number"
              min="1"
              specification="Cantidad mínima de productos de la categoría seleccionada"
            />
          </>
        );

      case 'bundle_discount':
        return (
          <>            <SelectAPIFormGroup
              eRef={requiredProductsRef}
              label="Productos requeridos"
              searchAPI="/api/admin/items/paginate"
              searchBy="name"
              dropdownParent="#conditions-actions-form"
              multiple
              tags
              required
              specification="El cliente debe comprar TODOS estos productos para obtener el descuento"
            />
            
            <InputFormGroup 
              eRef={minQuantityEachRef}
              label="Cantidad mínima de cada producto"
              type="number"
              min="1"
              specification="Cantidad mínima que debe comprar de cada producto"
            />
          </>
        );

      case 'tiered_discount':
        return (
          <div>
            <div className="alert alert-info">
              <small><strong>Descuento escalonado:</strong> Diferentes descuentos según la cantidad comprada</small>
            </div>
            
            <label className="form-label">Configuración de niveles:</label>
            {(conditions.tiers || []).map((tier, index) => (
              <div key={index} className="card mb-2">
                <div className="card-body p-3">
                  <div className="row">
                    <div className="col-4">
                      <InputFormGroup 
                        label="Cantidad mínima"
                        type="number"
                        min="1"
                        value={tier.min_quantity || 1}
                        onChange={(e) => {
                          const newTiers = [...(conditions.tiers || [])];
                          newTiers[index] = { ...tier, min_quantity: parseInt(e.target.value) || 1 };
                          updateCondition('tiers', newTiers);
                        }}
                      />
                    </div>
                    <div className="col-4">
                      <InputFormGroup 
                        label="Cantidad máxima"
                        type="number"
                        placeholder="Sin límite"
                        value={tier.max_quantity || ''}
                        onChange={(e) => {
                          const newTiers = [...(conditions.tiers || [])];
                          newTiers[index] = { ...tier, max_quantity: e.target.value ? parseInt(e.target.value) : null };
                          updateCondition('tiers', newTiers);
                        }}
                      />
                    </div>
                    <div className="col-3">
                      <InputFormGroup 
                        label="Descuento (%)"
                        type="number"
                        min="0"
                        max="100"
                        value={(actions.tier_discounts?.[index]?.discount_value) || 0}
                        onChange={(e) => {
                          const newDiscounts = [...(actions.tier_discounts || [])];
                          newDiscounts[index] = { 
                            discount_type: 'percentage', 
                            discount_value: parseInt(e.target.value) || 0 
                          };
                          updateAction('tier_discounts', newDiscounts);
                        }}
                      />
                    </div>
                    <div className="col-1 d-flex align-items-end">
                      <button 
                        type="button" 
                        className="btn btn-sm btn-danger mb-3"
                        onClick={() => {
                          const newTiers = conditions.tiers?.filter((_, i) => i !== index) || [];
                          const newDiscounts = actions.tier_discounts?.filter((_, i) => i !== index) || [];
                          updateCondition('tiers', newTiers);
                          updateAction('tier_discounts', newDiscounts);
                        }}
                        title="Eliminar nivel"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              type="button" 
              className="btn btn-sm btn-success"
              onClick={() => {
                const newTiers = [...(conditions.tiers || []), { min_quantity: 1, max_quantity: null }];
                const newDiscounts = [...(actions.tier_discounts || []), { discount_type: 'percentage', discount_value: 5 }];
                updateCondition('tiers', newTiers);
                updateAction('tier_discounts', newDiscounts);
              }}
            >
              <i className="fa fa-plus mr-1"></i> Agregar nivel
            </button>
          </div>
        );

      default:
        return (
          <div className="alert alert-warning">
            <p className="mb-0">Seleccione un tipo de regla para configurar las condiciones.</p>
          </div>
        );
    }  };

  // Renderizar formulario de acciones según el tipo de regla
  const renderActionsForm = () => {
    switch (selectedRuleType) {
      case 'quantity_discount':
      case 'cart_discount':
      case 'category_discount':
        return (
          <>
            <SelectFormGroup
              eRef={discountTypeRef}
              label="Tipo de descuento"
              dropdownParent={"#conditions-actions-form"}
              required
              specification="Seleccione si el descuento es porcentaje o monto fijo"
            >
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Monto fijo (S/)</option>
            </SelectFormGroup>
            
            <InputFormGroup 
              eRef={discountValueRef}
              label="Valor del descuento"
              type="number"
              min="0"
              step={actions.discount_type === 'percentage' ? '1' : '0.01'}
              max={actions.discount_type === 'percentage' ? '100' : undefined}
              required
              prefix={actions.discount_type === 'fixed' ? 'S/ ' : ''}
              suffix={actions.discount_type === 'percentage' ? '%' : ''}
              specification={
                actions.discount_type === 'percentage' 
                  ? "Porcentaje de descuento (1-100%)" 
                  : "Monto fijo en soles"
              }
            />
            
            <InputFormGroup 
              eRef={maxDiscountRef}
              label="Descuento máximo (opcional)"
              type="number"
              min="0"
              step="0.01"
              prefix="S/ "
              specification="Límite máximo del descuento aplicado"
            />
          </>
        );

      case 'buy_x_get_y':
        return (
          <>
            <InputFormGroup 
              eRef={getQuantityRef}
              label="Cantidad gratis a obtener"
              type="number"
              min="1"
              required
              specification="Cuántos productos gratis obtendrá el cliente"
            />
              <SelectAPIFormGroup
              eRef={freeProductIdsRef}
              label="Productos gratis (opcional)"
              searchAPI="/api/admin/items/paginate"
              searchBy="name"
              dropdownParent="#conditions-actions-form"
              multiple
              tags
              specification="Si no selecciona, los productos gratis serán los mismos que debe comprar"
            />
          </>
        );

      case 'bundle_discount':
        return (
          <>
            <SelectFormGroup
              eRef={discountTypeRef}
              label="Tipo de descuento del bundle"
              required
              specification="Tipo de descuento para el conjunto de productos"
              dropdownParent={"#conditions-actions-form"}
            >
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Monto fijo (S/)</option>
            </SelectFormGroup>
            
            <InputFormGroup 
              eRef={discountValueRef}
              label="Valor del descuento"
              type="number"
              min="0"
              step={actions.discount_type === 'percentage' ? '1' : '0.01'}
              max={actions.discount_type === 'percentage' ? '100' : undefined}
              required
              prefix={actions.discount_type === 'fixed' ? 'S/ ' : ''}
              suffix={actions.discount_type === 'percentage' ? '%' : ''}
              specification="Descuento aplicado al conjunto completo de productos"
            />
          </>
        );

      case 'tiered_discount':
        return (
          <div className="alert alert-info">
            <p className="mb-0">
              <i className="fa fa-info-circle mr-1"></i>
              Los descuentos escalonados se configuran en la sección de condiciones arriba.
            </p>
          </div>
        );

      default:
        return (
          <div className="alert alert-warning">
            <p className="mb-0">Seleccione un tipo de regla para configurar las acciones.</p>
          </div>
        );
    }
  };
  // Generar vista previa de la regla
  const generateRulePreview = () => {
    if (!selectedRuleType) return 'Seleccione un tipo de regla';
    
    // Obtener valores actuales de los campos
    const currentFieldValues = getFieldValues();
    const currentConditions = { ...conditions, ...currentFieldValues.conditions };
    const currentActions = { ...actions, ...currentFieldValues.actions };
    
    const discountText = currentActions.discount_type === 'percentage' 
      ? `${currentActions.discount_value || 0}% de descuento`
      : currentActions.discount_type === 'fixed' 
        ? `S/ ${currentActions.discount_value || 0} de descuento`
        : `${currentActions.get_quantity || 1} producto(s) gratis`;
    
    switch (selectedRuleType) {
      case 'quantity_discount':
        const productText = currentConditions.product_ids?.length ? 
          `en productos seleccionados` : 
          `en cualquier producto`;
        const categoryText = currentConditions.category_ids?.length ? 
          ` de las categorías seleccionadas` : 
          ``;
        return `Al comprar ${currentConditions.min_quantity || 2} o más productos${categoryText}, obtén ${discountText} ${productText}`;
        
      case 'cart_discount':
        return `En compras desde S/ ${currentConditions.min_amount || 100}, obtén ${discountText}`;
        
      case 'buy_x_get_y':
        return `Compra ${currentConditions.buy_quantity || 2} productos de los seleccionados y lleva ${currentActions.get_quantity || 1} gratis`;
        
      case 'category_discount':
        const catNames = currentConditions.category_ids?.length ? 
          ` (categorías seleccionadas)` : 
          ` (debe seleccionar categorías)`;
        return `En productos de categorías${catNames}, obtén ${discountText}`;
        
      case 'bundle_discount':
        const bundleProducts = currentConditions.required_products?.length || 0;
        return `Al comprar ${bundleProducts} productos específicos juntos (${currentConditions.min_quantity_each || 1} de cada uno), obtén ${discountText}`;
        
      case 'tiered_discount':
        const tiers = currentConditions.tiers || [];
        if (tiers.length === 0) return 'Configurar niveles de descuento escalonado';
        const tierDescriptions = tiers.map((tier, index) => {
          const discount = currentActions.tier_discounts?.[index]?.discount_value || 0;
          const maxText = tier.max_quantity ? ` a ${tier.max_quantity}` : '+';
          return `${tier.min_quantity}${maxText} productos: ${discount}%`;
        }).join(' | ');        return `Descuentos escalonados: ${tierDescriptions}`;
        
      default:
        return 'Configuración por defecto aplicada';
    }
  };

  // Inicializar select2 cuando se abra el modal de condiciones
  useEffect(() => {
    const initializeSelect2 = () => {
      // Inicializar select2 después de que el modal se muestre
      $(conditionsModalRef.current).on('shown.bs.modal', function() {
        // Inicializar SelectAPIFormGroup components (que tienen atributo data-toggle="select2")
        $('[data-toggle="select2"]', this).each(function() {
          if (!$(this).hasClass('select2-hidden-accessible')) {
            $(this).select2({
              dropdownParent: $('#conditions-actions-form'),
              width: '100%',
              placeholder: $(this).attr('placeholder') || 'Seleccionar...',
              allowClear: true,
              ajax: $(this).data('ajax') ? {
                url: $(this).data('ajax'),
                dataType: 'json',
                delay: 250,
                data: function (params) {
                  return {
                    search: params.term,
                    page: params.page || 1
                  };
                },
                processResults: function (data, params) {
                  params.page = params.page || 1;
                  return {
                    results: data.data.map(item => ({
                      id: item.id,
                      text: item.name || item.title
                    })),
                    pagination: {
                      more: (params.page * 10) < data.total
                    }
                  };
                }
              } : undefined
            });
          }
        });
      });
      
      // Limpiar select2 cuando se cierre el modal
      $(conditionsModalRef.current).on('hidden.bs.modal', function() {
        $('[data-toggle="select2"]', this).each(function() {
          if ($(this).hasClass('select2-hidden-accessible')) {
            $(this).select2('destroy');
          }
        });
      });
    };

    if (conditionsModalRef.current) {
      initializeSelect2();
    }

    return () => {
      if (conditionsModalRef.current) {
        $(conditionsModalRef.current).off('shown.bs.modal hidden.bs.modal');
      }
    };
  }, []);
  // Validar configuración de la regla
  const validateRuleConfiguration = (conditionsData = null, actionsData = null) => {
    if (!selectedRuleType) {
      Swal.fire('Error', 'Debe seleccionar un tipo de regla', 'error');
      return false;
    }

    // Si no se pasan datos específicos, obtener los valores actuales de los campos
    if (!conditionsData || !actionsData) {
      const currentFieldValues = getFieldValues();
      conditionsData = { ...conditions, ...currentFieldValues.conditions };
      actionsData = { ...actions, ...currentFieldValues.actions };
    }

    switch (selectedRuleType) {
      case 'quantity_discount':
        if (!conditionsData.min_quantity || conditionsData.min_quantity < 1) {
          Swal.fire('Error', 'La cantidad mínima debe ser mayor a 0', 'error');
          return false;
        }
        break;
        
      case 'cart_discount':
        if (!conditionsData.min_amount || conditionsData.min_amount <= 0) {
          Swal.fire('Error', 'El monto mínimo debe ser mayor a 0', 'error');
          return false;
        }
        break;
        
      case 'buy_x_get_y':
        if (!conditionsData.buy_quantity || conditionsData.buy_quantity < 1) {
          Swal.fire('Error', 'La cantidad a comprar debe ser mayor a 0', 'error');
          return false;
        }
        if (!conditionsData.product_ids || conditionsData.product_ids.length === 0) {
          Swal.fire('Error', 'Debe seleccionar al menos un producto para la regla "Compra X lleva Y"', 'error');
          return false;
        }
        if (!actionsData.get_quantity || actionsData.get_quantity < 1) {
          Swal.fire('Error', 'La cantidad gratis debe ser mayor a 0', 'error');
          return false;
        }
        break;
        
      case 'category_discount':
        if (!conditionsData.category_ids || conditionsData.category_ids.length === 0) {
          Swal.fire('Error', 'Debe seleccionar al menos una categoría', 'error');
          return false;
        }
        break;
        
      case 'bundle_discount':
        if (!conditionsData.required_products || conditionsData.required_products.length < 2) {
          Swal.fire('Error', 'Debe seleccionar al menos 2 productos para el paquete', 'error');
          return false;
        }
        break;
        
      case 'tiered_discount':
        if (!conditionsData.tiers || conditionsData.tiers.length === 0) {
          Swal.fire('Error', 'Debe configurar al menos un nivel de descuento', 'error');
          return false;
        }
        // Validar que los niveles no se superpongan
        for (let i = 0; i < conditionsData.tiers.length - 1; i++) {
          const current = conditionsData.tiers[i];
          const next = conditionsData.tiers[i + 1];
          if (current.max_quantity && next.min_quantity <= current.max_quantity) {
            Swal.fire('Error', `Los niveles ${i + 1} y ${i + 2} se superponen. Revise las cantidades.`, 'error');
            return false;
          }
        }
        break;
    }

    // Validar acciones - solo para reglas que no sean tiered_discount ni buy_x_get_y
    if (selectedRuleType !== 'tiered_discount' && selectedRuleType !== 'buy_x_get_y') {
      if (!actionsData.discount_value || actionsData.discount_value <= 0) {
        Swal.fire('Error', 'El valor del descuento debe ser mayor a 0', 'error');
        return false;
      }
      
      if (actionsData.discount_type === 'percentage' && actionsData.discount_value > 100) {
        Swal.fire('Error', 'El porcentaje de descuento no puede ser mayor a 100%', 'error');
        return false;
      }
    }

    return true;
  };

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
                            const is_newValue = data.active === 1 || data.active === '1' || data.active === true;
                            ReactAppend(
                                container,
                                <SwitchFormGroup
                                    checked={is_newValue}
                                    onChange={(e) =>
                                        onBooleanChange({
                                            id: data.id,
                                            field: "active",
                                            value: e.target.checked ? 1 : 0,
                                        })
                                    }
                                />
                            );
                        },
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
            dropdownParent={"#discount-rule-form"}
            required 
           
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
          </button>          <small className="text-muted">
            Define cuándo se aplica la regla y qué descuento otorga
          </small>
        </div>
      </div>
    </Modal>
      {/* Modal para condiciones y acciones - Configurable */}
    <Modal modalRef={conditionsModalRef} title='Configurar Condiciones y Acciones' size='xl'
           onSubmit={(e) => {
             e.preventDefault();
             
             // Validar configuración con los valores actuales de los campos
             if (validateRuleConfiguration()) {
               // Si la validación pasa, actualizar los estados
               const fieldValues = getFieldValues();
               setConditions(prev => ({ ...prev, ...fieldValues.conditions }));
               setActions(prev => ({ ...prev, ...fieldValues.actions }));
               
               $(conditionsModalRef.current).modal('hide');
               Swal.fire({
                 icon: 'success',
                 title: '¡Configuración guardada!',
                 text: 'Las condiciones y acciones han sido configuradas correctamente.',
                 timer: 2000,
                 showConfirmButton: false
               });
             }
           }}>
      <div className="row" id='conditions-actions-form'>
        <div className="col-12">
          {selectedRuleType ? (
            <div>
              <div className="alert alert-info">
                <h5><i className="fa fa-info-circle mr-2"></i>Tipo de regla: {ruleTypes[selectedRuleType]?.name}</h5>
                <p>{ruleTypes[selectedRuleType]?.description}</p>
                <small><strong>Ejemplo:</strong> {ruleTypes[selectedRuleType]?.example}</small>
              </div>
              
              <div className="row">
                {/* CONDICIONES */}
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0"><i className="fa fa-filter mr-2"></i>Condiciones (¿Cuándo aplicar?)</h6>
                    </div>
                    <div className="card-body">
                      {renderConditionsForm()}
                    </div>
                  </div>
                </div>
                
                {/* ACCIONES */}
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0"><i className="fa fa-bolt mr-2"></i>Acciones (¿Qué descuento dar?)</h6>
                    </div>
                    <div className="card-body">
                      {renderActionsForm()}
                    </div>
                  </div>
                </div>
              </div>
                {/* Vista previa */}
              <div className="mt-3">
                <div className="alert alert-success">
                  <h6><i className="fa fa-eye mr-2"></i>Vista previa de la regla:</h6>
                  <p className="mb-2">{generateRulePreview()}</p>                  <button 
                    type="button" 
                    className="btn btn-sm btn-info"
                    onClick={() => {
                      if (validateRuleConfiguration()) {
                        Swal.fire({
                          icon: 'success',
                          title: '¡Configuración válida!',
                          text: 'La regla está configurada correctamente y lista para usar.',
                          timer: 2000,
                          showConfirmButton: false
                        });
                      }
                    }}
                  >
                    <i className="fa fa-check mr-1"></i> Probar configuración
                  </button></div>
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
