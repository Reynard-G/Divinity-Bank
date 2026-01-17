import Image from "next/image";
import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TransactionWithDetails } from "@/lib/db/queries/transaction.queries";
import { formatCurrency } from "@/lib/utils/format-currency";

import { TransactionStatusBadge } from "./transaction-status-badge";
import { TransactionTypeBadge } from "./transaction-type-badge";

interface TransactionHeaderProps {
  transaction: TransactionWithDetails;
}

export function TransactionHeader({ transaction }: TransactionHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="link" size="sm" className="h-9 px-3" asChild>
          <Link
            href="/app"
            className="relative !no-underline after:absolute after:bottom-2 after:h-[1px] after:w-11/12 after:origin-bottom-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 after:ease-in-out hover:after:origin-bottom-left hover:after:scale-x-100"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Main Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Transaction #{transaction.id}
              </h1>
              <div className="flex items-center gap-2">
                <TransactionStatusBadge status={transaction.status} />
                <TransactionTypeBadge type={transaction.transactionType} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {formatCurrency(parseFloat(transaction.amount))}
              </div>
              <Badge variant="outline" className="mt-1">
                {transaction.server.name}
              </Badge>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center justify-between rounded-lg border bg-card p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Image
                src={`https://crafthead.net/avatar/${transaction.user.minecraftUuid}`}
                alt={`${transaction.user.minecraftUsername}'s avatar`}
                width={40}
                height={40}
                className="rounded-md"
                unoptimized
              />
              <div>
                <p className="font-medium">
                  {transaction.user.minecraftUsername}
                </p>
                <p className="text-sm text-muted-foreground">Account Holder</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-right">
            <div>
              <p className="font-medium">
                {transaction.createdByUser.minecraftUsername}
              </p>
              <p className="text-sm text-muted-foreground">Created By</p>
            </div>
            <Image
              src={`https://crafthead.net/avatar/${transaction.createdByUser.minecraftUuid}`}
              alt={`${transaction.createdByUser.minecraftUsername}'s avatar`}
              width={40}
              height={40}
              className="rounded-md"
              unoptimized
            />
          </div>
        </div>
      </div>
    </div>
  );
}
