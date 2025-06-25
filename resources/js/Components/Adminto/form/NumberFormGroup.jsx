import React from "react";

const NumberFormGroup = ({
  col,
  label,
  eRef,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  value,
  min,
  max,
  step,
  onChange = () => {},
  className = ""
}) => {
  return (
    <div className={`form-group ${col} mb-2`}>
      <label htmlFor="" className="mb-1 form-label">
        {label} {required && <b className="text-danger">*</b>}
      </label>
      <input
        ref={eRef}
        type="number"
        className={`form-control ${className}`}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        defaultValue={value}
        min={min}
        max={max}
        step={step || 'any'}
        onChange={onChange}
      />
    </div>
  );
};

export default NumberFormGroup;
