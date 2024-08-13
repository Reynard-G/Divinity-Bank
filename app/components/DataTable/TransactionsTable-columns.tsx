import { type ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "~/components/DataTable/DataTable-Column-Header";
import { type Transaction } from "~/lib/db/schema";
import { formatDate } from "~/lib/utils/formatDate";
import {
  getPaymentTypeIcon,
  getTransactionStatusIcon,
} from "~/lib/utils/iconMappings";

export function getColumns(): ColumnDef<Transaction>[] {
  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Transaction ID" />
      ),
      cell: ({ row }) => <div className="w-20">{row.getValue("id")}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => {
        const type = row.original.transactionType;
        const sign = type === "CREDIT" ? "+" : "-";

        return (
          <div className="flex w-24 items-center">
            <span className="text-muted-foreground">{sign}$</span>
            <span>{row.getValue("amount")}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "fee",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fee" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex w-24 items-center">
            <span className="text-muted-foreground">$</span>
            <span>{row.getValue("fee")}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "paymentType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment Type" />
      ),
      cell: ({ row }) => {
        const type = row.original.paymentType;

        if (!type) return null;

        const Icon = getPaymentTypeIcon(type);

        return (
          <div className="flex w-[6.25rem] items-center">
            <Icon
              size={16}
              className="mr-2 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="capitalize">{type}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.status;

        if (!status) return null;

        const Icon = getTransactionStatusIcon(status);

        return (
          <div className="flex w-[6.25rem] items-center">
            <Icon
              size={16}
              className="mr-2 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="capitalize">{status}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "note",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Note" />
      ),
      cell: ({ row }) => row.getValue("note"),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ cell }) => formatDate(cell.getValue() as Date),
    },
  ];
}
