import CreateTransactionsDialog from "~/components/Dialog/CreateTransactionsDialog";
import ExportTransactionsDialog from "~/components/Dialog/ExportTransactionsDialog";

export function TransactionsTableToolbarActions() {
  return (
    <div className="flex items-center gap-2">
      {/* Create Transaction Dialog */}
      <CreateTransactionsDialog />

      {/* Export Dialog */}
      <ExportTransactionsDialog />
    </div>
  );
}
