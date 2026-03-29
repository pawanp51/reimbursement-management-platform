import { Search } from 'lucide-react';
import ApprovalRow from './ApprovalRow';
import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

function LoadingRows() {
  return Array.from({ length: 4 }).map((_, index) => (
    <TableRow key={`skeleton-${index}`}>
      <TableCell><Skeleton className="h-4 w-44" /></TableCell>
      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-8 w-40 ml-auto rounded-xl" /></TableCell>
    </TableRow>
  ));
}

export default function ApprovalTable({ requests, loadingRequestId, onDecision, isBootLoading }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Approval Subject</TableHead>
          <TableHead>Request Owner</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Request Status</TableHead>
          <TableHead>Total Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {isBootLoading && <LoadingRows />}

        {!isBootLoading && requests.length === 0 && (
          <TableRow>
            <TableCell colSpan={6}>
              <div className="flex items-center justify-center gap-2 py-10 text-slate-500 dark:text-slate-400">
                <Search className="h-4 w-4" />
                No approvals match your current filters.
              </div>
            </TableCell>
          </TableRow>
        )}

        {!isBootLoading &&
          requests.map((request, index) => (
            <ApprovalRow
              key={request.id}
              request={request}
              rowIndex={index}
              isLoading={loadingRequestId === request.id}
              onDecision={onDecision}
            />
          ))}
      </TableBody>
    </Table>
  );
}
