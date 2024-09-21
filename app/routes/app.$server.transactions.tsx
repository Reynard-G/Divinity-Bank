import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { Await, defer, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { namedAction } from "remix-utils/named-action";

import { TransactionsTable } from "~/components/DataTable/TransactionsTable";
import { CreateTransactionsDialogFetcherResponse } from "~/components/Dialog/CreateTransactionsDialog";
import { ExportTransactionsDialogFetcherResponse } from "~/components/Dialog/ExportTransactionsDialog";
import { Separator } from "~/components/ui/separator";
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

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const search = searchParamsSchema.parse(Object.fromEntries(url.searchParams));

  if (params.server === undefined) {
    throw new Error("Server is required");
  }

  const userId = (
    await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    })
  ).id;

  const transactions = getTransactions(userId, params.server, search);
  const allUsers = getNonSensitiveUserInfo();
  const allTransactions = getAllTransactions(userId, params.server);
  const [types, statuses] = await Promise.all([
    getPaymentTypes(),
    getTransactionStatuses(),
  ]);

  return defer(
    { transactions, types, statuses, allUsers, allTransactions },
    {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=30",
      },
    },
  );
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler,
  );

  const userId = (
    await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    })
  ).id;

  if (params.server === undefined) {
    throw new Error("Server is required");
  }

  const server = params.server;

  return namedAction(formData, {
    async deposit() {
      const amount = formData.get("amount")?.toString();
      const proofOfDeposit = formData.get("proofOfDeposit")?.toString();

      if (!amount || !proofOfDeposit) {
        return json<CreateTransactionsDialogFetcherResponse>(
          {
            success: false,
            message: "Amount and proof of deposit are required",
          },
          { status: 400 },
        );
      }

      if (typeof amount === "string" && isNaN(Number(amount))) {
        return json<CreateTransactionsDialogFetcherResponse>(
          { success: false, message: "Invalid amount" },
          { status: 400 },
        );
      }

      return deposit(userId, Number(amount), proofOfDeposit, server)
        .then(() =>
          json<CreateTransactionsDialogFetcherResponse>({
            success: true,
            message: "Deposit successful",
          }),
        )
        .catch((error) =>
          json<CreateTransactionsDialogFetcherResponse>(
            {
              success: false,
              message: "Deposit failed: " + getErrorMessage(error),
            },
            { status: 500 },
          ),
        );
    },
    async withdraw() {
      const amount = formData.get("amount")?.toString();

      if (!amount) {
        return json<CreateTransactionsDialogFetcherResponse>(
          { success: false, message: "Amount is required" },
          { status: 400 },
        );
      }

      if (typeof amount === "string" && isNaN(Number(amount))) {
        return json<CreateTransactionsDialogFetcherResponse>(
          { success: false, message: "Invalid amount" },
          { status: 400 },
        );
      }

      return withdraw(userId, Number(amount), server)
        .then(() =>
          json<CreateTransactionsDialogFetcherResponse>({
            success: true,
            message: "Withdrawal successful",
          }),
        )
        .catch((error) =>
          json<CreateTransactionsDialogFetcherResponse>(
            {
              success: false,
              message: "Withdrawal failed: " + getErrorMessage(error),
            },
            { status: 500 },
          ),
        );
    },
    async transfer() {
      const amount = formData.get("amount")?.toString();
      const recipient = formData.get("recipient")?.toString();

      if (!amount || !recipient) {
        return json<CreateTransactionsDialogFetcherResponse>(
          {
            success: false,
            message: "Amount and recipient are required",
          },
          { status: 400 },
        );
      }

      if (typeof amount === "string" && isNaN(Number(amount))) {
        return json<CreateTransactionsDialogFetcherResponse>(
          { success: false, message: "Invalid amount" },
          { status: 400 },
        );
      }

      if (recipient.toString() === userId.toString()) {
        return json<CreateTransactionsDialogFetcherResponse>(
          { success: false, message: "Unable to transfer to yourself" },
          { status: 400 },
        );
      }

      return transfer(userId, Number(recipient), Number(amount), server)
        .then(() =>
          json<CreateTransactionsDialogFetcherResponse>({
            success: true,
            message: "Transfer successful",
          }),
        )
        .catch((error) =>
          json<CreateTransactionsDialogFetcherResponse>(
            {
              success: false,
              message: "Transfer failed: " + getErrorMessage(error),
            },
            { status: 500 },
          ),
        );
    },
    async export() {
      return getAllTransactions(userId, server)
        .then((transactions) =>
          json<ExportTransactionsDialogFetcherResponse>({
            success: true,
            data: transactions,
          }),
        )
        .catch((error) =>
          json<ExportTransactionsDialogFetcherResponse>(
            {
              success: false,
              message: "Export failed: " + getErrorMessage(error),
            },
            { status: 500 },
          ),
        );
    },
  });
}

export default function Transactions() {
  const { transactions } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto flex w-full max-w-7xl grow flex-col">
      <div className="top-0 z-0">
        <div title="Transactions" className="space-y-0.5">
          <h1 className="flex-auto text-2xl font-semibold">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            View and manage your transaction history.
          </p>
        </div>
      </div>

      <Separator className="mb-4 mt-2 lg:mb-6 lg:mt-4" />

      <section className="grid items-center gap-2 pb-8">
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
