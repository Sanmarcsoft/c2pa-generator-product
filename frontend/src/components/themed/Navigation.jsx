import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Navigation.css';

/**
 * Themed Navigation Component
 *
 * Responsive navigation bar with mobile hamburger menu support.
 * Theme-aware with consistent styling across all themes.
 *
 * @component
 * @example
 * <Navigation
 *   logo="C2PA Generator"
 *   items={[
 *     { label: 'Home', href: '/', active: true },
 *     { label: 'Chat', href: '/chat' },
 *   ]}
 *   actions={<Button>Login</Button>}
 * />
 */
const Navigation = ({
  logo,
  logoHref = '/',
  tagline,
  items = [],
  actions,
  mobileBreakpoint = 768,
  className = '',
  onNavigate,
  ...props
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);

  useEffect(() => {
    // Close mobile menu when switching to desktop
    if (!isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile, isMobileMenuOpen]);

  useEffect(() => {
    // Prevent body scroll when mobile menu is open
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleItemClick = (item, event) => {
    if (onNavigate) {
      event.preventDefault();
      onNavigate(item);
    }
    setIsMobileMenuOpen(false);
  };

  const classNames = [
    'themed-navigation',
    isMobileMenuOpen && 'themed-navigation--mobile-open',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <nav className={classNames} {...props}>
      <div className="themed-navigation__container">
        {/* Logo and Branding */}
        <div className="themed-navigation__brand">
          {isMobile && (
            <button
              type="button"
              className="themed-navigation__hamburger"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <span className="themed-navigation__hamburger-line"></span>
              <span className="themed-navigation__hamburger-line"></span>
              <span className="themed-navigation__hamburger-line"></span>
            </button>
          )}

          <a
            href={logoHref}
            className="themed-navigation__logo"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate({ href: logoHref });
              }
            }}
          >
            <div className="themed-navigation__logo-text">{logo}</div>
            {tagline && <div className="themed-navigation__tagline">{tagline}</div>}
          </a>
        </div>

        {/* Navigation Items */}
        <div className="themed-navigation__menu">
          <ul className="themed-navigation__items">
            {items.map((item, index) => (
              <li
                key={index}
                className={`themed-navigation__item ${
                  item.active ? 'themed-navigation__item--active' : ''
                }`}
              >
                <a
                  href={item.href}
                  className="themed-navigation__link"
                  onClick={(e) => handleItemClick(item, e)}
                  aria-current={item.active ? 'page' : undefined}
                >
                  {item.icon && (
                    <span className="themed-navigation__link-icon">{item.icon}</span>
                  )}
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Actions (e.g., Login/Profile buttons) */}
          {actions && (
            <div className="themed-navigation__actions">{actions}</div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="themed-navigation__overlay"
            onClick={toggleMobileMenu}
            aria-hidden="true"
          />
          <div className="themed-navigation__mobile-drawer">
            <ul className="themed-navigation__mobile-items">
              {items.map((item, index) => (
                <li
                  key={index}
                  className={`themed-navigation__mobile-item ${
                    item.active ? 'themed-navigation__mobile-item--active' : ''
                  }`}
                >
                  <a
                    href={item.href}
                    className="themed-navigation__mobile-link"
                    onClick={(e) => handleItemClick(item, e)}
                    aria-current={item.active ? 'page' : undefined}
                  >
                    {item.icon && (
                      <span className="themed-navigation__mobile-link-icon">
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            {actions && (
              <div className="themed-navigation__mobile-actions">{actions}</div>
            )}
          </div>
        </>
      )}
    </nav>
  );
};

Navigation.propTypes = {
  /** Logo text or component */
  logo: PropTypes.node.isRequired,
  /** Logo link href */
  logoHref: PropTypes.string,
  /** Optional tagline below logo */
  tagline: PropTypes.string,
  /** Navigation items array */
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
      icon: PropTypes.node,
      active: PropTypes.bool,
    })
  ),
  /** Action buttons (e.g., login, profile) */
  actions: PropTypes.node,
  /** Breakpoint for mobile menu (px) */
  mobileBreakpoint: PropTypes.number,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Navigation handler (intercepts clicks) */
  onNavigate: PropTypes.func,
};

export default Navigation;
