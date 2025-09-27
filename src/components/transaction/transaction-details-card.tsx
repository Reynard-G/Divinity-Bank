import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";
import type { TransactionWithDetails } from "@/lib/db/queries/transaction.queries";

interface TransactionDetailsCardProps {
  transaction: TransactionWithDetails;
}

export function TransactionDetailsCard({
  transaction,
}: TransactionDetailsCardProps) {
  const detailsItems = [
    {
      label: "Transaction ID",
      value: transaction.id,
      className: "font-mono",
    },
    {
      label: "Payment Type",
      value: transaction.paymentType,
      className: "capitalize",
    },
    {
      label: "Created",
      value: formatDate(transaction.createdAt, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      }),
      className: "text-sm",
    },
    {
      label: "Last Updated",
      value: formatDate(transaction.updatedAt, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      }),
      className: "text-sm",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Amount Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="text-2xl font-bold">
              {formatCurrency(parseFloat(transaction.amount))}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Processing Fee</span>
            <span className="text-muted-foreground">
              {formatCurrency(parseFloat(transaction.fee))}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {detailsItems.map((item, index) => (
              <div key={index} className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </dt>
                <dd className={item.className || "font-medium"}>
                  {item.value}
                </dd>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Note Section */}
      {transaction.note && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Note</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/50 p-4 text-sm">
              {transaction.note}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
