import PropTypes from 'prop-types';
import './Card.css';

/**
 * Themed Card Component
 *
 * Provides theme-aware card containers with consistent styling across all themes.
 * Supports interactive cards with hover effects and various padding options.
 *
 * @component
 * @example
 * <Card>
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </Card>
 *
 * <Card interactive onClick={handleClick} hover>
 *   <p>Clickable card</p>
 * </Card>
 */
const Card = ({
  children,
  interactive = false,
  hover = false,
  padding = 'medium',
  className = '',
  onClick,
  ...props
}) => {
  const classNames = [
    'themed-card',
    interactive && 'themed-card--interactive',
    hover && 'themed-card--hover',
    `themed-card--padding-${padding}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const Component = interactive || onClick ? 'button' : 'div';

  return (
    <Component
      className={classNames}
      onClick={onClick}
      type={Component === 'button' ? 'button' : undefined}
      {...props}
    >
      {children}
    </Component>
  );
};

Card.propTypes = {
  /** Card content */
  children: PropTypes.node.isRequired,
  /** Interactive/clickable card */
  interactive: PropTypes.bool,
  /** Show hover effects */
  hover: PropTypes.bool,
  /** Padding size */
  padding: PropTypes.oneOf(['none', 'small', 'medium', 'large']),
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Click handler (makes card interactive) */
  onClick: PropTypes.func,
};

/**
 * Card Header Component
 */
export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`themed-card__header ${className}`} {...props}>
      {children}
    </div>
  );
};

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Card Body Component
 */
export const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div className={`themed-card__body ${className}`} {...props}>
      {children}
    </div>
  );
};

CardBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Card Footer Component
 */
export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`themed-card__footer ${className}`} {...props}>
      {children}
    </div>
  );
};

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Card;
