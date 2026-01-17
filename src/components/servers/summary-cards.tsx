import { unauthorized } from "next/navigation";

import { SummaryStatCard } from "@/components/servers/summary-stat-card";
import { getServers } from "@/lib/db/queries/server.queries";
import {
  getAllServerBalances,
  getAllServerTransactionCounts,
} from "@/lib/db/queries/transaction.queries";
import { getCurrentUser } from "@/lib/db/queries/user.queries";
import { formatCurrency } from "@/lib/utils/format-currency";

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

  const stats = [
    {
      title: "Total Balance",
      value: formatCurrency(totalBalance),
      subtitle: "across all servers",
    },
    {
      title: "Total Transactions",
      value: totalTransactions.toLocaleString(),
      subtitle: "lifetime transactions",
    },
    {
      title: "Active Servers",
      value: activeServers.toString(),
      subtitle: `of ${servers.length} servers`,
    },
  ];

  return (
    <div className="mb-8 grid gap-4 md:grid-cols-3">
      {stats.map((stat, index) => (
        <SummaryStatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          index={index}
        />
      ))}
    </div>
  );
}
