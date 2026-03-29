import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function getDestinationForRole(role) {
  if (role === 'ADMIN') return '/admin';
  if (['MANAGER', 'CTO', 'DIRECTOR'].includes(role)) return '/dashboard';
  return '/employee-dashboard';
}

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);

      const user = await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        country: formData.country,
        password: formData.password,
      });

      navigate(getDestinationForRole(user.role), { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Unable to create the account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(145deg,_#f8fafc,_#e2e8f0_42%,_#dbeafe)] px-4 py-10">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] bg-slate-950 p-10 text-white shadow-[0_30px_90px_rgba(15,23,42,0.45)]">
          <p className="text-sm uppercase tracking-[0.28em] text-sky-300">Administrator setup</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Create the first control plane for your team.</h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            New signups are provisioned as administrators by the backend, so this screen is best used for the initial
            workspace owner who will then invite the rest of the organization.
          </p>

          <div className="mt-8 grid gap-4">
            {[
              'Configure approval chains and reporting structure from one place.',
              'Invite managers and employees after the admin workspace is live.',
              'Keep reimbursement records connected to the backend from day one.',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(148,163,184,0.25)]">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.28em] text-sky-700">Create Account</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Launch your admin workspace</h2>
            <p className="mt-2 text-sm text-slate-600">Use a secure work email so the backend can create your admin user.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
            ) : null}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(event) => setFormData((current) => ({ ...current, firstName: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(event) => setFormData((current) => ({ ...current, lastName: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Work Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(event) => setFormData((current) => ({ ...current, country: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.confirmPassword}
                  onChange={(event) => setFormData((current) => ({ ...current, confirmPassword: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating workspace...' : 'Create Admin Account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            Already have access?{' '}
            <Link to="/login" className="font-semibold text-sky-700 hover:text-sky-800">
              Return to login
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
