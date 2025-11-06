import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import OnboardingWizard from './components/OnboardingWizard';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import DocumentsPage from './pages/DocumentsPage';
import ProgressPage from './pages/ProgressPage';
import IntegratedProgressPage from './pages/IntegratedProgressPage';
import C2PAProductsPage from './pages/C2PAProductsPage';
import Phase1Page from './pages/Phase1Page';
import AdminPage from './pages/AdminPage';
import AdminGuidePage from './pages/AdminGuidePage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import ThemeShowcase from './pages/ThemeShowcase';
import './App.css';

// Import all theme CSS files
import './styles/themes/elegant.css';
import './styles/themes/retro.css';
import './styles/themes/modernMinimalist.css';
import './styles/themes/friendlyApproachable.css';
import './styles/themes/techSavvy.css';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Add console message
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   TRUSTEDDIT - C2PA CERTIFICATION PLATFORM                 ║
║                                                            ║
║   A SanMarcSoft LLC Product                                ║
║   Member of Content Authenticity Initiative                ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <AuthProvider>
      <ProductProvider>
        <ThemeProvider>
          <Router>
            <div className="App">
              {/* Onboarding wizard (shown only on first launch) */}
              {showOnboarding && <OnboardingWizard onComplete={handleOnboardingComplete} />}

              {/* Vector grid background */}
              <div className="vector-grid"></div>

              {/* Main content */}
              <div className="app-content">
                <Header />

              <main className="main-content">
                <Routes>
                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Main Routes */}
                  <Route path="/" element={<HomePage />} />

                  {/* NEW: Integrated Progress Page with product scoping */}
                  <Route path="/progress" element={
                    <ProtectedRoute>
                      <IntegratedProgressPage />
                    </ProtectedRoute>
                  } />

                  {/* NEW: C2PA Products Management */}
                  <Route path="/products" element={
                    <ProtectedRoute>
                      <C2PAProductsPage />
                    </ProtectedRoute>
                  } />

                  {/* Legacy routes - kept for backwards compatibility */}
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/documents" element={<DocumentsPage />} />
                  <Route path="/legacy-progress" element={<ProgressPage />} />
                  <Route path="/phase1" element={<Phase1Page />} />
                  <Route path="/theme-showcase" element={<ThemeShowcase />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/guide" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminGuidePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute requiredRole="admin">
                      <SettingsPage />
                    </ProtectedRoute>
                  } />

                  {/* User Profile Route */}
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>

                <Footer />
              </div>
            </div>
          </Router>
        </ThemeProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
