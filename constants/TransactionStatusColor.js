import TransactionStatus from '@/constants/TransactionStatus';

export default {
  [TransactionStatus.FAILED]: 'danger',
  [TransactionStatus.PENDING]: 'warning',
  [TransactionStatus.SUCCESS]: 'success',
};
