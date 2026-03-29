import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import { transactionsAPI } from '../services/api';

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(Number(amount || 0));
}

export default function ApprovalsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        setLoading(true);
        const response = await transactionsAPI.getPendingApprovals();
        setTransactions(response.data?.transactions || []);
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load the approval queue.');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingApprovals();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <Header
        title="Approval Queue"
        subtitle="Everything currently waiting on your review, prioritized and connected to the live backend workflow."
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div>
        ) : null}

        <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Pending your approval</h2>
              <p className="mt-1 text-sm text-slate-600">
                {transactions.length} request{transactions.length === 1 ? '' : 's'} currently assigned to you.
              </p>
            </div>
            {user?.role === 'CTO' ? (
              <span className="rounded-full bg-sky-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                CTO approvals auto-complete the chain
              </span>
            ) : null}
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center text-sm text-slate-500">Loading approval queue...</div>
          ) : transactions.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <h3 className="text-lg font-semibold text-slate-950">Queue is clear</h3>
              <p className="mt-2 text-sm text-slate-600">No transactions are waiting for your action right now.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs uppercase tracking-[0.22em] text-slate-500">
                    <th className="px-6 py-4">Requester</th>
                    <th className="px-6 py-4">Request</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Stage</th>
                    <th className="px-6 py-4">Submitted</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {transaction.user?.firstName} {transaction.user?.lastName}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">{transaction.user?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{transaction.description}</p>
                        <p className="mt-1 text-sm text-slate-500">{transaction.category}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-950">
                        {formatCurrency(transaction.totalAmount, transaction.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                          {transaction.mySequenceOrder ? `Step ${transaction.mySequenceOrder}` : 'Immediate'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/transaction/${transaction.id}`)}
                          className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
