import { useMemo, useState } from 'react';

import { Pagination } from '@nextui-org/pagination';
import { Spinner } from '@nextui-org/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/table';

import formatCurrency from '@/utils/formatCurrency';
import formatUnix from '@/utils/formatUnix';

export default function TransactionsTable({ isLoading, transactions = [] }) {
  const [page, setPage] = useState(1);

  const rowsPerPage = 15;
  const pages = Math.ceil(transactions.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return transactions.slice(start, end);
  }, [page, transactions]);

  return (
    <Table
      aria-label='Example static collection table'
      selectionMode='multiple'
      bottomContent={
        <div className='flex w-full justify-center'>
          <Pagination
            isCompact
            showControls
            showShadow
            color='primary'
            page={page}
            total={pages || 1}
            onChange={(page) => setPage(page)}
          />
        </div>
      }
    >
      <TableHeader>
        <TableColumn key='Username' className='text-left'>
          Username
        </TableColumn>
        <TableColumn key='Date' className='hidden sm:table-cell'>
          Date
        </TableColumn>
        <TableColumn key='Type' className='hidden md:table-cell'>
          Type
        </TableColumn>
        <TableColumn
          key='Amount'
          className='rounded-r-lg text-left md:rounded-none'
        >
          Amount
        </TableColumn>
        <TableColumn key='Status' className='hidden md:table-cell'>
          Status
        </TableColumn>
      </TableHeader>
      <TableBody
        items={items}
        isLoading={isLoading}
        emptyContent={isLoading || 'No transactions found.'}
        loadingContent={<Spinner />}
      >
        {(item) => (
          <TableRow key={item.id}>
            <TableCell>{item.created_minecraft_username}</TableCell>
            <TableCell className='hidden sm:table-cell'>
              {formatUnix(item.created_at)}
            </TableCell>
            <TableCell className='hidden md:table-cell'>
              {item.payment_type}
            </TableCell>
            <TableCell>{formatCurrency(item.amount)}</TableCell>
            <TableCell className='hidden md:table-cell'>
              {item.status}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
