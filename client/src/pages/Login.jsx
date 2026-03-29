import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';

function getDestinationForRole(role) {
  if (role === 'ADMIN') return '/admin';
  if (['MANAGER', 'CTO', 'DIRECTOR'].includes(role)) return '/dashboard';
  return '/employee-dashboard';
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setForgotMessage('');

    try {
      setLoading(true);

      if (forgotMode) {
        await authAPI.forgotPassword(formData.email);
        setForgotMessage('If the email exists, an OTP reset flow has been started for that account.');
        return;
      }

      const user = await login(formData);
      navigate(location.state?.from || getDestinationForRole(user.role), { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Unable to continue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.28),_transparent_30%),linear-gradient(135deg,_#020617,_#0f172a_50%,_#1e293b)] px-4 py-10 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-8">
          <div className="inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-200">
            Expense approvals without the spreadsheet chaos
          </div>
          <div className="space-y-4">
            <h1 className="max-w-xl text-5xl font-semibold tracking-tight sm:text-6xl">
              Run reimbursements like an internal product, not a back-office chore.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Track requests, route approvals, and keep every team aligned from submission to payout with a cleaner,
              faster workflow.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Live status', 'Draft, waiting approval, approved, and rejected states stay visible in one place.'],
              ['Role-based routing', 'Employees, approvers, and admins each land in the right workspace.'],
              ['Backend-connected', 'Every view is wired to the current API instead of mock placeholders.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/95 p-8 text-slate-900 shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.28em] text-sky-700">
              {forgotMode ? 'Password recovery' : 'Welcome back'}
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              {forgotMode ? 'Start your reset flow' : 'Sign in to your account'}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {forgotMode
                ? 'Enter your work email and the backend will trigger the reset OTP flow.'
                : 'Use your organization credentials to open your reimbursement workspace.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
            ) : null}

            {forgotMessage ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {forgotMessage}
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Work Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                placeholder="name@company.com"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
            </div>

            {!forgotMode ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                />
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Please wait...' : forgotMode ? 'Start Reset Flow' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-600">
            <button
              type="button"
              onClick={() => {
                setForgotMode((current) => !current);
                setError('');
                setForgotMessage('');
              }}
              className="text-left font-medium text-sky-700 hover:text-sky-800"
            >
              {forgotMode ? 'Back to login' : 'Forgot password?'}
            </button>

            <p>
              Need administrator access?{' '}
              <Link to="/signup" className="font-semibold text-sky-700 hover:text-sky-800">
                Create the first admin account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
