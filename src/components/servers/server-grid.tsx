import Image from "next/image";
import Link from "next/link";
import { unauthorized } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServers } from "@/lib/db/queries/server.queries";
import {
  getAllServerBalances,
  getAllServerTransactionCounts,
  getAllServerLatestTransactionDates,
} from "@/lib/db/queries/transaction.queries";
import { getCurrentUser } from "@/lib/db/queries/user.queries";
import { cn } from "@/lib/utils/cn";
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {servers.map((server) => (
        <Link
          key={server.id}
          href={createServerRoutes.dashboard(server.shortName)}
        >
          <Card
            className={cn(
              "group relative cursor-pointer overflow-hidden transition-colors hover:bg-muted/50",
              server.shortName === serverSlug && "border-primary"
            )}
          >
            <div
              className={cn(
                "absolute inset-0 z-0 overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-20"
              )}
            >
              <Image
                src={server.bannerLink}
                alt={`${server.name} banner`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="bg-linear-to-t absolute inset-0 from-background/90 via-background/50 to-background/30" />
            </div>

            {server.shortName === serverSlug && (
              <Badge className="absolute right-3 top-3 z-10">Current</Badge>
            )}

            <CardHeader className="relative z-10 pb-5">
              <CardTitle className="flex items-center justify-between">
                <span>{server.name}</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Balance:</span>
                <span className="font-mono text-sm">
                  {formatCurrency(
                    balanceData.find((b) => b.serverId === server.id)
                      ?.balance ?? 0
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Transactions:</span>
                <span className="font-mono text-sm">
                  {transactionCountData.find((c) => c.serverId === server.id)
                    ?.transactionCount ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Activity:</span>
                <span className="text-sm text-muted-foreground">
                  {(() => {
                    const latestDate = latestTransactionData.find(
                      (d) => d.serverId === server.id
                    )?.latestTransactionDate;
                    return latestDate
                      ? formatRelativeDate(latestDate)
                      : "No activity";
                  })()}
                </span>
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm font-medium">Status:</span>
                <div className="flex items-center space-x-2">
                  {(transactionCountData.find((c) => c.serverId === server.id)
                    ?.transactionCount ?? 0) > 0 ? (
                    <>
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                      <span className="text-sm text-green-600">Active</span>
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                      <span className="text-sm text-gray-500">Inactive</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
