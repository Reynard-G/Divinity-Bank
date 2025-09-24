import { Badge } from "@/components/ui/badge";
import { TRANSACTION_STATUSES } from "@/lib/constants/transaction-statuses";
import { cn } from "@/lib/utils/cn";

interface TransactionStatusBadgeProps {
  status: string;
  className?: string;
}

export function TransactionStatusBadge({
  status,
  className,
}: TransactionStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case TRANSACTION_STATUSES.SUCCESS:
        return {
          variant: "success" as const,
          label: "Success",
        };
      case TRANSACTION_STATUSES.PENDING:
        return {
          variant: "warning" as const,
          label: "Pending",
        };
      case TRANSACTION_STATUSES.FAILED:
        return {
          variant: "destructive" as const,
          label: "Failed",
        };
      default:
        return {
          variant: "secondary" as const,
          label: status,
        };
    }
  };

  const { variant, label } = getStatusConfig(status);

  return (
    <Badge variant={variant} className={cn("capitalize", className)}>
      {label}
    </Badge>
  );
}
