"use client";

import * as React from "react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { getTransactionColumns } from "@/components/data-table/transaction-columns";
import { useDataTable } from "@/hooks/use-data-table";
import type { TransactionWithDetails } from "@/lib/db/queries/transaction.queries";

export interface TransactionsDataTableClientProps {
  initialData: {
    data: TransactionWithDetails[];
    pageCount: number;
    total: number;
  };
  statusCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  paymentCounts: Record<string, number>;
  userCounts: Record<string, { id: number; count: number }>;
  amountRange: { min: number; max: number };
}

export function TransactionsDataTableClient({
  initialData,
  statusCounts,
  typeCounts,
  paymentCounts,
  userCounts,
  amountRange,
}: TransactionsDataTableClientProps) {
  const columns = React.useMemo(
    () =>
      getTransactionColumns(
        statusCounts,
        typeCounts,
        paymentCounts,
        userCounts,
        amountRange
      ),
    [statusCounts, typeCounts, paymentCounts, userCounts, amountRange]
  );

  const { table, shallow, debounceMs, throttleMs } = useDataTable({
    data: initialData.data,
    columns,
    pageCount: initialData.pageCount,
    enableAdvancedFilter: true,
    initialState: {
      columnVisibility: {
        id: false,
        note: false,
        transactionType: false,
      },
      columnPinning: {
        right: ["actions"],
      },
      sorting: [{ id: "createdAt", desc: true }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <DataTable table={table}>
      <DataTableAdvancedToolbar table={table}>
        <DataTableSortList table={table} align="start" />
        <DataTableFilterList
          table={table}
          shallow={shallow}
          debounceMs={debounceMs}
          throttleMs={throttleMs}
          align="start"
        />
      </DataTableAdvancedToolbar>
    </DataTable>
  );
}
