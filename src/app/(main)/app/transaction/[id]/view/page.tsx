import { notFound } from "next/navigation";

import type { TransactionDirectoryParams } from "@/app/(main)/app/transaction/[id]/layout";
import { TransactionAttachment } from "@/components/transaction/transaction-attachment";
import { TransactionDetailsCard } from "@/components/transaction/transaction-details-card";
import { TransactionHeader } from "@/components/transaction/transaction-header";
import { getTransactionByIdWithDetails } from "@/lib/db/queries/transaction.queries";
import { getCurrentUser } from "@/lib/db/queries/user.queries";
import { getPresignedUrl } from "@/lib/utils/s3";

export default async function TransactionViewPage({
  params,
}: TransactionDirectoryParams) {
  const { id: transactionId } = await params;

  const [user, transaction] = await Promise.all([
    getCurrentUser(),
    getTransactionByIdWithDetails(parseInt(transactionId)),
  ]);

  if (!user || !transaction) notFound();
  if (transaction.user.id !== user.id) notFound(); // Ensure the user owns the transaction & don't reveal its existence

  // Generate pre-signed URL for attachment if it exists
  let attachmentUrl: string | null = null;
  if (transaction.attachment) {
    attachmentUrl = await getPresignedUrl(transaction.attachment, 3600); // 1 hour expiration
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-8 p-6">
      <TransactionHeader transaction={transaction} />

      <div className="space-y-6">
        <TransactionDetailsCard transaction={transaction} />

        {transaction.attachment && attachmentUrl && (
          <TransactionAttachment
            attachmentUrl={attachmentUrl}
            transactionId={transaction.id}
          />
        )}
      </div>
    </div>
  );
}
