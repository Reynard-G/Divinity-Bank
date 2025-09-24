"use client";

import Image from "next/image";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface TransactionAttachmentProps {
  attachmentUrl: string;
  transactionId: number;
}

export function TransactionAttachment({
  attachmentUrl,
  transactionId,
}: TransactionAttachmentProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attachment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mx-auto flex max-w-2xl items-center justify-center">
          {!hasError ? (
            <Image
              unoptimized
              src={attachmentUrl}
              alt={`Transaction #${transactionId} attachment`}
              width={0}
              height={0}
              className="h-auto w-auto rounded-lg border shadow-sm"
              priority
              onError={() => setHasError(true)}
            />
          ) : (
            <div className="flex items-center justify-center rounded-lg border p-8 text-muted-foreground">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span>Unable to load attachment</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
