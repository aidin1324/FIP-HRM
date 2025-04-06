import React, { useState, useEffect } from 'react';

function MetadataForm({ fields, initialValues = {}, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Очистка ошибки при изменении
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} обязательно для заполнения`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col">
            <label htmlFor={field.name} className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                className={`mt-1 block w-full py-2 px-3 border ${
                  errors[field.name] ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 text-sm`}
              >
                <option value="" disabled>Выберите {field.label.toLowerCase()}</option>
                {field.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type || 'text'}
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                placeholder={`Введите ${field.label.toLowerCase()}`}
                className={`mt-1 block w-full py-2 px-3 border ${
                  errors[field.name] ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 text-sm`}
              />
            )}
            
            {errors[field.name] && (
              <p className="mt-1 text-xs text-red-500">{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
        >
          Отмена
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-500 hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
        >
          Сохранить
        </button>
      </div>
    </form>
  );
}

export default MetadataForm;