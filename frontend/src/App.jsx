import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { OfflineSyncProvider } from './contexts/OfflineSyncContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResponderDashboardPage from './pages/ResponderDashboardPage';
import TaskManagementPage from './pages/TaskManagementPage';
import MapDashboardPage from './pages/MapDashboardPage';
import ReportMissingPersonPage from './pages/ReportMissingPersonPage';
import CaseListPage from './pages/CaseListPage';
import CaseDetailPage from './pages/CaseDetailPage';
import AuthorityDashboardPage from './pages/AuthorityDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <OfflineSyncProvider>
          <div className="min-h-screen bg-slate-900 text-slate-200">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/responder/dashboard" element={<ProtectedRoute><ResponderDashboardPage /></ProtectedRoute>} />
              <Route path="/authority/tasks" element={<ProtectedRoute><TaskManagementPage /></ProtectedRoute>} />
              <Route path="/map" element={<ProtectedRoute><MapDashboardPage /></ProtectedRoute>} />
              <Route path="/report" element={<ProtectedRoute><ReportMissingPersonPage /></ProtectedRoute>} />
              <Route path="/cases" element={<ProtectedRoute><CaseListPage /></ProtectedRoute>} />
              <Route path="/cases/:id" element={<ProtectedRoute><CaseDetailPage /></ProtectedRoute>} />
              <Route path="/authority/dashboard" element={<ProtectedRoute><AuthorityDashboardPage /></ProtectedRoute>} />

              {/* Catch-all 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </OfflineSyncProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;
