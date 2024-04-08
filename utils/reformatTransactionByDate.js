/**
 * Reformats an array of transactions by grouping them based on their date.
 *
 * @param {Array} transactions - The array of transactions to be reformatted.
 * @returns {Array} - The reformatted array of transactions grouped by date.
 */
export default function reformatTransactionByDate(transactions) {
  const reformattedData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.created_at * 1000);
    const now = new Date();

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    const daysDifference = Math.round(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    let formattedDate;

    if (daysDifference === 0) {
      formattedDate = 'Today';
    } else if (daysDifference === 1) {
      formattedDate = 'Yesterday';
    } else if (daysDifference < 7) {
      formattedDate = rtf.format(-daysDifference, 'day');
    } else {
      formattedDate = date.toISOString().split('T')[0];
    }

    const existingEntry = acc.find((entry) => entry.dateTime === formattedDate);

    if (existingEntry) {
      existingEntry.transactions.push(transaction);
    } else {
      acc.push({ dateTime: formattedDate, transactions: [transaction] });
    }

    return acc;
  }, []);

  return reformattedData;
}
