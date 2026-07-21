import { Suspense } from "react";

import { ServerDirectoryParams } from "@/app/(main)/app/server/[server]/layout";
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
    <div className="mx-auto flex w-full max-w-6xl grow flex-col px-1">
      <PageHeader
        title="Servers"
        description="View and manage your accounts across different servers."
      />

      <div className="space-y-6">
        <section>
          <Suspense fallback={<SummaryCardsSkeleton />}>
            <SummaryCards />
          </Suspense>
        </section>

        <section>
          <Suspense fallback={<ServerGridSkeleton />}>
            <ServerGrid serverSlug={currentServerSlug} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

export async function generateMetadata() {
  return {
    title: "Servers | Divinity Bank",
    description: "View and manage your accounts across different servers",
  };
}
