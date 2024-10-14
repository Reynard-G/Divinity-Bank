import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  type TypedResponse,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { Await, defer, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { namedAction } from "remix-utils/named-action";

import { TransactionsTable } from "~/components/DataTable/TransactionsTable";
import { Separator } from "~/components/ui/separator";
import { SpokeSpinner } from "~/components/ui/spinner";
import { Transaction } from "~/lib/db/schema";
import {
  getAllTransactions,
  getNonSensitiveUserInfo,
  getPaymentTypes,
  getTransactions,
  getTransactionStatuses,
} from "~/lib/get.queries.server";
import { deposit, transfer, withdraw } from "~/lib/post.queries.server";
import { authenticator } from "~/lib/services/auth.server";
import { uploadHandler } from "~/lib/services/s3.server";
import { getErrorMessage } from "~/lib/utils/getErrorMessage";
import { searchParamsSchema } from "~/lib/validations";

export type DepositActionData = { success: boolean; message: string };
export type WithdrawActionData = { success: boolean; message: string };
export type TransferActionData = { success: boolean; message: string };
export type ExportActionData = {
  success: boolean;
  message: string;
  data?: Transaction[];
};

type ActionData =
  | DepositActionData
  | WithdrawActionData
  | TransferActionData
  | ExportActionData;

export type ActionReturn = TypedResponse<ActionData>;

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
  const [types, statuses] = await Promise.all([
    getPaymentTypes(),
    getTransactionStatuses(),
  ]);

  return defer(
    { transactions, types, statuses, allUsers },
    {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=30", // 30 seconds
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

  return namedAction(request, {
    async deposit(): Promise<ActionReturn> {
      const amount = formData.get("amount")?.toString();
      const proofOfDeposit = formData.get("proofOfDeposit")?.toString();

      if (!amount || !proofOfDeposit) {
        return json<DepositActionData>(
          {
            success: false,
            message: "Amount and proof of deposit are required",
          },
          { status: 400 },
        );
      }

      if (typeof amount === "string" && isNaN(Number(amount))) {
        return json<DepositActionData>(
          { success: false, message: "Invalid amount" },
          { status: 400 },
        );
      }

      return deposit(userId, Number(amount), proofOfDeposit, server)
        .then(() =>
          json<DepositActionData>({
            success: true,
            message: "Deposit successful",
          }),
        )
        .catch((error) =>
          json<DepositActionData>(
            {
              success: false,
              message: "Deposit failed: " + getErrorMessage(error),
            },
            { status: 500 },
          ),
        );
    },
    async withdraw(): Promise<ActionReturn> {
      const amount = formData.get("amount")?.toString();

      if (!amount) {
        return json<WithdrawActionData>(
          { success: false, message: "Amount is required" },
          { status: 400 },
        );
      }

      if (typeof amount === "string" && isNaN(Number(amount))) {
        return json<WithdrawActionData>(
          { success: false, message: "Invalid amount" },
          { status: 400 },
        );
      }

      return withdraw(userId, Number(amount), server)
        .then(() =>
          json<WithdrawActionData>({
            success: true,
            message: "Withdrawal successful",
          }),
        )
        .catch((error) =>
          json<WithdrawActionData>(
            {
              success: false,
              message: "Withdrawal failed: " + getErrorMessage(error),
            },
            { status: 500 },
          ),
        );
    },
    async transfer(): Promise<ActionReturn> {
      const amount = formData.get("amount")?.toString();
      const recipient = formData.get("recipient")?.toString();

      if (!amount || !recipient) {
        return json<TransferActionData>(
          {
            success: false,
            message: "Amount and recipient are required",
          },
          { status: 400 },
        );
      }

      if (typeof amount === "string" && isNaN(Number(amount))) {
        return json<TransferActionData>(
          { success: false, message: "Invalid amount" },
          { status: 400 },
        );
      }

      if (recipient.toString() === userId.toString()) {
        return json<TransferActionData>(
          { success: false, message: "Unable to transfer to yourself" },
          { status: 400 },
        );
      }

      return transfer(userId, Number(recipient), Number(amount), server)
        .then(() =>
          json<TransferActionData>({
            success: true,
            message: "Transfer successful",
          }),
        )
        .catch((error) =>
          json<TransferActionData>(
            {
              success: false,
              message: "Transfer failed: " + getErrorMessage(error),
            },
            { status: 500 },
          ),
        );
    },
    async export(): Promise<ActionReturn> {
      return getAllTransactions(userId, server)
        .then((transactions) =>
          json<ExportActionData>({
            success: true,
            message: "Exported transactions successfully",
            data: transactions,
          }),
        )
        .catch((error) =>
          json<ExportActionData>(
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
