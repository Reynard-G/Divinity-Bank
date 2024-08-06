import { Await, defer, useLoaderData } from "@remix-run/react";
import { type LoaderFunction } from "@remix-run/node";

import { searchParamsSchema } from "~/lib/validations";
import {
  getTransactions,
  getAllTransactions,
  getPaymentTypes,
  getTransactionStatuses,
} from "~/lib/queries.server";
import { TransactionsTable } from "~/components/DataTable/TransactionsTable";
import { Suspense } from "react";
import { SpokeSpinner } from "~/components/ui/spinner";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const search = searchParamsSchema.parse(Object.fromEntries(url.searchParams));

  const transactionsData = getTransactions(search);
  const types = getPaymentTypes();
  const statuses = getTransactionStatuses();
  const allTransactions = getAllTransactions();

  const transactions = Promise.all([
    transactionsData,
    types,
    statuses,
    allTransactions,
  ]);

  return defer({ transactions });
};

export default function Transactions() {
  const { transactions } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto flex w-full max-w-7xl grow flex-col">
      <div className="top-0 z-0">
        <div
          title="Transactions"
          className="relative flex items-start gap-6 pb-4"
        >
          <h1 className="flex-auto text-xl font-semibold">Transactions</h1>
        </div>
      </div>

      <section className="container grid items-center gap-2 pb-8">
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              <SpokeSpinner color="white" />
            </div>
          }
        >
          <Await resolve={transactions}>
            {([transactions, types, statuses, allTransactions]) => (
              <TransactionsTable
                data={transactions.data}
                types={types}
                statuses={statuses}
                pageCount={transactions.pageCount}
                allTransactions={allTransactions}
              />
            )}
          </Await>
        </Suspense>
      </section>
    </div>
  );
}
