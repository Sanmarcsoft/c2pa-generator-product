import PropTypes from 'prop-types';
import './Badge.css';

/**
 * Themed Badge Component
 *
 * Provides theme-aware badges with consistent styling across all themes.
 * Supports different variants for status indication and labeling.
 *
 * @component
 * @example
 * <Badge>Default</Badge>
 * <Badge variant="success">Certified</Badge>
 * <Badge variant="warning">Pending</Badge>
 * <Badge variant="error">Failed</Badge>
 */
const Badge = ({
  children,
  variant = 'default',
  size = 'medium',
  dot = false,
  className = '',
  ...props
}) => {
  const classNames = [
    'themed-badge',
    `themed-badge--${variant}`,
    `themed-badge--${size}`,
    dot && 'themed-badge--dot',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames} {...props}>
      {dot && <span className="themed-badge__dot" aria-hidden="true" />}
      <span className="themed-badge__content">{children}</span>
    </span>
  );
};

Badge.propTypes = {
  /** Badge content */
  children: PropTypes.node.isRequired,
  /** Badge variant */
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'error', 'info']),
  /** Badge size */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /** Show status dot */
  dot: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Badge;
