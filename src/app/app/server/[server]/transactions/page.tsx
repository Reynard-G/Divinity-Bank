import type { Metadata } from "next";
import { unauthorized } from "next/navigation";
import { Suspense } from "react";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { TransactionsDataTableServer as TransactionsDataTable } from "@/components/data-table/transactions-data-table-server";
import { PageHeader } from "@/components/ui/page-header";
import { getServerByShortName } from "@/lib/db/queries/server.queries";
import { getCurrentUser } from "@/lib/db/queries/user.queries";

interface TransactionsPageProps {
  params: Promise<{ server: string }>;
  searchParams: Promise<{
    page?: string;
    perPage?: string;
    sort?: string;
    filters?: string;
    operator?: string;
  }>;
}

export default async function ServerTransactionsPage({
  params,
  searchParams,
}: TransactionsPageProps) {
  const { server: serverSlug } = await params;
  const tableSearchParams = await searchParams;

  const [user, currentServer] = await Promise.all([
    getCurrentUser(),
    getServerByShortName(serverSlug),
  ]);

  if (!user || !currentServer) unauthorized();

  return (
    <div className="mx-auto flex w-full max-w-7xl grow flex-col">
      <PageHeader
        title="Transactions"
        description="View and manage your transactions across all servers."
      />

      {/* Main Content */}
      <section className="grid items-center gap-2 pb-8">
        <Suspense
          fallback={
            <DataTableSkeleton
              columnCount={6}
              rowCount={10}
              filterCount={2}
              cellWidths={["6rem", "4rem", "10rem", "10rem", "10rem", "10rem"]}
              withViewOptions={true}
              withPagination={true}
              shrinkZero={true}
            />
          }
        >
          <TransactionsDataTable
            searchParams={tableSearchParams}
            userId={user.id}
            serverId={currentServer.id}
          />
        </Suspense>
      </section>
    </div>
  );
}

export async function generateMetadata({
  params,
}: TransactionsPageProps): Promise<Metadata> {
  const { server: serverSlug } = await params;
  const server = await getServerByShortName(serverSlug);

  if (!server) {
    return {
      title: "Transactions | Divinity Bank",
      description: "View and manage your transactions",
    };
  }

  return {
    title: `Transactions - ${server?.name || serverSlug.toUpperCase()} | Divinity Bank`,
    description: `View and manage your transactions for ${server?.name || serverSlug.toUpperCase()}`,
  };
}
