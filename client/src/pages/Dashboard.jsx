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

function MetricCard({ label, value, accent }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className={`h-2 w-16 rounded-full ${accent}`} />
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pendingResponse, historyResponse] = await Promise.all([
          transactionsAPI.getPendingApprovals(),
          transactionsAPI.getUserTransactionHistory(),
        ]);

        setPendingApprovals(pendingResponse.data?.transactions || []);
        setHistory(historyResponse.data?.transactions || []);
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalPendingValue = pendingApprovals.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
  const approvedCount = history.filter((item) => item.status === 'APPROVED').length;
  const rejectedCount = history.filter((item) => item.status === 'REJECTED').length;

  return (
    <div className="min-h-screen bg-slate-100">
      <Header
        title={`${user?.role} Approval Dashboard`}
        subtitle="Review the items waiting on you and monitor the decisions you have already influenced."
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Pending approvals" value={pendingApprovals.length} accent="bg-sky-400" />
          <MetricCard label="Pending value" value={formatCurrency(totalPendingValue, 'USD')} accent="bg-amber-400" />
          <MetricCard label="Approved in history" value={approvedCount} accent="bg-emerald-400" />
          <MetricCard label="Rejected in history" value={rejectedCount} accent="bg-rose-400" />
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Needs your attention</h2>
                <p className="mt-1 text-sm text-slate-600">Open reimbursement requests that are ready for your review.</p>
              </div>
              <button
                onClick={() => navigate('/approvals')}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Open Queue
              </button>
            </div>

            {loading ? (
              <div className="px-6 py-16 text-center text-sm text-slate-500">Loading pending approvals...</div>
            ) : pendingApprovals.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <h3 className="text-lg font-semibold text-slate-950">Nothing waiting right now</h3>
                <p className="mt-2 text-sm text-slate-600">Your approval queue is clear.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingApprovals.slice(0, 6).map((transaction) => (
                  <button
                    key={transaction.id}
                    onClick={() => navigate(`/transaction/${transaction.id}`)}
                    className="flex w-full flex-col gap-3 px-6 py-5 text-left transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-950">{transaction.description}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {transaction.user?.firstName} {transaction.user?.lastName} • {transaction.category}
                      </p>
                    </div>
                    <div className="text-sm text-slate-600 sm:text-right">
                      <p className="font-semibold text-slate-950">{formatCurrency(transaction.totalAmount, transaction.currency)}</p>
                      <p>{new Date(transaction.createdAt).toLocaleDateString()}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-xl font-semibold text-slate-950">Recent history</h2>
              <p className="mt-1 text-sm text-slate-600">Transactions you created, reviewed, or approved.</p>
            </div>

            {loading ? (
              <div className="px-6 py-16 text-center text-sm text-slate-500">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="px-6 py-16 text-center text-sm text-slate-600">No historical items found yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {history.slice(0, 7).map((transaction) => (
                  <button
                    key={transaction.id}
                    onClick={() => navigate(`/transaction/${transaction.id}`)}
                    className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left transition hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-medium text-slate-950">{transaction.description}</p>
                      <p className="mt-1 text-sm text-slate-600">{transaction.role.replaceAll('_', ' ')}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        transaction.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : transaction.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-700'
                            : transaction.status === 'WAITING_APPROVAL'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {transaction.status.replace('_', ' ')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
