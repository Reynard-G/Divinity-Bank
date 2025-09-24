import { Badge } from "@/components/ui/badge";
import { TRANSACTION_TYPES } from "@/lib/constants/transaction-types";
import { cn } from "@/lib/utils/cn";

interface TransactionTypeBadgeProps {
  type: string;
  className?: string;
}

export function TransactionTypeBadge({
  type,
  className,
}: TransactionTypeBadgeProps) {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case TRANSACTION_TYPES.CREDIT:
        return {
          variant: "success" as const,
          label: "Credit",
          icon: "+",
        };
      case TRANSACTION_TYPES.DEBIT:
        return {
          variant: "destructive" as const,
          label: "Debit",
          icon: "-",
        };
      default:
        return {
          variant: "secondary" as const,
          label: type,
          icon: "",
        };
    }
  };

  const { variant, label, icon } = getTypeConfig(type);

  return (
    <Badge variant={variant} className={cn("capitalize", className)}>
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </Badge>
  );
}
