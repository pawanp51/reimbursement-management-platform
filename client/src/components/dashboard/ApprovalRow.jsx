import { Check, CircleDashed, LoaderCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { TableCell, TableRow } from '../ui/table';

const statusMap = {
  PENDING: { label: 'Pending', variant: 'pending', icon: CircleDashed },
  APPROVED: { label: 'Approved', variant: 'approved', icon: Check },
  REJECTED: { label: 'Rejected', variant: 'rejected', icon: X },
};

const MotionRow = motion(TableRow);

function formatCurrency(value, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ApprovalRow({ request, rowIndex, isLoading, onDecision }) {
  const isLocked = request.locked || request.status !== 'PENDING';
  const status = statusMap[request.status] ?? statusMap.PENDING;
  const StatusIcon = status.icon;

  return (
    <MotionRow
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rowIndex * 0.08, duration: 0.28 }}
      whileHover={
        !isLocked
          ? {
              scale: 1.002,
              boxShadow: '0 10px 30px rgba(56, 189, 248, 0.18)',
            }
          : undefined
      }
      className={isLocked ? 'opacity-70 saturate-75' : ''}
    >
      <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{request.subject}</TableCell>

      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar name={request.owner} src={request.avatar} />
          <span className="font-medium text-slate-800 dark:text-slate-200">{request.owner}</span>
        </div>
      </TableCell>

      <TableCell>
        <Badge variant="category">
          {request.category}
        </Badge>
      </TableCell>

      <TableCell>
        <AnimatePresence mode="wait">
          <motion.div
            key={request.status}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.22 }}
            className="inline-flex"
          >
            <Badge variant={status.variant} aria-live="polite" className="gap-1.5">
              <StatusIcon className="h-3.5 w-3.5" />
              <span>{status.label}</span>
            </Badge>
          </motion.div>
        </AnimatePresence>
      </TableCell>

      <TableCell>
        <div className="font-semibold text-slate-900 dark:text-slate-100">
          {formatCurrency(request.amountInr, 'INR')}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {formatCurrency(request.convertedAmount, request.convertedCurrency)} converted total
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center justify-end gap-2">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="approve"
              size="sm"
              onClick={() => onDecision(request.id, 'APPROVED')}
              disabled={isLocked || isLoading}
              aria-label={`Approve ${request.subject}`}
            >
              {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Approve
            </Button>
          </motion.div>

          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="reject"
              size="sm"
              onClick={() => onDecision(request.id, 'REJECTED')}
              disabled={isLocked || isLoading}
              aria-label={`Reject ${request.subject}`}
            >
              {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              Reject
            </Button>
          </motion.div>
        </div>
      </TableCell>
    </MotionRow>
  );
}
