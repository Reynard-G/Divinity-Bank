import { Suspense } from "react";
import { Await, useLoaderData } from "@remix-run/react";

import ExportTransactionsDialog from "~/components/Dialog/ExportTransactionsDialog";
import CreateTransactionsDialog from "~/components/Dialog/CreateTransactionsDialog";
import { loader } from "~/routes/app.transactions";
import { Skeleton } from "../ui/skeleton";

export function TransactionsTableToolbarActions() {
  const { allTransactions } = useLoaderData<typeof loader>();

  return (
    <div className="flex items-center gap-2">
      {/* Create Transaction Dialog */}
      <CreateTransactionsDialog />

      {/* Export Dialog */}
      {/* Fallback will never load as Await component in app.transactions.tsx takes precedence. This is a precautionary measure. */}
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
