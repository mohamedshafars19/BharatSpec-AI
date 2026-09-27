import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UIProvider } from './context/UIContext';

// Layout Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { TopNavigation } from './components/TopNavigation';
import { GlobalSearchModal } from './components/GlobalSearchModal';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { Analyze } from './pages/Analyze';
import { Standards } from './pages/Standards';
import { StandardDetail } from './pages/StandardDetail';
import { Saved } from './pages/Saved';
import { History } from './pages/History';
import { Reports } from './pages/Reports';
import { About } from './pages/About';

// Authenticated Workspace Layout with Full-Width Top Navigation
const WorkspaceLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F2EB] text-[#20241F] w-full">
      {/* Full-width Top Navigation Bar */}
      <TopNavigation />

      {/* Main Full-Width Content Area */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <Footer />

      {/* Global Command Search (Ctrl + K) */}
      <GlobalSearchModal />
    </div>
  );
};

// Public Layout for Landing and Auth Pages
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F2EB] text-[#20241F]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <UIProvider>
        <Router>
          <Routes>
            {/* Public Pages */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* Authenticated Workspace Pages */}
            <Route element={<WorkspaceLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/analyze" element={<Analyze />} />
              <Route path="/standards" element={<Standards />} />
              <Route path="/standards/:id" element={<StandardDetail />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/history" element={<History />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/about" element={<About />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </UIProvider>
    </AuthProvider>
  );
};

export default App;
