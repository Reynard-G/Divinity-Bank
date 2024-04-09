import { useMemo, useState } from 'react';

import { Chip } from '@nextui-org/chip';
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

import PaymentTypeFilterButton from '@/components/Button/PaymentTypeFilterButton';
import StatusFilterButton from '@/components/Button/StatusFilterButton';
import TransactionTypeFilterButton from '@/components/Button/TransactionTypeFilterButton';
import PaymentType from '@/constants/PaymentType';
import TransactionStatus from '@/constants/TransactionStatus';
import TransactionStatusColor from '@/constants/TransactionStatusColor';
import TransactionType from '@/constants/TransactionType';
import formatCurrency from '@/utils/formatCurrency';
import formatUnix from '@/utils/formatUnix';

export default function TransactionsTable({ isLoading, transactions = [] }) {
  const [transactionTypeFilter, setTransactionTypeFilter] = useState(
    Array.from(Object.values(TransactionType)),
  );
  const [paymentTypeFilter, setPaymentTypeFilter] = useState(
    Array.from(Object.values(PaymentType)),
  );
  const [statusFilter, setStatusFilter] = useState(
    Array.from(Object.values(TransactionStatus)),
  );
  const [page, setPage] = useState(1);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (
        transactionTypeFilter &&
        Array.from(transactionTypeFilter).every(
          (type) => type !== transaction.transaction_type,
        )
      ) {
        return false;
      }

      if (
        paymentTypeFilter &&
        Array.from(paymentTypeFilter).every(
          (type) => type !== transaction.payment_type,
        )
      ) {
        return false;
      }

      if (
        statusFilter &&
        Array.from(statusFilter).every(
          (status) => status !== transaction.status,
        )
      ) {
        return false;
      }

      return true;
    });
  }, [transactions, transactionTypeFilter, paymentTypeFilter, statusFilter]);

  const rowsPerPage = 15;
  const pages = Math.ceil(filteredTransactions.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredTransactions.slice(start, end);
  }, [page, filteredTransactions]);

  const topContent = useMemo(() => {
    return (
      <header className='relative flex flex-col gap-2 rounded-medium bg-default-100/75 px-4 pb-3 pt-2 md:pt-3'>
        {/* Mobile header */}
        <div className='flex items-center gap-2 lg:hidden lg:gap-2'>
          <h2 className='text-large font-medium'>Transactions</h2>
          <span className='text-small text-default-400'>
            ({filteredTransactions.length})
          </span>
        </div>

        {/* Desktop header */}
        <div className='flex items-center justify-between gap-2'>
          <div className='flex flex-row gap-2'>
            <div className='hidden items-center gap-2 lg:flex'>
              <h2 className='text-medium font-medium'>Transactions</h2>
              <span className='text-small text-default-400'>
                ({filteredTransactions.length})
              </span>
            </div>
          </div>
          <div className='-ml-2 flex w-full flex-wrap items-center justify-start gap-2 lg:ml-0 lg:justify-end'>
            <TransactionTypeFilterButton
              selectedKeys={transactionTypeFilter}
              onSelectionChange={setTransactionTypeFilter}
            />
            <PaymentTypeFilterButton
              selectedKeys={paymentTypeFilter}
              onSelectionChange={setPaymentTypeFilter}
            />
            <StatusFilterButton
              selectedKeys={statusFilter}
              onSelectionChange={setStatusFilter}
            />
          </div>
        </div>
      </header>
    );
  }, [
    filteredTransactions,
    transactionTypeFilter,
    paymentTypeFilter,
    statusFilter,
  ]);

  const bottomContent = useMemo(() => {
    return (
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
    );
  }, [page, pages]);

  return (
    <Table
      aria-label='Example static collection table'
      isHeaderStick={true}
      topContent={topContent}
      topContentPlacement='outside'
      bottomContent={bottomContent}
      bottomContentPlacement='outside'
      selectionMode='multiple'
      classNames={{
        wrapper: 'bg-transparent max-w-full',
      }}
    >
      <TableHeader>
        <TableColumn key='Username' className='text-left'>
          Username
        </TableColumn>
        <TableColumn key='Date' className='hidden sm:table-cell'>
          Date
        </TableColumn>
        <TableColumn key='Type' className='hidden lg:table-cell'>
          Type
        </TableColumn>
        <TableColumn
          key='Amount'
          className='rounded-r-lg text-left md:rounded-none'
        >
          Amount
        </TableColumn>
        <TableColumn key='Note' className='hidden xl:table-cell'>
          Note
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
        {(transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{transaction.created_minecraft_username}</TableCell>
            <TableCell className='hidden sm:table-cell'>
              {formatUnix(transaction.created_at)}
            </TableCell>
            <TableCell className='hidden lg:table-cell'>
              {transaction.payment_type}
            </TableCell>
            <TableCell>
              {transaction.transaction_type === TransactionType.CREDIT
                ? `+${formatCurrency(transaction.amount)}`
                : `-${formatCurrency(transaction.amount)}`}
            </TableCell>
            <TableCell className='hidden xl:table-cell'>
              {transaction.note}
            </TableCell>
            <TableCell className='hidden md:table-cell'>
              <Chip
                color={TransactionStatusColor[transaction.status]}
                size='sm'
                radius='sm'
                variant='flat'
              >
                {transaction.status}
              </Chip>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
