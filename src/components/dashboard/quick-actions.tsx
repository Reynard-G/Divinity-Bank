import {
  QuickActionsGrid,
  ActionCardContent,
} from "@/components/dashboard/quick-actions-grid";
import { CreateDepositDialog } from "@/components/dialog/create-deposit-dialog";
import { CreateTransferDialog } from "@/components/dialog/create-transfer-dialog";
import { CreateWithdrawDialog } from "@/components/dialog/create-withdraw-dialog";
import { getServerByShortName } from "@/lib/db/queries/server.queries";

interface QuickActionsProps {
  serverSlug: string;
}

const actions = {
  deposit: {
    title: "Make Deposit",
    description: "Add funds to your account",
  },
  withdraw: {
    title: "Withdraw Funds",
    description: "Take out funds from your account",
  },
  transfer: {
    title: "Transfer Money",
    description: "Send funds to another user",
  },
};

export async function QuickActions({ serverSlug }: QuickActionsProps) {
  const server = await getServerByShortName(serverSlug);

  if (!server) {
    return null;
  }

  return (
    <QuickActionsGrid
      depositDialog={
        <CreateDepositDialog serverId={server.id}>
          <ActionCardContent action={actions.deposit} />
        </CreateDepositDialog>
      }
      withdrawDialog={
        <CreateWithdrawDialog serverId={server.id}>
          <ActionCardContent action={actions.withdraw} />
        </CreateWithdrawDialog>
      }
      transferDialog={
        <CreateTransferDialog serverId={server.id}>
          <ActionCardContent action={actions.transfer} />
        </CreateTransferDialog>
      }
    />
  );
}
