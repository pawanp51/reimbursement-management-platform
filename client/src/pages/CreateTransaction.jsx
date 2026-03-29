import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { transactionsAPI } from '../services/api';

const categories = ['TRAVEL', 'MEALS', 'ACCOMMODATION', 'OFFICE', 'OTHER'];
const paidByOptions = ['SELF', 'COMPANY'];

export default function CreateTransaction() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(isEditing);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    category: 'TRAVEL',
    paidBy: 'SELF',
    currency: 'USD',
    totalAmount: '',
    remarks: '',
  });

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const fetchTransaction = async () => {
      try {
        setBootstrapping(true);
        const response = await transactionsAPI.getTransactionById(id);
        const transaction = response.data?.transaction;

        if (!transaction) {
          throw new Error('Transaction not found.');
        }

        setFormData({
          description: transaction.description || '',
          expenseDate: transaction.expenseDate ? new Date(transaction.expenseDate).toISOString().split('T')[0] : '',
          category: transaction.category || 'TRAVEL',
          paidBy: transaction.paidBy || 'SELF',
          currency: transaction.currency || 'USD',
          totalAmount: String(transaction.totalAmount ?? ''),
          remarks: transaction.remarks || '',
        });
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load this transaction.');
      } finally {
        setBootstrapping(false);
      }
    };

    fetchTransaction();
  }, [id, isEditing]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      setLoading(true);

      const payload = {
        ...formData,
        currency: formData.currency.toUpperCase(),
        totalAmount: Number(formData.totalAmount),
        expenseDate: formData.expenseDate,
      };

      if (isEditing) {
        await transactionsAPI.updateTransaction(id, payload);
      } else {
        await transactionsAPI.createTransaction(payload);
      }

      navigate('/employee-dashboard');
    } catch (submitError) {
      setError(submitError.message || 'Unable to save the transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header
        title={isEditing ? 'Edit Expense Request' : 'Create Expense Request'}
        subtitle="Capture reimbursement details cleanly so approvers have exactly what they need."
      />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div>
        ) : null}

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {bootstrapping ? (
            <div className="py-16 text-center text-sm text-slate-500">Loading transaction details...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    placeholder="Client dinner, hotel booking, office supplies..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Expense Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expenseDate}
                    onChange={(event) => setFormData((current) => ({ ...current, expenseDate: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(event) => setFormData((current) => ({ ...current, category: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Paid By</label>
                  <select
                    value={formData.paidBy}
                    onChange={(event) => setFormData((current) => ({ ...current, paidBy: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  >
                    {paidByOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Currency</label>
                  <input
                    type="text"
                    maxLength={3}
                    required
                    value={formData.currency}
                    onChange={(event) => setFormData((current) => ({ ...current, currency: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 uppercase outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    placeholder="USD"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Amount</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.totalAmount}
                    onChange={(event) => setFormData((current) => ({ ...current, totalAmount: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    placeholder="0.00"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Remarks</label>
                  <textarea
                    rows={5}
                    value={formData.remarks}
                    onChange={(event) => setFormData((current) => ({ ...current, remarks: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    placeholder="Context that helps approvers review the request quickly."
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/employee-dashboard')}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Saving...' : isEditing ? 'Update Draft' : 'Create Draft'}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
