import PropTypes from 'prop-types';
import './Button.css';

/**
 * Themed Button Component
 *
 * Provides theme-aware button variants with consistent styling across all themes.
 * Supports primary, secondary, and ghost variants, as well as danger styling.
 *
 * @component
 * @example
 * <Button variant="primary" onClick={handleClick}>Click Me</Button>
 * <Button variant="secondary" size="small">Cancel</Button>
 * <Button variant="ghost" danger>Delete</Button>
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  danger = false,
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  const classNames = [
    'themed-button',
    `themed-button--${variant}`,
    `themed-button--${size}`,
    danger && 'themed-button--danger',
    disabled && 'themed-button--disabled',
    loading && 'themed-button--loading',
    fullWidth && 'themed-button--full-width',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="themed-button__spinner" role="status" aria-label="Loading">
          <svg
            className="themed-button__spinner-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="themed-button__spinner-track"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="themed-button__spinner-path"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
      <span className="themed-button__content">{children}</span>
    </button>
  );
};

Button.propTypes = {
  /** Button content */
  children: PropTypes.node.isRequired,
  /** Button variant style */
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  /** Button size */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /** Danger styling (for destructive actions) */
  danger: PropTypes.bool,
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Loading state with spinner */
  loading: PropTypes.bool,
  /** Full width button */
  fullWidth: PropTypes.bool,
  /** Button type attribute */
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  /** Click handler */
  onClick: PropTypes.func,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Button;
