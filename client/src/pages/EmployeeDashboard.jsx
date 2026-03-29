import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import { transactionsAPI } from '../services/api';

const statusClasses = {
  DRAFT: 'bg-slate-100 text-slate-700',
  WAITING_APPROVAL: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-700',
};

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(Number(amount || 0));
}

function SummaryCard({ label, value, tone }) {
  return (
    <div className={`rounded-[1.75rem] border p-6 shadow-sm ${tone}`}>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await transactionsAPI.getUserTransactions();
        setTransactions(response.data?.transactions || []);
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load transactions.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleSubmit = async (transactionId) => {
    try {
      setSubmittingId(transactionId);
      setError('');
      await transactionsAPI.submitTransaction(transactionId);
      const response = await transactionsAPI.getUserTransactions();
      setTransactions(response.data?.transactions || []);
    } catch (submitError) {
      setError(submitError.message || 'Unable to submit this transaction.');
    } finally {
      setSubmittingId('');
    }
  };

  const summary = transactions.reduce(
    (accumulator, transaction) => {
      accumulator.total += Number(transaction.totalAmount || 0);
      accumulator[transaction.status] = (accumulator[transaction.status] || 0) + 1;
      return accumulator;
    },
    { total: 0, DRAFT: 0, WAITING_APPROVAL: 0, APPROVED: 0, REJECTED: 0 }
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <Header
        title="My Reimbursement Requests"
        subtitle="Create, edit, and submit expenses with a clear view of where every request stands."
        actions={
          <button
            onClick={() => navigate('/create-transaction')}
            className="rounded-xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
          >
            New Request
          </button>
        }
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Total Submitted Value" value={formatCurrency(summary.total, 'USD')} tone="border-slate-200 bg-white" />
          <SummaryCard label="Draft Requests" value={summary.DRAFT} tone="border-slate-200 bg-white" />
          <SummaryCard label="Awaiting Approval" value={summary.WAITING_APPROVAL} tone="border-amber-200 bg-amber-50" />
          <SummaryCard label="Approved Requests" value={summary.APPROVED} tone="border-emerald-200 bg-emerald-50" />
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Recent activity</h2>
              <p className="mt-1 text-sm text-slate-600">Your latest expenses, drafts, and approval outcomes.</p>
            </div>
            <Link to="/create-transaction" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
              Create another request
            </Link>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center text-sm text-slate-500">Loading your transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <h3 className="text-lg font-semibold text-slate-950">No expenses yet</h3>
              <p className="mt-2 text-sm text-slate-600">Start with your first reimbursement request and we will track it from draft to decision.</p>
              <button
                onClick={() => navigate('/create-transaction')}
                className="mt-6 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Create Request
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs uppercase tracking-[0.22em] text-slate-500">
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Expense Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{transaction.description}</p>
                        <p className="mt-1 text-sm text-slate-500">{transaction.remarks || 'No remarks added'}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{transaction.category}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-950">
                        {formatCurrency(transaction.totalAmount, transaction.currency)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {new Date(transaction.expenseDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[transaction.status] || statusClasses.DRAFT}`}>
                          {transaction.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => navigate(`/transaction/${transaction.id}`)}
                            className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            View
                          </button>
                          {transaction.status === 'DRAFT' ? (
                            <>
                              <button
                                onClick={() => navigate(`/edit-transaction/${transaction.id}`)}
                                className="rounded-full border border-sky-200 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-50"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleSubmit(transaction.id)}
                                disabled={submittingId === transaction.id}
                                className="rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {submittingId === transaction.id ? 'Submitting...' : 'Submit'}
                              </button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-gradient-to-r from-sky-50 to-cyan-50 px-6 py-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">Workflow note</p>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700">
            Draft requests can still be edited. Once submitted, the backend creates approval records based on your configured rules and managers can review them from their dashboard.
          </p>
          <p className="mt-3 text-sm text-slate-600">Current signed-in user: {user?.firstName} {user?.lastName}</p>
        </section>
      </main>
    </div>
  );
}
