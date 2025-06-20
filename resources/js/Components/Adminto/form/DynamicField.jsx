import React, { useState, useEffect } from 'react';

const DynamicField = ({ label, structure, value = [], onChange, typeOptions = [] }) => {
    const [fields, setFields] = useState([]);
    const isObjectStructure = typeof structure === 'object' && !Array.isArray(structure);

    // Sincronización con el valor inicial
    useEffect(() => {
        if (isObjectStructure) {
            // Para especificaciones (objetos)
            setFields(value.map(item => ({
                ...item,
                type: item.type?.charAt(0).toUpperCase() + item.type?.slice(1).toLowerCase(),
            })));
        } else {
            // Para características (strings o objetos)
            setFields(value.map(item => {
                if (typeof item === 'object') {
                    return item.feature || '';
                }
                return item;
            }));
        }
    }, [value]);

    const handleAdd = () => {
        const newItem = isObjectStructure ? { ...structure} : '';
        const newFields = [...fields, newItem];
        setFields(newFields);
        onChange(newFields);
    };

    const handleRemove = (index) => {
        const newFields = fields.filter((_, i) => i !== index);
        setFields(newFields);
        onChange(newFields);
    };

    const handleFieldChange = (index, key, value) => {
        const newFields = [...fields];
        
        if (isObjectStructure) {
            newFields[index][key] = key === 'type' 
                ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
                : value;
        } else {
            newFields[index] = value;
        }
        
        setFields(newFields);
        onChange(newFields);
    };

    const getPlaceholder = (key, fieldType) => {
        if (key === 'title' && fieldType === 'Icono') {
            return 'Url de icono';
        }
        return key; 
    };

    return (
        <div className="mb-3">
            <label className="form-label">{label}</label>

            {fields.map((field, index) => (
                <div key={index} className="row g-2 mb-2">
                    {isObjectStructure ? (
                        <>
                            {Object.keys(structure).map(key => (
                                <div key={key} className="col">
                                    {key === 'type' ? (
                                        <select
                                            className="form-select"
                                            value={field[key] || ''}
                                            onChange={(e) => handleFieldChange(index, key, e.target.value)}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {typeOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={field[key] || ''}
                                            onChange={(e) => handleFieldChange(index, key, e.target.value)}
                                            placeholder={getPlaceholder(key, field.type)}
                                        />
                                    )}
                                </div>
                            ))}
                            <div className="col-auto">
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => handleRemove(index)}
                                >
                                    X
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="col">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={field}
                                    onChange={(e) => handleFieldChange(index, null, e.target.value)}
                                    placeholder="Característica"
                                />
                            </div>
                            <div className="col-auto">
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => handleRemove(index)}
                                >
                                    X
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}

            <button type="button" className="btn btn-primary mt-2" onClick={handleAdd}>
                + Agregar
            </button>
        </div>
    );
};

export default DynamicField;

