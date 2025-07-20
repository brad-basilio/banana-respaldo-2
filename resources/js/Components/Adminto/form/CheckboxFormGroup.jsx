import Tippy from "@tippyjs/react";
import React from "react";

const CheckboxFormGroup = ({eRef, title, label, id, name, value, checked, required, rounded = false, style, className, onChange }) => {
  if (!id) id = `ck-${crypto.randomUUID()}`
  return (
    <Tippy content={title} arrow={true}>
      <div className={`form-check form-check-success ${className}`} style={{ ...style, cursor: 'pointer' }}>
        <input ref={eRef} className={`form-check-input ${rounded && 'rounded-circle'}`} type="checkbox" value={value} name={name} id={id} defaultChecked={checked} required={required} style={{ cursor: 'pointer' }} onChange={onChange} />
        <label className="form-check-label" htmlFor={id} style={{ cursor: 'pointer' }}>{label}</label>
      </div>
    </Tippy>
  );
};

export default CheckboxFormGroup;