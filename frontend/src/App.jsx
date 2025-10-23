import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import OnboardingWizard from './components/OnboardingWizard';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import DocumentsPage from './pages/DocumentsPage';
import ProgressPage from './pages/ProgressPage';
import Phase1Page from './pages/Phase1Page';
import AdminPage from './pages/AdminPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Add retro console message
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   C2PA GENERATOR PRODUCT CERTIFICATION ASSISTANT           ║
║                                                            ║
║   8-BIT ATARI STYLE AI ASSISTANT                          ║
║   READY PLAYER ONE                                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <AuthProvider>
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
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/phase1" element={<Phase1Page />} />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPage />
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

            <footer className="app-footer">
              <p>
                &copy; 2025 Sanmarcsoft LLC | C2PA Generator Product Certification
              </p>
              <p className="text-cyan">
                LEVEL UP YOUR CONTENT PROVENANCE GAME
              </p>
            </footer>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
