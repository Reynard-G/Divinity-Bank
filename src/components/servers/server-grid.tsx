import Link from "next/link";
import { unauthorized } from "next/navigation";

import { ServerCard } from "@/components/servers/server-card";
import { ServerGridHeader } from "@/components/servers/server-grid-header";
import { getServers } from "@/lib/db/queries/server.queries";
import {
  getAllServerBalances,
  getAllServerTransactionCounts,
  getAllServerLatestTransactionDates,
} from "@/lib/db/queries/transaction.queries";
import { getCurrentUser } from "@/lib/db/queries/user.queries";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatRelativeDate } from "@/lib/utils/format-date";
import { createServerRoutes } from "@/lib/utils/server-routes";

interface ServerGridProps {
  serverSlug: string;
}

export async function ServerGrid({ serverSlug }: ServerGridProps) {
  const user = await getCurrentUser();

  if (!user) unauthorized();

  const [servers, balanceData, transactionCountData, latestTransactionData] =
    await Promise.all([
      getServers(),
      getAllServerBalances(user.id),
      getAllServerTransactionCounts(user.id),
      getAllServerLatestTransactionDates(user.id),
    ]);

  return (
    <div>
      <ServerGridHeader />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {servers.map((server, index) => {
          const balance =
            balanceData.find((b) => b.serverId === server.id)?.balance ?? 0;
          const transactionCount =
            transactionCountData.find((c) => c.serverId === server.id)
              ?.transactionCount ?? 0;
          const latestDate = latestTransactionData.find(
            (d) => d.serverId === server.id
          )?.latestTransactionDate;

          return (
            <Link
              key={server.id}
              href={createServerRoutes.dashboard(server.shortName)}
            >
              <ServerCard
                name={server.name}
                bannerLink={server.bannerLink}
                isCurrent={server.shortName === serverSlug}
                balance={formatCurrency(balance)}
                transactionCount={transactionCount}
                lastActivity={
                  latestDate ? formatRelativeDate(latestDate) : "No activity"
                }
                index={index}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
