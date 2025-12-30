import React from 'react';
import { NumericFormat } from 'react-number-format';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  error?: string;
  helperText?: string;
  value?: number | string;
  onChange?: (value: number | undefined) => void;
  onBlur?: () => void;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ label, error, helperText, className = '', id, required, value, onChange, onBlur, ...props }, ref) => {
    const inputId = id || `currency-input-${Math.random().toString(36).slice(2, 11)}`;

    const handleValueChange = (values: { floatValue?: number }) => {
      if (onChange) {
        onChange(values.floatValue);
      }
    };

    const {
      defaultValue,
      defaultChecked,
      type,
      step,
      ...numericFormatProps
    } = props as any;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <NumericFormat
          getInputRef={ref}
          id={inputId}
          value={value || ''}
          onValueChange={handleValueChange}
          onBlur={onBlur}
          thousandSeparator="."
          decimalSeparator=","
          prefix="R$ "
          decimalScale={2}
          fixedDecimalScale
          allowNegative={false}
          className={`
            w-full px-3 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...numericFormatProps}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

