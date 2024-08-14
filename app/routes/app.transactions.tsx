import {
  type ActionFunctionArgs,
  json,
  type LoaderFunction,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { Await, defer, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { namedAction } from "remix-utils/named-action";

import { TransactionsTable } from "~/components/DataTable/TransactionsTable";
import { SpokeSpinner } from "~/components/ui/spinner";
import {
  deposit,
  getAllTransactions,
  getNonSensitiveUserInfo,
  getPaymentTypes,
  getTransactions,
  getTransactionStatuses,
  transfer,
  withdraw,
} from "~/lib/queries.server";
import { authenticator } from "~/lib/services/auth.server";
import { uploadHandler } from "~/lib/services/s3.server";
import { getErrorMessage } from "~/lib/utils/getErrorMessage";
import { searchParamsSchema } from "~/lib/validations";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const search = searchParamsSchema.parse(Object.fromEntries(url.searchParams));

  const transactions = getTransactions(search);
  const allUsers = getNonSensitiveUserInfo();
  const allTransactions = getAllTransactions();
  const [types, statuses] = await Promise.all([
    getPaymentTypes(),
    getTransactionStatuses(),
  ]);

  return defer({ transactions, types, statuses, allUsers, allTransactions });
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler,
  );

  const userId = (
    await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    })
  ).id;

  return namedAction(formData, {
    async deposit() {
      const amount = formData.get("amount")?.toString();
      const proofOfDeposit = formData.get("proofOfDeposit")?.toString();

      if (!amount || !proofOfDeposit) {
        return json(
          {
            success: false,
            message: "Amount and proof of deposit are required",
          },
          { status: 400 },
        );
      }

      if (typeof amount === "string" && isNaN(Number(amount))) {
        return json(
          { success: false, message: "Invalid amount" },
          { status: 400 },
        );
      }

      try {
        await deposit(userId, Number(amount), proofOfDeposit);
        return json({ success: true, message: "Deposit successful" });
      } catch (error) {
        return json(
          {
            success: false,
            message: "Deposit failed: " + getErrorMessage(error),
          },
          { status: 500 },
        );
      }
    },
    async withdraw() {
      const amount = formData.get("amount")?.toString();

      if (!amount) {
        return json(
          { success: false, message: "Amount is required" },
          { status: 400 },
        );
      }

      if (typeof amount === "string" && isNaN(Number(amount))) {
        return json(
          { success: false, message: "Invalid amount" },
          { status: 400 },
        );
      }

      try {
        await withdraw(userId, Number(amount));
        return json({ success: true, message: "Withdrawal successful" });
      } catch (error) {
        return json(
          {
            success: false,
            message: "Withdrawal failed: " + getErrorMessage(error),
          },
          { status: 500 },
        );
      }
    },
    async transfer() {
      const amount = formData.get("amount")?.toString();
      const recipient = formData.get("recipient")?.toString();

      if (!amount || !recipient) {
        return json(
          {
            success: false,
            message: "Amount and recipient are required",
          },
          { status: 400 },
        );
      }

      if (typeof amount === "string" && isNaN(Number(amount))) {
        return json(
          { success: false, message: "Invalid amount" },
          { status: 400 },
        );
      }

      if (recipient.toString() === userId.toString()) {
        return json(
          { success: false, message: "Unable to transfer to yourself" },
          { status: 400 },
        );
      }

      try {
        await transfer(userId, Number(recipient), Number(amount));
        return json({ success: true, message: "Transfer successful" });
      } catch (error) {
        return json(
          {
            success: false,
            message: "Transfer failed: " + getErrorMessage(error),
          },
          { status: 500 },
        );
      }
    },
  });
}

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
          <Await
            resolve={transactions}
            errorElement={
              <div className="flex h-48 items-center justify-center">
                <p className="text-red-500">
                  Error loading transactions, please try again later.
                </p>
              </div>
            }
          >
            {(transactions) => (
              <TransactionsTable
                data={transactions.data}
                pageCount={transactions.pageCount}
              />
            )}
          </Await>
        </Suspense>
      </section>
    </div>
  );
}
