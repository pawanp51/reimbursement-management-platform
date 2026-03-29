import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import { transactionsAPI } from '../services/api';

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(Number(amount || 0));
}

const statusStyles = {
  DRAFT: 'bg-slate-100 text-slate-700',
  WAITING_APPROVAL: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-700',
};

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingApproval, setProcessingApproval] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        const response = await transactionsAPI.getTransactionById(id);
        setTransaction(response.data?.transaction || null);
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load transaction details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  const refreshTransaction = async () => {
    const response = await transactionsAPI.getTransactionById(id);
    setTransaction(response.data?.transaction || null);
  };

  const handleApproval = async (action) => {
    if (action === 'reject' && !approvalComment.trim()) {
      setError('Rejection remarks are required by the backend.');
      return;
    }

    try {
      setProcessingApproval(true);
      setError('');

      if (action === 'approve') {
        await transactionsAPI.approveTransaction(id, approvalComment.trim());
      } else {
        await transactionsAPI.rejectTransaction(id, approvalComment.trim());
      }

      await refreshTransaction();
      setApprovalComment('');
    } catch (approvalError) {
      setError(approvalError.message || 'Unable to process this approval action.');
    } finally {
      setProcessingApproval(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Header title="Transaction details" subtitle="Loading transaction data..." />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Header title="Transaction not found" subtitle="The requested reimbursement could not be loaded." />
      </div>
    );
  }

  const isApprover = transaction.approvals?.some((approval) => approval.approverId === user?.id);
  const canApprove = isApprover && transaction.status === 'WAITING_APPROVAL';
  const isOwner = transaction.user?.id === user?.id;

  return (
    <div className="min-h-screen bg-slate-100">
      <Header
        title="Transaction Details"
        subtitle="Review the request, approval trail, and next action from a single screen."
      />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div>
        ) : null}

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 border-b border-slate-200 pb-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Transaction #{transaction.id.slice(0, 8)}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{transaction.description}</h1>
              <p className="mt-2 text-sm text-slate-600">
                Submitted by {transaction.user?.firstName} {transaction.user?.lastName} on{' '}
                {new Date(transaction.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="text-left lg:text-right">
              <p className="text-3xl font-semibold tracking-tight text-slate-950">
                {formatCurrency(transaction.totalAmount, transaction.currency)}
              </p>
              <span className={`mt-3 inline-flex rounded-full px-4 py-2 text-xs font-semibold ${statusStyles[transaction.status] || statusStyles.DRAFT}`}>
                {transaction.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-950">Request details</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-slate-500">Category</dt>
                  <dd className="mt-1 font-medium text-slate-900">{transaction.category}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Expense date</dt>
                  <dd className="mt-1 font-medium text-slate-900">{new Date(transaction.expenseDate).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Paid by</dt>
                  <dd className="mt-1 font-medium text-slate-900">{transaction.paidBy}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Remarks</dt>
                  <dd className="mt-1 font-medium text-slate-900">{transaction.remarks || 'No remarks provided.'}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-950">Requester</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-slate-500">Name</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {transaction.user?.firstName} {transaction.user?.lastName}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Email</dt>
                  <dd className="mt-1 font-medium text-slate-900">{transaction.user?.email}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Role</dt>
                  <dd className="mt-1 font-medium text-slate-900">{transaction.user?.role}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-950">Approval trail</h2>
            <div className="mt-4 space-y-3">
              {transaction.approvals?.length ? (
                transaction.approvals.map((approval) => (
                  <div key={approval.id} className="rounded-[1.5rem] border border-slate-200 px-5 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          {approval.approver?.firstName} {approval.approver?.lastName}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">{approval.approver?.role}</p>
                        {approval.comments ? <p className="mt-2 text-sm text-slate-700">{approval.comments}</p> : null}
                      </div>
                      <div className="text-sm text-slate-600 sm:text-right">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            approval.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : approval.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {approval.status}
                        </span>
                        <p className="mt-2">{approval.approvalDate ? new Date(approval.approvalDate).toLocaleDateString() : 'Pending action'}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-600">
                  Approval records will appear here after the draft is submitted.
                </div>
              )}
            </div>
          </div>

          {canApprove ? (
            <div className="mt-8 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
              <h2 className="text-lg font-semibold text-amber-950">
                {user?.role === 'CTO' ? 'CTO fast approval' : 'Approval action'}
              </h2>
              <p className="mt-2 text-sm text-amber-900">
                {user?.role === 'CTO'
                  ? 'Approving here completes the full approval chain immediately.'
                  : 'Add optional approval notes or required rejection remarks before taking action.'}
              </p>
              <textarea
                rows={4}
                value={approvalComment}
                onChange={(event) => setApprovalComment(event.target.value)}
                placeholder="Add context for the requester or the audit trail."
                className="mt-4 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={() => handleApproval('reject')}
                  disabled={processingApproval}
                  className="rounded-2xl border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApproval('approve')}
                  disabled={processingApproval}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processingApproval ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate(-1)}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back
            </button>
            {isOwner && transaction.status === 'DRAFT' ? (
              <button
                onClick={() => navigate(`/edit-transaction/${transaction.id}`)}
                className="rounded-2xl bg-sky-100 px-5 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-200"
              >
                Edit Draft
              </button>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
