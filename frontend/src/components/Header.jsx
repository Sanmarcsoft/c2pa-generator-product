import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-logo">
          <h1 className="logo-text pulse">
            C2PA GENERATOR
          </h1>
          <p className="logo-subtitle">CERTIFICATION ASSISTANT</p>
        </div>

        <nav className="header-nav">
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            HOME
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/chat"
                className={`nav-link ${isActive('/chat') ? 'active' : ''}`}
              >
                CHAT
              </Link>
              <Link
                to="/documents"
                className={`nav-link ${isActive('/documents') ? 'active' : ''}`}
              >
                DOCUMENTS
              </Link>
              <Link
                to="/progress"
                className={`nav-link ${isActive('/progress') ? 'active' : ''}`}
              >
                PROGRESS
              </Link>
              <Link
                to="/profile"
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              >
                👤 PROFILE
              </Link>
              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/settings"
                    className={`nav-link admin-link ${isActive('/settings') ? 'active' : ''}`}
                  >
                    ⚙️ SETTINGS
                  </Link>
                  <Link
                    to="/admin"
                    className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`}
                  >
                    👑 ADMIN
                  </Link>
                </>
              )}
            </>
          )}
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-name">{user?.name || user?.email}</span>
              {user?.role === 'admin' && (
                <span className="admin-badge">ADMIN</span>
              )}
              <button onClick={handleLogout} className="logout-button">
                LOGOUT
              </button>
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
