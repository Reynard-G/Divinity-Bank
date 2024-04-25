import TransactionType from '@/constants/TransactionType';

export default function formatCurrency(
  amount,
  transactionType = TransactionType.CREDIT,
) {
  const numberAmount = Number(amount);
  const finalAmount =
    transactionType === TransactionType.CREDIT ? numberAmount : -numberAmount;

  return Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(finalAmount);
}
