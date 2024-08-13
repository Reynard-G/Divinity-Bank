import {
  IconAlarm,
  IconCircleCheck,
  IconCircleX,
  IconCoin,
  IconInfoCircle,
  IconTransfer,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";

export function getPaymentTypeIcon(type: string) {
  switch (type) {
    case "DEPOSIT":
      return IconTrendingUp;
    case "WITHDRAW":
      return IconTrendingDown;
    case "TRANSFER":
      return IconTransfer;
    case "INTEREST":
      return IconCoin;
    default:
      return IconInfoCircle;
  }
}

export function getTransactionStatusIcon(status: string) {
  switch (status) {
    case "PENDING":
      return IconAlarm;
    case "SUCCESS":
      return IconCircleCheck;
    case "FAILED":
      return IconCircleX;
    default:
      return IconInfoCircle;
  }
}
