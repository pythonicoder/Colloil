import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./i18n/LanguageContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./components/ToastProvider";
import BottomNav from "./components/BottomNav";

// Pages
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import DiscountPage from "./pages/DiscountPage";
import MapPage from "./pages/MapPage";
import ProfilePage from "./pages/ProfilePage";
import BiodieselPage from "./pages/BiodieselPage";
import GlycerinPage from "./pages/GlycerinPage";
import HowtoUsePage from "./pages/HowtoUsePage";
import AboutPage from "./pages/AboutPage";
import CommunityPage from "./pages/CommunityPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

// Auth Route - redirect if already authenticated
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Layout with Bottom Navigation
const AppLayout = ({ children }) => {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* AUTH */}
      <Route 
        path="/auth" 
        element={
          <AuthRoute>
            <AuthPage />
          </AuthRoute>
        } 
      />

      {/* HOME */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <HomePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* INFO PAGES */}
      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AboutPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/biodiesel"
        element={
          <ProtectedRoute>
            <AppLayout>
              <BiodieselPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/glycerin"
        element={
          <ProtectedRoute>
            <AppLayout>
              <GlycerinPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CommunityPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/how-it-works"
        element={
          <ProtectedRoute>
            <AppLayout>
              <HowtoUsePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* OTHER APP PAGES */}
      <Route
        path="/discount"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DiscountPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/map"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MapPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <div className="App font-dm-sans">
              <AppRoutes />
            </div>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
