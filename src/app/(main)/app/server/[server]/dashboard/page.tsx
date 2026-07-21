import type { Metadata } from "next";
import { Suspense } from "react";

import { ServerDirectoryParams } from "@/app/(main)/app/server/[server]/layout";
import { DashboardCards } from "@/components/dashboard/dashboard-cards";
import { DashboardCardsSkeleton } from "@/components/dashboard/dashboard-cards-skeleton";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { PageHeader } from "@/components/ui/page-header";
import { getServerByShortName } from "@/lib/db/queries/server.queries";

export default async function ServerDashboardPage({
  params,
}: ServerDirectoryParams) {
  const { server: serverSlug } = await params;

  return (
    <div className="mx-auto flex w-full max-w-6xl grow flex-col px-1">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your account."
      />

      <div className="space-y-10">
        <section>
          <Suspense fallback={<DashboardCardsSkeleton />}>
            <DashboardCards serverSlug={serverSlug} />
          </Suspense>
        </section>

        <section>
          <Suspense>
            <QuickActions serverSlug={serverSlug} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: ServerDirectoryParams): Promise<Metadata> {
  const { server: serverSlug } = await params;
  const server = await getServerByShortName(serverSlug);

  if (!server) {
    return {
      title: "Dashboard | Divinity Bank",
      description: "View your account overview",
    };
  }

  return {
    title: `Dashboard - ${server?.name || serverSlug.toUpperCase()} | Divinity Bank`,
    description: `View your account overview for ${server?.name || serverSlug.toUpperCase()}`,
  };
}
