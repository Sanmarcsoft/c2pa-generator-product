import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import './Input.css';

/**
 * Themed Input Component
 *
 * Provides theme-aware input fields with consistent styling across all themes.
 * Supports text, email, password, number, and textarea variants.
 *
 * @component
 * @example
 * <Input placeholder="Enter your name" />
 * <Input type="email" label="Email Address" required />
 * <Input as="textarea" rows={4} label="Description" />
 */
const Input = forwardRef(({
  type = 'text',
  as = 'input',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  success,
  disabled = false,
  required = false,
  fullWidth = true,
  className = '',
  helperText,
  rows = 3,
  ...props
}, ref) => {
  const inputClassNames = [
    'themed-input',
    error && 'themed-input--error',
    success && 'themed-input--success',
    disabled && 'themed-input--disabled',
    fullWidth && 'themed-input--full-width',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const InputElement = as;
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="themed-input-wrapper">
      {label && (
        <label htmlFor={inputId} className="themed-input__label">
          {label}
          {required && <span className="themed-input__required" aria-label="required">*</span>}
        </label>
      )}

      <InputElement
        ref={ref}
        id={inputId}
        type={as === 'input' ? type : undefined}
        className={inputClassNames}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        rows={as === 'textarea' ? rows : undefined}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={helperText ? `${inputId}-helper` : undefined}
        {...props}
      />

      {helperText && (
        <p
          id={`${inputId}-helper`}
          className={`themed-input__helper ${error ? 'themed-input__helper--error' : ''}`}
        >
          {helperText}
        </p>
      )}

      {error && typeof error === 'string' && (
        <p className="themed-input__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  /** Input type */
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'tel', 'url', 'search']),
  /** Render as input or textarea */
  as: PropTypes.oneOf(['input', 'textarea']),
  /** Input label */
  label: PropTypes.string,
  /** Placeholder text */
  placeholder: PropTypes.string,
  /** Input value */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Change handler */
  onChange: PropTypes.func,
  /** Blur handler */
  onBlur: PropTypes.func,
  /** Focus handler */
  onFocus: PropTypes.func,
  /** Error state or message */
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  /** Success state */
  success: PropTypes.bool,
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Required field */
  required: PropTypes.bool,
  /** Full width input */
  fullWidth: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Helper text below input */
  helperText: PropTypes.string,
  /** Number of rows for textarea */
  rows: PropTypes.number,
  /** Input ID */
  id: PropTypes.string,
};

export default Input;
