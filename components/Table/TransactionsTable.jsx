import { useState, useMemo } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/table';
import { Pagination } from '@nextui-org/pagination';
import { Spinner } from '@nextui-org/spinner';

import formatCurrency from '@/utils/formatCurrency';
import formatUnix from '@/utils/formatUnix';

export default function TransactionsTable({ isLoading, data }) {
  const [page, setPage] = useState(1);

  const rowsPerPage = 15;
  const pages = Math.ceil(data.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return data.slice(start, end);
  }, [page, data]);

  return (
    <Table
      aria-label='Example static collection table'
      selectionMode="multiple"
      bottomContent={
        <div className="flex w-full justify-center">
          <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={page}
            total={pages || 1}
            onChange={(page) => setPage(page)}
          />
        </div>
      }
    >
      <TableHeader>
        <TableColumn key='Username' className="text-left rounded-l-lg">Username</TableColumn>
        <TableColumn key='Date' className="hidden sm:table-cell">Date</TableColumn>
        <TableColumn key='Type' className="hidden md:table-cell">Type</TableColumn>
        <TableColumn key='Amount' className="text-left rounded-r-lg md:rounded-none">Amount</TableColumn>
        <TableColumn key='Status' className="hidden md:table-cell">Status</TableColumn>
      </TableHeader>
      <TableBody
        items={items}
        isLoading={isLoading}
        emptyContent={isLoading || 'No transactions found.'}
        loadingContent={<Spinner />}
      >
        {(item) => (
          <TableRow key={item.id}>
            <TableCell>{item.minecraft_username}</TableCell>
            <TableCell className="hidden sm:table-cell">{formatUnix(item.created_at)}</TableCell>
            <TableCell className="hidden md:table-cell">{item.payment_type}</TableCell>
            <TableCell>{formatCurrency(item.amount)}</TableCell>
            <TableCell className="hidden md:table-cell">{item.status}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
