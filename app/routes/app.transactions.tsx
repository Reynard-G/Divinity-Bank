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

  const transactions = getTransactions(search);
  const types = getPaymentTypes();
  const statuses = getTransactionStatuses();
  const allTransactions = getAllTransactions();

  return defer({ transactions, types, statuses, allTransactions });
};

export default function Transactions() {
  const { transactions, types, statuses } = useLoaderData<typeof loader>();

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
          <Await
            resolve={Promise.all([transactions, types, statuses])}
            errorElement={
              <div className="flex h-64 items-center justify-center">
                <p className="text-red-500">
                  Error loading transactions, please try again later.
                </p>
              </div>
            }
          >
            {([transactions, types, statuses]) => (
              <TransactionsTable
                data={transactions.data}
                types={types}
                statuses={statuses}
                pageCount={transactions.pageCount}
              />
            )}
          </Await>
        </Suspense>
      </section>
    </div>
  );
}
