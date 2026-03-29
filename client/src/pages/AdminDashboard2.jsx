import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { transactionsAPI, usersAPI } from '../services/api';

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(Number(amount || 0));
}

function OverviewCard({ label, value, detail }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{detail}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'EMPLOYEE',
    managerId: '',
    country: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [transactionsResponse, usersResponse] = await Promise.all([
          transactionsAPI.getAllTransactions(),
          usersAPI.getAllUsers(),
        ]);

        setTransactions(transactionsResponse.data?.transactions || []);
        setUsers(usersResponse.data || []);
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load admin data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSubmitting(true);

      await usersAPI.addUser({
        email: newUserData.email,
        name: `${newUserData.firstName} ${newUserData.lastName}`.trim(),
        role: newUserData.role,
        managerId: newUserData.managerId || undefined,
        country: newUserData.country,
      });

      const usersResponse = await usersAPI.getAllUsers();
      setUsers(usersResponse.data || []);
      setSuccess('User created successfully. A password email should be sent by the backend.');
      setNewUserData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'EMPLOYEE',
        managerId: '',
        country: '',
      });
    } catch (submitError) {
      setError(submitError.message || 'Unable to create the user.');
    } finally {
      setSubmitting(false);
    }
  };

  const draftCount = transactions.filter((item) => item.status === 'DRAFT').length;
  const pendingCount = transactions.filter((item) => item.status === 'WAITING_APPROVAL').length;
  const totalValue = transactions.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
  const managerOptions = users.filter((item) => ['MANAGER', 'DIRECTOR', 'CTO'].includes(item.role));

  return (
    <div className="min-h-screen bg-slate-100">
      <Header
        title="Admin Operations"
        subtitle="Monitor platform activity, provision new users, and keep the reimbursement workflow healthy."
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div>
        ) : null}

        {success ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">{success}</div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <OverviewCard label="Total users" value={users.length} detail="All active accounts currently available in the workspace." />
          <OverviewCard label="Draft transactions" value={draftCount} detail="Requests still being prepared by employees." />
          <OverviewCard label="Waiting approval" value={pendingCount} detail="Live items still moving through approval rules." />
          <OverviewCard label="Tracked value" value={formatCurrency(totalValue, 'USD')} detail="Total amount across all stored transactions." />
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-950">Create a new user</h2>
              <p className="mt-1 text-sm text-slate-600">This form maps to the backend admin-only user creation endpoint.</p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  required
                  placeholder="First name"
                  value={newUserData.firstName}
                  onChange={(event) => setNewUserData((current) => ({ ...current, firstName: event.target.value }))}
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={newUserData.lastName}
                  onChange={(event) => setNewUserData((current) => ({ ...current, lastName: event.target.value }))}
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={newUserData.email}
                  onChange={(event) => setNewUserData((current) => ({ ...current, email: event.target.value }))}
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={newUserData.country}
                  onChange={(event) => setNewUserData((current) => ({ ...current, country: event.target.value }))}
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <select
                  value={newUserData.role}
                  onChange={(event) => setNewUserData((current) => ({ ...current, role: event.target.value }))}
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                >
                  {['EMPLOYEE', 'MANAGER', 'DIRECTOR', 'CTO', 'ADMIN'].map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>

                <select
                  value={newUserData.managerId}
                  onChange={(event) => setNewUserData((current) => ({ ...current, managerId: event.target.value }))}
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                >
                  <option value="">No manager assigned</option>
                  {managerOptions.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.firstName} {manager.lastName} ({manager.role})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Creating user...' : 'Create User'}
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-xl font-semibold text-slate-950">Users</h2>
                <p className="mt-1 text-sm text-slate-600">Current workspace members and role assignments.</p>
              </div>

              {loading ? (
                <div className="px-6 py-16 text-center text-sm text-slate-500">Loading users...</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {users.map((workspaceUser) => (
                    <div key={workspaceUser.id} className="flex items-center justify-between gap-4 px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-950">
                          {workspaceUser.firstName} {workspaceUser.lastName}
                        </p>
                        <p className="text-sm text-slate-600">{workspaceUser.email}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {workspaceUser.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-xl font-semibold text-slate-950">Latest transactions</h2>
                <p className="mt-1 text-sm text-slate-600">Recent activity pulled from the admin transaction endpoint.</p>
              </div>

              {loading ? (
                <div className="px-6 py-16 text-center text-sm text-slate-500">Loading transactions...</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {transactions.slice(0, 8).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between gap-4 px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-950">{transaction.description}</p>
                        <p className="text-sm text-slate-600">
                          {transaction.user?.firstName} {transaction.user?.lastName} • {transaction.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-950">
                          {formatCurrency(transaction.totalAmount, transaction.currency)}
                        </p>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{transaction.status.replace('_', ' ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
