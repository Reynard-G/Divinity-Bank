import { unauthorized } from "next/navigation";
import {
  IconCreditCard,
  IconReceipt,
  IconClock
} from "@tabler/icons-react";

import { getCurrentUser } from "@/lib/db/queries/user.queries";
import { getServerByShortName } from "@/lib/db/queries/server.queries";
import { getBalance, getLatestTransactionDate, getTransactionCount } from "@/lib/db/queries/transaction.queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatRelativeDate } from "@/lib/utils/format-date";

interface DashboardCardsProps {
  serverSlug: string;
}

export async function DashboardCards({ serverSlug }: DashboardCardsProps) {
  const [user, currentServer] = await Promise.all([
    getCurrentUser(),
    getServerByShortName(serverSlug),
  ]);

  if (!user || !currentServer) unauthorized();

  const [balance, transactionCount, latestTransactionDate] = await Promise.all([
    getBalance(user.id, currentServer.id),
    getTransactionCount(user.id, currentServer.id),
    getLatestTransactionDate(user.id, currentServer.id),
  ]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Balance Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
          <IconCreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {balance !== null ? formatCurrency(balance) : "No transactions"}
          </div>
          <p className="text-xs text-muted-foreground">
            on {currentServer.name}
          </p>
        </CardContent>
      </Card>

      {/* Transactions Count Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          <IconReceipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {transactionCount !== null ? transactionCount : 0}
          </div>
          <p className="text-xs text-muted-foreground">
            lifetime transactions
          </p>
        </CardContent>
      </Card>

      {/* Last Transaction Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Transaction</CardTitle>
          <IconClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {latestTransactionDate
              ? formatRelativeDate(latestTransactionDate)
              : "Never"
            }
          </div>
          <p className="text-xs text-muted-foreground">
            {latestTransactionDate ? "last activity" : "no activity yet"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
