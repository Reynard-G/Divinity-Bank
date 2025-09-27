"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  DollarSign,
  Calendar,
  CreditCard,
  BanknoteArrowUp,
  BanknoteArrowDown,
  TrendingUp,
  TrendingDown,
  TrendingUpDown,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { TransactionsDataTableClientProps } from "@/components/data-table/transactions-data-table-client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Scroller } from "@/components/ui/scroller";
import type { TransactionWithDetails } from "@/lib/db/queries/transaction.queries";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";

export function getTransactionColumns(
  statusCounts: TransactionsDataTableClientProps["statusCounts"] = {},
  typeCounts: TransactionsDataTableClientProps["typeCounts"] = {},
  paymentCounts: TransactionsDataTableClientProps["paymentCounts"] = {},
  userCounts: TransactionsDataTableClientProps["userCounts"] = {},
  amountRange: TransactionsDataTableClientProps["amountRange"] = {
    min: 0,
    max: 1000,
  }
): ColumnDef<TransactionWithDetails>[] {
  return [
    {
      id: "id",
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => <div className="text-sm">{row.getValue("id")}</div>,
      enableSorting: true,
      enableColumnFilter: false,
      size: 80,
    },
    {
      id: "createdByUser",
      accessorKey: "createdByUser",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created By" />
      ),
      cell: ({ row }) => {
        const createdBy = row.original.createdByUser;
        return (
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6 rounded">
              <AvatarImage
                src={
                  createdBy.minecraftUuid
                    ? `https://crafatar.com/avatars/${createdBy.minecraftUuid}?size=24&overlay`
                    : undefined
                }
                alt={createdBy.minecraftUsername || "User Avatar"}
              />
              <AvatarFallback>
                {createdBy.minecraftUsername
                  ? createdBy.minecraftUsername.charAt(0).toUpperCase()
                  : "N/A"}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-[100px] truncate text-sm">
              {createdBy.minecraftUsername || "Unknown User"}
            </span>
          </div>
        );
      },
      meta: {
        label: "Created By",
        variant: "multiSelect",
        options: Object.entries(userCounts).map(
          ([username, { id, count }]) => ({
            label: username,
            value: id.toString(),
            count,
          })
        ),
      },
      enableColumnFilter: true,
      enableSorting: false,
      size: 150,
    },
    {
      id: "amount",
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => {
        const amount = Number(row.getValue("amount"));
        const transactionType = row.getValue("transactionType") as string;
        const isCredit = transactionType.toLowerCase() === "credit";
        return (
          <div className="text-sm">
            <span className="text-muted-foreground">
              {isCredit ? "+" : "-"}
            </span>
            {formatCurrency(amount)}
          </div>
        );
      },
      meta: {
        label: "Amount",
        variant: "range",
        range: [amountRange.min, amountRange.max],
        unit: "$",
        icon: DollarSign,
      },
      enableColumnFilter: true,
      enableSorting: true,
      size: 120,
    },
    {
      id: "fee",
      accessorKey: "fee",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fee" />
      ),
      cell: ({ row }) => {
        const fee = Number(row.getValue("fee"));
        return (
          <div className="text-sm">
            {fee > 0 && "-"}
            {formatCurrency(fee)}
          </div>
        );
      },
      meta: {
        label: "Fee",
        variant: "range",
        unit: "$",
        icon: DollarSign,
      },
      enableColumnFilter: true,
      enableSorting: true,
      size: 100,
    },
    {
      id: "transactionType",
      accessorKey: "transactionType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Transaction Type" />
      ),
      cell: ({ row }) => {
        const type = row.getValue("transactionType") as string;
        const getTransactionTypeIcon = () => {
          switch (type.toLowerCase()) {
            case "credit":
              return TrendingUp;
            case "debit":
              return TrendingDown;
            default:
              return TrendingUpDown;
          }
        };

        const getTransactionTypeVariant = () => {
          switch (type.toLowerCase()) {
            case "credit":
              return "default";
            case "debit":
              return "secondary";
            default:
              return "outline";
          }
        };

        const TransactionTypeIcon = getTransactionTypeIcon();

        return (
          <Badge variant={getTransactionTypeVariant()} className="capitalize">
            <TransactionTypeIcon className="mr-1 h-3 w-3" />
            {type}
          </Badge>
        );
      },
      meta: {
        label: "Transaction Type",
        variant: "multiSelect",
        options: Object.entries(typeCounts).map(([type, count]) => {
          const getIcon = () => {
            switch (type.toLowerCase()) {
              case "credit":
                return TrendingUp;
              case "debit":
                return TrendingDown;
              default:
                return TrendingUpDown;
            }
          };

          return {
            label: type,
            value: type,
            count,
            icon: getIcon(),
          };
        }),
        icon: TrendingUpDown,
      },
      enableColumnFilter: true,
      enableSorting: true,
      size: 130,
    },
    {
      id: "paymentType",
      accessorKey: "paymentType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment Type" />
      ),
      cell: ({ row }) => {
        const paymentType = row.getValue("paymentType") as string;

        const getPaymentIcon = () => {
          switch (paymentType.toLowerCase()) {
            case "deposit":
              return BanknoteArrowDown;
            case "withdraw":
              return BanknoteArrowUp;
            case "transfer":
              return CreditCard;
            default:
              return CreditCard;
          }
        };

        const Icon = getPaymentIcon();

        return (
          <Badge variant="outline" className="capitalize">
            <Icon className="mr-1 h-3 w-3" />
            {paymentType}
          </Badge>
        );
      },
      meta: {
        label: "Payment Type",
        variant: "multiSelect",
        options: Object.entries(paymentCounts).map(([type, count]) => {
          const getIcon = () => {
            switch (type.toLowerCase()) {
              case "deposit":
                return BanknoteArrowDown;
              case "withdraw":
                return BanknoteArrowUp;
              case "transfer":
                return CreditCard;
              default:
                return CreditCard;
            }
          };

          return {
            label: type,
            value: type,
            count,
            icon: getIcon(),
          };
        }),
        icon: CreditCard,
      },
      enableColumnFilter: true,
      enableSorting: true,
      size: 140,
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const getStatusIcon = () => {
          switch (status.toLowerCase()) {
            case "success":
              return CheckCircle;
            case "pending":
              return Clock;
            case "failed":
              return XCircle;
            default:
              return AlertCircle;
          }
        };

        const getStatusVariant = () => {
          switch (status.toLowerCase()) {
            case "success":
              return "default";
            case "pending":
              return "secondary";
            case "failed":
              return "destructive";
            default:
              return "outline";
          }
        };

        const StatusIcon = getStatusIcon();

        return (
          <Badge variant={getStatusVariant()} className="capitalize">
            <StatusIcon className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        );
      },
      meta: {
        label: "Status",
        variant: "multiSelect",
        options: Object.entries(statusCounts).map(([status, count]) => {
          const getIcon = () => {
            switch (status.toLowerCase()) {
              case "success":
              case "completed":
                return CheckCircle;
              case "pending":
                return Clock;
              case "failed":
              case "cancelled":
                return XCircle;
              default:
                return AlertCircle;
            }
          };

          return {
            label: status,
            value: status,
            count,
            icon: getIcon(),
          };
        }),
        icon: CheckCircle,
      },
      enableColumnFilter: true,
      enableSorting: true,
      size: 120,
    },
    {
      id: "note",
      accessorKey: "note",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Note" />
      ),
      cell: ({ row }) => {
        const note = row.getValue("note") as string | null;
        return (
          <div className="max-w-32">
            {note ? (
              <Scroller
                orientation="horizontal"
                hideScrollbar
                className="flex items-center space-x-2"
              >
                <span className="text-sm">{note}</span>
              </Scroller>
            ) : (
              <span className="text-xs text-muted-foreground">No note</span>
            )}
          </div>
        );
      },
      meta: {
        label: "Note",
        variant: "text",
        placeholder: "Search notes...",
      },
      enableColumnFilter: true,
      enableSorting: false,
      size: 200,
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;
        return (
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm">
                {formatDate(new Date(createdAt), {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                  hour: undefined,
                  minute: undefined,
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        );
      },
      meta: {
        label: "Created At",
        variant: "dateRange",
        icon: Calendar,
      },
      enableColumnFilter: true,
      enableSorting: true,
      size: 180,
    },
  ];
}
