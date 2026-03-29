import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navigationByRole = {
  ADMIN: [
    { label: 'Overview', to: '/admin' },
    { label: 'Approvals', to: '/approvals' },
  ],
  MANAGER: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Approvals', to: '/approvals' },
    { label: 'My Expenses', to: '/employee-dashboard' },
  ],
  CTO: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Approvals', to: '/approvals' },
    { label: 'My Expenses', to: '/employee-dashboard' },
  ],
  DIRECTOR: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Approvals', to: '/approvals' },
    { label: 'My Expenses', to: '/employee-dashboard' },
  ],
  EMPLOYEE: [
    { label: 'My Expenses', to: '/employee-dashboard' },
    { label: 'New Request', to: '/create-transaction' },
  ],
};

export default function Header({ title, subtitle, actions }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const navigationItems = navigationByRole[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-white/60 bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.28)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-sky-300">Reimbursement Command Center</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              {subtitle || `Signed in as ${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {actions}
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
              <p className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-white/15 bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-sky-400 text-slate-950'
                    : 'bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
