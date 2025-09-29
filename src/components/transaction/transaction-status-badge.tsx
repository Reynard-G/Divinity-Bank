import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  CircleQuestionMark,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { TRANSACTION_STATUSES } from "@/lib/constants/transaction-statuses";
import { cn } from "@/lib/utils/cn";

interface TransactionStatusBadgeProps {
  status: string;
  className?: string;
}

export const getTransactionStatusConfig = (status: string) => {
  switch (status) {
    case TRANSACTION_STATUSES.SUCCESS:
      return {
        variant: "success" as const,
        label: "Success",
        icon: CheckCircle,
      };
    case TRANSACTION_STATUSES.PENDING:
      return {
        variant: "warning" as const,
        label: "Pending",
        icon: Clock,
      };
    case TRANSACTION_STATUSES.FAILED:
      return {
        variant: "destructive" as const,
        label: "Failed",
        icon: XCircle,
      };
    case TRANSACTION_STATUSES.CANCELLED:
      return {
        variant: "outline" as const,
        label: "Cancelled",
        icon: AlertCircle,
      };
    default:
      return {
        variant: "secondary" as const,
        label: status,
        icon: CircleQuestionMark,
      };
  }
};

export function TransactionStatusBadge({
  status,
  className,
}: TransactionStatusBadgeProps) {
  const { variant, label, icon: Icon } = getTransactionStatusConfig(status);

  return (
    <Badge variant={variant} className={cn("capitalize", className)}>
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Badge>
  );
}
