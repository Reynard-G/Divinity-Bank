import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TransactionStatusBadge } from "./transaction-status-badge";
import { TransactionTypeBadge } from "./transaction-type-badge";
import { formatCurrency } from "@/lib/utils/format-currency";
import type { TransactionWithDetails } from "@/lib/db/queries/transaction.queries";

interface TransactionHeaderProps {
  transaction: TransactionWithDetails;
}

export function TransactionHeader({ transaction }: TransactionHeaderProps) {
  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold">Transaction #{transaction.id}</h1>
          <div className="flex gap-2">
            <TransactionStatusBadge status={transaction.status} />
            <TransactionTypeBadge type={transaction.transactionType} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
          <span className="text-2xl font-bold text-foreground">
            {formatCurrency(parseFloat(transaction.amount))}
          </span>
          <span>•</span>
          <span>{transaction.server.name}</span>
          <span>•</span>
          <span>{transaction.user.minecraftUsername}</span>
        </div>
      </div>

      <Separator className="mb-6 mt-4" />
    </>
  );
}
