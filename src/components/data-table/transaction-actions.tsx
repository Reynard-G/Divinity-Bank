"use client";

import { MoreHorizontal, Eye, X } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TRANSACTION_STATUSES } from "@/lib/constants/transaction-statuses";
import { cancelTransaction } from "@/lib/db/actions/transaction.actions";
import type { TransactionWithDetails } from "@/lib/db/queries/transaction.queries";

interface TransactionActionsProps {
  transaction: TransactionWithDetails;
}

export function TransactionActions({ transaction }: TransactionActionsProps) {
  const router = useRouter();
  const isPending = transaction.status === TRANSACTION_STATUSES.PENDING;

  const handleView = () => {
    router.push(`/app/transaction/${transaction.id}/view`);
  };

  const handleCancel = async () => {
    try {
      const result = await cancelTransaction(transaction.id);

      if (result.success) {
        toast.success("Success!", {
          description: result.message,
        });
      } else {
        toast.error("Error", {
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Cancel transaction error:", error);

      toast.error("Error", {
        description: "An unexpected error has occurred.",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open actions menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleView}>
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        {isPending && (
          <DropdownMenuItem onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
