import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

import CreateTransactionsDialog from "~/components/Dialog/CreateTransactionsDialog";
import ExportTransactionsDialog from "~/components/Dialog/ExportTransactionsDialog";
import { type loader } from "~/routes/app.$server.transactions";

import { Skeleton } from "../ui/skeleton";

export function TransactionsTableToolbarActions() {
  const { allTransactions } = useLoaderData<typeof loader>();

  return (
    <div className="flex items-center gap-2">
      {/* Create Transaction Dialog */}
      <CreateTransactionsDialog />

      {/* Export Dialog */}
      <Suspense fallback={<Skeleton className="h-8 w-24 rounded-md" />}>
        <Await resolve={allTransactions}>
          {(allTransactions) => (
            <ExportTransactionsDialog allTransactions={allTransactions} />
          )}
        </Await>
      </Suspense>
    </div>
  );
}
