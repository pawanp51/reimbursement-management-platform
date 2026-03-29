import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 text-center text-white shadow-2xl backdrop-blur">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-sky-400" />
        <p className="mt-4 text-sm text-slate-300">Loading your workspace...</p>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
