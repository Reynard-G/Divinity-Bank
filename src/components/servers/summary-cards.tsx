import { unauthorized } from "next/navigation";

import {
  getAllServerBalances,
  getAllServerTransactionCounts,
} from "@/lib/db/queries/transaction.queries";
import { getServers } from "@/lib/db/queries/server.queries";
import { getCurrentUser } from "@/lib/db/queries/user.queries";
import { formatCurrency } from "@/lib/utils/format-currency";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export async function SummaryCards() {
  const user = await getCurrentUser();

  if (!user) unauthorized();

  const [servers, balanceData, transactionCountData] = await Promise.all([
    getServers(),
    getAllServerBalances(user.id),
    getAllServerTransactionCounts(user.id),
  ]);

  const totalBalance = balanceData.reduce(
    (sum, server) => sum + (server.balance ?? 0),
    0
  );
  const totalTransactions = transactionCountData.reduce(
    (sum, server) => sum + (server.transactionCount ?? 0),
    0
  );
  const activeServers = transactionCountData.filter(
    (server) => server.transactionCount > 0
  ).length;

  return (
    <div className="mb-8 grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalBalance)}
          </div>
          <p className="text-xs text-muted-foreground">across all servers</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Total Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTransactions}</div>
          <p className="text-xs text-muted-foreground">lifetime transactions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Servers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeServers}</div>
          <p className="text-xs text-muted-foreground">
            of {servers.length} servers
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
