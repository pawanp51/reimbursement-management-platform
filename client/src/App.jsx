import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Unauthorized from './pages/Unauthorized';

// Dashboard Pages
import EmployeeDashboard from './pages/EmployeeDashboard';
import Dashboard from './pages/Dashboard';
import AdminDashboard2 from './pages/AdminDashboard2';

// Transaction Pages
import CreateTransaction from './pages/CreateTransaction';
import TransactionDetail from './pages/TransactionDetail';
import ApprovalsPage from './pages/ApprovalsPage';

// Styling
import './App.css';

function App() {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 text-center text-white shadow-2xl">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/15 border-t-sky-400"></div>
          <p className="text-sm text-slate-300">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" replace />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes - Employee */}
        <Route
          path="/employee-dashboard"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'CTO', 'DIRECTOR', 'ADMIN']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-transaction"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'CTO', 'DIRECTOR', 'ADMIN']}>
              <CreateTransaction />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-transaction/:id"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'CTO', 'DIRECTOR', 'ADMIN']}>
              <CreateTransaction />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Transaction Details */}
        <Route
          path="/transaction/:id"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'CTO', 'DIRECTOR', 'ADMIN']}>
              <TransactionDetail />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Approvals */}
        <Route
          path="/approvals"
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'CTO', 'DIRECTOR', 'ADMIN']}>
              <ApprovalsPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Dashboard (Manager/CTO/Director) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'CTO', 'DIRECTOR', 'ADMIN']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard2 />
            </ProtectedRoute>
          }
        />

        {/* Default Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              user?.role === 'ADMIN' ? (
                <Navigate to="/admin" replace />
              ) : ['MANAGER', 'CTO', 'DIRECTOR'].includes(user?.role) ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/employee-dashboard" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
