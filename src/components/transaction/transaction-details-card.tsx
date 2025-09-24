import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TransactionStatusBadge } from "./transaction-status-badge";
import { TransactionTypeBadge } from "./transaction-type-badge";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";
import type { TransactionWithDetails } from "@/lib/db/queries/transaction.queries";

interface TransactionDetailsCardProps {
  transaction: TransactionWithDetails;
}

export function TransactionDetailsCard({
  transaction,
}: TransactionDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transaction Details</CardTitle>
          <div className="flex gap-2">
            <TransactionStatusBadge status={transaction.status} />
            <TransactionTypeBadge type={transaction.transactionType} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount and Fee */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Amount
            </dt>
            <dd className="text-2xl font-bold">
              {formatCurrency(parseFloat(transaction.amount))}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Fee</dt>
            <dd className="text-lg font-semibold text-muted-foreground">
              {formatCurrency(parseFloat(transaction.fee))}
            </dd>
          </div>
        </div>

        <Separator />

        {/* Transaction Info */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Transaction ID
            </dt>
            <dd className="font-mono text-sm">{transaction.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Payment Type
            </dt>
            <dd className="capitalize">{transaction.paymentType}</dd>
          </div>
        </div>

        <Separator />

        {/* Server and User Info */}
        <div className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Server
            </dt>
            <dd className="font-medium">{transaction.server.name}</dd>
            <dd className="text-sm text-muted-foreground">
              ({transaction.server.shortName})
            </dd>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Account Holder
              </dt>
              <dd className="font-medium">
                {transaction.user.minecraftUsername}
              </dd>
              <dd className="text-sm text-muted-foreground">
                {transaction.user.discordUsername}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Created By
              </dt>
              <dd className="font-medium">
                {transaction.createdByUser.minecraftUsername}
              </dd>
              <dd className="text-sm text-muted-foreground">
                {transaction.createdByUser.discordUsername}
              </dd>
            </div>
          </div>
        </div>

        <Separator />

        {/* Timestamps */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Created
            </dt>
            <dd className="text-sm">
              {formatDate(transaction.createdAt, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Last Updated
            </dt>
            <dd className="text-sm">
              {formatDate(transaction.updatedAt, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </dd>
          </div>
        </div>

        {/* Note */}
        {transaction.note && (
          <>
            <Separator />
            <div>
              <dt className="mb-2 text-sm font-medium text-muted-foreground">
                Note
              </dt>
              <dd className="rounded-md border bg-muted/50 p-3 text-sm">
                {transaction.note}
              </dd>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
