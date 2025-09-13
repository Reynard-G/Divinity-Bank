import { Suspense } from "react";

import { ServerDirectoryParams } from "@/app/app/server/[server]/layout";
import { PageHeader } from "@/components/ui/page-header";
import { ServerGrid } from "@/components/servers/server-grid";
import { ServerGridSkeleton } from "@/components/servers/server-grid-skeleton";
import { getServers } from "@/lib/db/queries/server.queries";
import { SummaryCards } from "@/components/servers/summary-cards";
import { SummaryCardsSkeleton } from "@/components/servers/summary-cards-skeleton";

export default async function ServersPage({ params }: ServerDirectoryParams) {
  const { server: currentServerSlug } = await params;

  const servers = await getServers();

  return (
    <div className="mx-auto flex w-full max-w-7xl grow flex-col">
      {servers && servers.length > 0 ? (
        <PageHeader
          title="Servers"
          description="View and manage your accounts across different servers."
        />
      ) : (
        <PageHeader
          title="Servers"
          description="No servers available. Contact an administrator."
        />
      )}

      <Suspense fallback={<SummaryCardsSkeleton />}>
        <SummaryCards />
      </Suspense>

      <Suspense fallback={<ServerGridSkeleton />}>
        <ServerGrid serverSlug={currentServerSlug} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata() {
  return {
    title: "Servers | Divinity Bank",
    description: "View and manage your accounts across different servers",
  };
}
