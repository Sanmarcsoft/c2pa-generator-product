import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProduct } from '../contexts/ProductContext';
import './Header.css';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { products, selectProduct } = useProduct();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProgressDropdownOpen, setIsProgressDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const progressDropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDropdownNavigate = (path) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  const handleProgressProductSelect = (productId) => {
    selectProduct(productId);
    navigate('/progress');
    setIsProgressDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (progressDropdownRef.current && !progressDropdownRef.current.contains(event.target)) {
        setIsProgressDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="header-logo">
          <img
            src="/images/logos/trusteddit_logo_00.png"
            alt="Trusteddit - C2PA Certification Platform by SanMarcSoft LLC"
            className="logo-image"
          />
          <div className="logo-text-container">
            <h1 className="logo-text pulse">
              <span className="trusteddit-blue">TRUSTEDD</span><span className="trusteddit-orange">IT</span>
            </h1>
            <p className="logo-subtitle">C2PA CERTIFICATION PLATFORM</p>
          </div>
        </Link>

        <nav className="header-nav">
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            HOME
          </Link>
          {isAuthenticated && (
            <>
              {/* Conditional Progress Navigation */}
              {products.length <= 1 ? (
                <Link
                  to="/progress"
                  className={`nav-link ${isActive('/progress') ? 'active' : ''}`}
                >
                  PROGRESS
                </Link>
              ) : (
                <div className="progress-nav-dropdown" ref={progressDropdownRef}>
                  <button
                    className={`nav-link progress-dropdown-button ${isActive('/progress') ? 'active' : ''} ${isProgressDropdownOpen ? 'dropdown-open' : ''}`}
                    onClick={() => setIsProgressDropdownOpen(!isProgressDropdownOpen)}
                    aria-expanded={isProgressDropdownOpen}
                    aria-haspopup="true"
                  >
                    PROGRESS
                    <span className={`dropdown-arrow ${isProgressDropdownOpen ? 'open' : ''}`}>▼</span>
                  </button>

                  {isProgressDropdownOpen && (
                    <div className="progress-dropdown-menu">
                      {products.map(product => (
                        <button
                          key={product.id}
                          className="progress-dropdown-item"
                          onClick={() => handleProgressProductSelect(product.id)}
                        >
                          <span className="product-name">{product.name}</span>
                          <span className={`product-status ${product.status}`}>
                            {product.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Link
                to="/products"
                className={`nav-link ${isActive('/products') ? 'active' : ''}`}
              >
                C2PA PRODUCTS
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`}
                >
                  👑 ADMIN
                </Link>
              )}
            </>
          )}
          {isAuthenticated ? (
            <div className="user-menu" ref={dropdownRef}>
              <button
                className={`user-menu-button ${isDropdownOpen ? 'active' : ''}`}
                onClick={toggleDropdown}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                <span className="user-name">{user?.name || user?.email}</span>
                {user?.role === 'admin' && (
                  <span className="admin-badge">ADMIN</span>
                )}
                <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
              </button>

              {isDropdownOpen && (
                <div className="user-dropdown">
                  <button
                    className="dropdown-item"
                    onClick={() => handleDropdownNavigate('/profile')}
                  >
                    <span className="dropdown-icon">👤</span>
                    Profile
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => handleDropdownNavigate('/settings')}
                  >
                    <span className="dropdown-icon">⚙️</span>
                    Settings
                  </button>
                  <div className="dropdown-divider"></div>
                  <button
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <span className="dropdown-icon">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
              >
                LOGIN
              </Link>
              <Link
                to="/register"
                className={`nav-link nav-link-register ${isActive('/register') ? 'active' : ''}`}
              >
                REGISTER
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
