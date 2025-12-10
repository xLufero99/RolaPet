import React, { useState } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import { Navigation } from './components/Navigation';
import { LandingPage } from './components/LandingPage';
import { AuthPages } from './components/AuthPages';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { MapView } from './components/MapView';
import { Marketplace } from './components/Marketplace';
import { SocialView } from './components/SocialView';
import { UserProfile } from './components/UserProfile';
import { ReviewsView } from './components/ReviewsView';
import { AdminPanel } from './components/AdminPanel';
import { ProfileData } from './components/ProfileData';

// 🔹 Lee el usuario guardado en localStorage una sola vez
function getInitialAuthState() {
  try {
    const storedUser = localStorage.getItem('rolapet_user');
    if (!storedUser) {
      return {
        user: null,
        isAuthenticated: false,
        isAdmin: false,
      };
    }

    const parsed = JSON.parse(storedUser);

    const isAdmin =
      parsed?.email === 'admin@rolapet.com' || parsed?.role === 'admin';

    return {
      user: parsed,
      isAuthenticated: true,
      isAdmin,
    };
  } catch (e) {
    console.error('Error leyendo usuario de localStorage', e);
    return {
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    };
  }
}

export default function App() {
  // 👇 iniciamos el estado usando la función de arriba
  const [{ user, isAuthenticated, isAdmin }, setAuthState] = useState(
    () => getInitialAuthState()
  );

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ handleLogin que ya tenías, pero usando setAuthState
  const handleLogin = (userData) => {
    const admin =
      userData?.email === 'admin@rolapet.com' || userData?.role === 'admin';

    setAuthState({
      user: userData,
      isAuthenticated: true,
      isAdmin: admin,
    });

    localStorage.setItem('rolapet_user', JSON.stringify(userData));
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    });
    localStorage.removeItem('rolapet_user');
    navigate('/');
  };

  const showNav =
    (isAuthenticated ||
      location.pathname === '/login' ||
      location.pathname === '/register') &&
    location.pathname !== '/admin';

  const AdminDenied = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Acceso Denegado
        </h1>
        <p className="text-gray-600 mb-6">
          No tienes permisos para acceder al panel de administración.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Volver al Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {showNav && (
        <Navigation
          currentPath={location.pathname}
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          onLogout={handleLogout}
        />
      )}

      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route
            path="/login"
            element={<Login onLogin={handleLogin} />}
          />

          <Route
            path="/register"
            element={<AuthPages view="register" onLogin={handleLogin} />}
          />

          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Dashboard user={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/profileData"
            element={
              isAuthenticated ? (
                <ProfileData user={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/map"
            element={
              isAuthenticated ? <MapView /> : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/marketplace"
            element={
              isAuthenticated ? (
                <Marketplace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/social"
            element={
              isAuthenticated ? (
                <SocialView user={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/profile"
            element={
              isAuthenticated ? (
                <UserProfile user={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/reviews"
            element={
              isAuthenticated ? (
                <ReviewsView />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
  path="/admin"
  element={
    isAuthenticated && isAdmin ? (
      <AdminPanel />
    ) : (
      <Navigate to="/" replace />
    )
  }
/>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
