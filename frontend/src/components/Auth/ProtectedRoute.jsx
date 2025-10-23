import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

function ProtectedRoute({ children, adminOnly = false, requiredRole = null }) {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="protected-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">CHECKING CREDENTIALS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check for required role
  const needsAdmin = adminOnly || requiredRole === 'admin';

  if (needsAdmin && !isAdmin) {
    return (
      <div className="forbidden-page">
        <div className="forbidden-container">
          <h1 className="forbidden-code">403</h1>
          <h2 className="forbidden-title">ACCESS DENIED</h2>
          <p className="forbidden-text">
            You do not have permission to access this area.
          </p>
          <p className="forbidden-subtext">
            Admin privileges required.
          </p>
          <div className="forbidden-decoration">
            <pre className="ascii-art">
{`
  ╔═══════════════════╗
  ║   RESTRICTED      ║
  ║   AREA            ║
  ╚═══════════════════╝
`}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
