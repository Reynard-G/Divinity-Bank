import { useLoaderData, useSearchParams } from "@remix-run/react";
import * as React from "react";

import { DataTable } from "~/components/DataTable/DataTable";
import { DataTableToolbar } from "~/components/DataTable/DataTable-Toolbar";
import { getColumns } from "~/components/DataTable/TransactionsTable-columns";
import { TransactionsTableToolbarActions } from "~/components/DataTable/TransactionsTable-Toolbar-Actions";
import { useDataTable } from "~/hooks/use-datatable";
import {
  type PaymentType,
  type Transaction,
  type TransactionStatus,
} from "~/lib/db/schema";
import {
  getPaymentTypeIcon,
  getTransactionStatusIcon,
} from "~/lib/utils/iconMappings";
import { type loader } from "~/routes/app.$server.transactions";
import type { DataTableFilterField } from "~/types/DataTable";

interface TransactionsTableProps {
  data: Transaction[];
  pageCount: number;
}

export function TransactionsTable({ data, pageCount }: TransactionsTableProps) {
  const { types, statuses } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo(() => getColumns(), []);

  const filterFields: DataTableFilterField<Transaction>[] = [
    {
      label: "Note",
      value: "note",
      placeholder: "Search by note...",
    },
    {
      label: "Payment Type",
      value: "paymentType",
      options: types.map((type: PaymentType) => ({
        label: type.name[0]?.toUpperCase() + type.name.slice(1),
        value: type.name,
        icon: getPaymentTypeIcon(type.name),
        withCount: true,
      })),
    },
    {
      label: "Status",
      value: "status",
      options: statuses.map((status: TransactionStatus) => ({
        label: status.name[0]?.toUpperCase() + status.name.slice(1),
        value: status.name,
        icon: getTransactionStatusIcon(status.name),
        withCount: true,
      })),
    },
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    searchParams,
    state: {
      sorting: [{ id: "createdAt", desc: true }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} filterFields={filterFields}>
        <TransactionsTableToolbarActions />
      </DataTableToolbar>
    </DataTable>
  );
}
