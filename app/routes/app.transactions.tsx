import { defer, useLoaderData } from "@remix-run/react";
import { type LoaderFunction } from "@remix-run/node";

import { searchParamsSchema } from "~/lib/validations";
import {
  getTransactions,
  getAllTransactions,
  getPaymentTypes,
  getTransactionStatuses,
} from "~/lib/queries";
import { TransactionsTable } from "~/components/DataTable/TransactionsTable";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const search = searchParamsSchema.parse(Object.fromEntries(url.searchParams));

  const allTransactions = getAllTransactions();
  const [{ data, pageCount }, types, statuses] = await Promise.all([
    getTransactions(search),
    getPaymentTypes(),
    getTransactionStatuses(),
  ]);

  return defer({ data, types, statuses, pageCount, allTransactions });
};

export default function Transactions() {
  const { data, types, statuses, pageCount, allTransactions } =
    useLoaderData<typeof loader>();

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
        <TransactionsTable
          data={data}
          types={types}
          statuses={statuses}
          pageCount={pageCount}
          allTransactions={allTransactions}
        />
      </section>
    </div>
  );
}
