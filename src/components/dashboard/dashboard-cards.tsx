import { unauthorized } from "next/navigation";

import { StatCard } from "@/components/dashboard/stat-card";
import { getServerByShortName } from "@/lib/db/queries/server.queries";
import {
  getBalance,
  getLatestTransactionDate,
  getTransactionCount,
} from "@/lib/db/queries/transaction.queries";
import { getCurrentUser } from "@/lib/db/queries/user.queries";
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

  const stats = [
    {
      title: "Current Balance",
      value: balance !== null ? formatCurrency(balance) : "$0.00",
      subtitle: `on ${currentServer.name}`,
    },
    {
      title: "Total Transactions",
      value:
        transactionCount !== null ? transactionCount.toLocaleString() : "0",
      subtitle: "lifetime transactions",
    },
    {
      title: "Last Transaction",
      value: latestTransactionDate
        ? formatRelativeDate(latestTransactionDate)
        : "Never",
      subtitle: latestTransactionDate ? "last activity" : "no activity yet",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <StatCard
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
