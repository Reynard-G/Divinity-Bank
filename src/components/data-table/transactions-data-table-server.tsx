"use server";

import { TransactionsDataTableClient } from "@/components/data-table/transactions-data-table-client";
import {
  getTransactions,
  getTransactionStatusCounts,
  getTransactionTypeCounts,
  getPaymentTypeCounts,
  getAmountRange,
  getUserCounts,
  type TransactionWithDetails,
} from "@/lib/db/queries/transaction.queries";
import { getValidFilters } from "@/lib/utils/data-table";
import type { ExtendedColumnFilter } from "@/types/data-table";

interface TransactionsDataTableServerProps {
  searchParams: {
    page?: string;
    perPage?: string;
    sort?: string;
    filters?: string;
    operator?: string;
  };
  userId: number;
  serverId: number;
}

export async function TransactionsDataTableServer({
  searchParams,
  userId,
  serverId,
}: TransactionsDataTableServerProps) {
  const page = parseInt(searchParams.page ?? "1", 10);
  const perPage = parseInt(searchParams.perPage ?? "10", 10);

  const sort = searchParams.sort
    ? JSON.parse(decodeURIComponent(searchParams.sort))
    : [{ id: "createdAt", desc: true }];

  let filters: ExtendedColumnFilter<TransactionWithDetails>[] = [];
  if (searchParams.filters) {
    try {
      filters = JSON.parse(decodeURIComponent(searchParams.filters));
    } catch {
      filters = [];
    }
  }

  const validFilters = getValidFilters(filters);
  const joinOperator = searchParams.operator === "or" ? "or" : "and";

  const [
    transactionData,
    statusCounts,
    typeCounts,
    paymentCounts,
    userCounts,
    amountRange,
  ] = await Promise.all([
    getTransactions({
      page,
      perPage,
      sort,
      filters: validFilters,
      joinOperator,
      userId,
      serverId,
    }),
    getTransactionStatusCounts(userId, serverId),
    getTransactionTypeCounts(userId, serverId),
    getPaymentTypeCounts(userId, serverId),
    getUserCounts(userId, serverId),
    getAmountRange(userId, serverId),
  ]);

  return (
    <TransactionsDataTableClient
      initialData={transactionData}
      statusCounts={statusCounts}
      typeCounts={typeCounts}
      paymentCounts={paymentCounts}
      userCounts={userCounts}
      amountRange={amountRange}
    />
  );
}
