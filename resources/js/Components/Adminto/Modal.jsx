import React, { useEffect, useRef } from 'react';

const Modal = ({ modalRef, title = 'Modal', isStatic = false, size = 'md', children, bodyClass = '', bodyStyle, btnCancelText, btnSubmitText, hideFooter, hideButtonSubmit, onSubmit = (e) => { e.preventDefault(); $(modalRef.current).modal('hide') }, onClose }) => {
  if (!modalRef) modalRef = useRef()
  const staticProp = isStatic ? { 'data-bs-backdrop': 'static' } : {}

  useEffect(() => {
    const handleClose = (...params) => {
      if (onClose) onClose(...params);
    };

    const modalElement = modalRef.current;
    $(modalElement).on('hidden.bs.modal', handleClose);

    return () => {
      $(modalElement).off('hidden.bs.modal', handleClose);
    };
  }, [modalRef, onClose]);

  useEffect(() => {
    $(modalRef.current).modal('hide')
  }, [null])

  return (<form className='modal fade' ref={modalRef} tabIndex='-1' aria-hidden='true' {...staticProp} onSubmit={onSubmit} autoComplete='off'>
    <div className={`modal-dialog modal-dialog-centered modal-${size ?? 'md'}`}>
      <div className='modal-content ' style={{ boxShadow: '0 0 10px rgba(0,0,0,0.25)' }}>
        <div className='modal-header'>
          <h4 className='modal-title'>{title}</h4>
          <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
        </div>
        <div className={`modal-body ${bodyClass ?? ''}`}  style={bodyStyle}>
          {children}
        </div>
        {
          !hideFooter && <div className='modal-footer'>
            <button className='btn btn-sm btn-danger pull-left' type='button'
              data-bs-dismiss='modal'>{btnCancelText ?? 'Cerrar'}</button>
            {!hideButtonSubmit && <button className='btn btn-sm btn-success pull-right' type='submit'>{btnSubmitText ?? 'Aceptar'}</button>}
          </div>
        }
      </div>
    </div>
  </form >
  )
}

export default Modal