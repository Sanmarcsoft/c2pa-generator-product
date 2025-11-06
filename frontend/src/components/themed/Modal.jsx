import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './Modal.css';

/**
 * Themed Modal Component
 *
 * Accessible modal/dialog component with theme-aware styling.
 * Supports custom header, footer, and multiple size variants.
 *
 * @component
 * @example
 * <Modal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Confirm Action"
 *   footer={
 *     <>
 *       <Button variant="secondary" onClick={handleClose}>Cancel</Button>
 *       <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
 *     </>
 *   }
 * >
 *   <p>Are you sure you want to proceed?</p>
 * </Modal>
 */
const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  footer,
  size = 'medium',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  ...props
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Save the previously focused element
      previousActiveElement.current = document.activeElement;

      // Focus the modal
      modalRef.current?.focus();

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus
      previousActiveElement.current?.focus();

      // Restore body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (event) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab);
    return () => modal.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  const handleOverlayClick = (event) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  const classNames = [
    'themed-modal__content',
    `themed-modal__content--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className="themed-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      onClick={handleOverlayClick}
    >
      <div className="themed-modal__overlay" aria-hidden="true" />

      <div
        ref={modalRef}
        className={classNames}
        tabIndex={-1}
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="themed-modal__header">
            {title && (
              <h2 id="modal-title" className="themed-modal__title">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                className="themed-modal__close-btn"
                onClick={onClose}
                aria-label="Close modal"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="themed-modal__body">{children}</div>

        {/* Footer */}
        {footer && <div className="themed-modal__footer">{footer}</div>}
      </div>
    </div>
  );
};

Modal.propTypes = {
  /** Whether the modal is open */
  isOpen: PropTypes.bool.isRequired,
  /** Function to call when modal should close */
  onClose: PropTypes.func.isRequired,
  /** Modal title */
  title: PropTypes.string,
  /** Modal content */
  children: PropTypes.node.isRequired,
  /** Modal footer content (typically buttons) */
  footer: PropTypes.node,
  /** Modal size */
  size: PropTypes.oneOf(['small', 'medium', 'large', 'full']),
  /** Close modal when clicking overlay */
  closeOnOverlayClick: PropTypes.bool,
  /** Close modal when pressing Escape */
  closeOnEscape: PropTypes.bool,
  /** Show close button in header */
  showCloseButton: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Modal;
