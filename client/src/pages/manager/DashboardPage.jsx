import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Filter, Search, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import ApprovalTable from '../../components/dashboard/ApprovalTable';
import ThemeToggle from '../../components/dashboard/ThemeToggle';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

const PAGE_THEMES = {
  light: 'bg-slate-50 text-slate-900',
  dark: 'bg-slate-950 text-slate-100',
};

const mockApprovals = [
  {
    id: 'APR-101',
    subject: 'Team lunch reimbursement',
    owner: 'Sarah',
    category: 'Food',
    status: 'APPROVED',
    amountInr: 567,
    convertedAmount: 6.81,
    convertedCurrency: 'USD',
    avatar: '',
    locked: true,
  },
  {
    id: 'APR-102',
    subject: 'Client meeting cab expense',
    owner: 'Marcus',
    category: 'Travel',
    status: 'PENDING',
    amountInr: 1420,
    convertedAmount: 17.05,
    convertedCurrency: 'USD',
    avatar: '',
    locked: false,
  },
  {
    id: 'APR-103',
    subject: 'Cloud software renewal',
    owner: 'Ava',
    category: 'Software',
    status: 'PENDING',
    amountInr: 8620,
    convertedAmount: 103.46,
    convertedCurrency: 'USD',
    avatar: '',
    locked: false,
  },
  {
    id: 'APR-104',
    subject: 'Quarterly compliance workshop',
    owner: 'Nina',
    category: 'Training',
    status: 'REJECTED',
    amountInr: 2500,
    convertedAmount: 30.01,
    convertedCurrency: 'USD',
    avatar: '',
    locked: true,
  },
];

export default function DashboardPage() {
  const [theme, setTheme] = useState(() => localStorage.getItem('manager-theme') || 'light');
  const [approvals, setApprovals] = useState(() => {
    const saved = localStorage.getItem('manager-approvals-v2');
    return saved ? JSON.parse(saved) : mockApprovals;
  });
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loadingRequestId, setLoadingRequestId] = useState(null);
  const [isBootLoading, setIsBootLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('manager-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('manager-approvals-v2', JSON.stringify(approvals));
  }, [approvals]);

  useEffect(() => {
    const timer = setTimeout(() => setIsBootLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const categories = useMemo(() => {
    const values = [...new Set(approvals.map((item) => item.category))];
    return ['ALL', ...values];
  }, [approvals]);

  const filteredApprovals = useMemo(() => {
    return approvals.filter((approval) => {
      const matchesSearch =
        approval.subject.toLowerCase().includes(searchValue.toLowerCase()) ||
        approval.owner.toLowerCase().includes(searchValue.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || approval.status === statusFilter;
      const matchesCategory = categoryFilter === 'ALL' || approval.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [approvals, categoryFilter, searchValue, statusFilter]);

  const pendingCount = useMemo(
    () => approvals.filter((approval) => approval.status === 'PENDING').length,
    [approvals],
  );

  const onDecision = async (requestId, decision) => {
    if (loadingRequestId) {
      return;
    }

    setLoadingRequestId(requestId);

    await new Promise((resolve) => {
      setTimeout(resolve, 1400);
    });

    setApprovals((current) =>
      current.map((approval) => {
        if (approval.id !== requestId) {
          return approval;
        }

        return {
          ...approval,
          status: decision,
          locked: true,
        };
      }),
    );

    if (decision === 'APPROVED') {
      toast.success('Approval request accepted', {
        description: 'The row is now locked and marked approved.',
        icon: <CheckCircle2 className="h-4 w-4" />,
        className: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0',
      });
    } else {
      toast.error('Approval request rejected', {
        description: 'The row is now locked and marked rejected.',
        icon: <XCircle className="h-4 w-4" />,
        className: 'bg-gradient-to-r from-rose-500 to-red-600 text-white border-0',
      });
    }

    setLoadingRequestId(null);
  };

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${PAGE_THEMES[theme]}`}
      aria-label="Manager approval dashboard"
    >
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-sky-400/30 via-indigo-400/20 to-transparent blur-3xl dark:from-cyan-400/25 dark:via-blue-500/20"
          animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.section
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <Card className="mb-6 rounded-2xl">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-3xl">Approvals to Review</CardTitle>
              <CardDescription className="mt-1 text-base">
                Decide requests quickly, lock each row on action, and keep a clean approval history.
              </CardDescription>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant="pending">{pendingCount} Pending</Badge>
                <Badge variant="category">{approvals.length} Total Requests</Badge>
              </div>
            </div>

            <ThemeToggle
              theme={theme}
              onToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            />
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-5 grid gap-3 md:grid-cols-[1.4fr_0.8fr_0.8fr_auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  aria-label="Search approval requests"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search by subject or owner"
                  className="pl-9"
                />
              </label>

              <label className="relative block">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  aria-label="Filter by status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white/80 pl-9 pr-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
                >
                  <option value="ALL">All statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </label>

              <label className="block">
                <select
                  aria-label="Filter by category"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white/80 px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === 'ALL' ? 'All categories' : category}
                    </option>
                  ))}
                </select>
              </label>

              <Button
                variant="ghost"
                onClick={() => {
                  setSearchValue('');
                  setStatusFilter('ALL');
                  setCategoryFilter('ALL');
                }}
                className="h-10"
                aria-label="Reset filters"
              >
                Reset
              </Button>
            </div>

            <ApprovalTable
              requests={filteredApprovals}
              loadingRequestId={loadingRequestId}
              onDecision={onDecision}
              isBootLoading={isBootLoading}
            />
          </CardContent>
        </Card>
      </motion.section>
    </main>
  );
}
