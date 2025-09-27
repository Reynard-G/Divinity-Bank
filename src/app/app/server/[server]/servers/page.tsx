import { Suspense } from "react";

import { ServerDirectoryParams } from "@/app/app/server/[server]/layout";
import { ServerGrid } from "@/components/servers/server-grid";
import { ServerGridSkeleton } from "@/components/servers/server-grid-skeleton";
import { SummaryCards } from "@/components/servers/summary-cards";
import { SummaryCardsSkeleton } from "@/components/servers/summary-cards-skeleton";
import { PageHeader } from "@/components/ui/page-header";

export default async function ServerListPage({
  params,
}: ServerDirectoryParams) {
  const { server: currentServerSlug } = await params;

  return (
    <div className="mx-auto flex w-full max-w-7xl grow flex-col">
      <PageHeader
        title="Servers"
        description="View and manage your accounts across different servers."
      />

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
