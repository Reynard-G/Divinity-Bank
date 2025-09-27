import { IconPlus, IconMinus, IconArrowRight } from "@tabler/icons-react";

import { CreateDepositDialog } from "@/components/dialog/CreateDepositDialog";
import { CreateTransferDialog } from "@/components/dialog/CreateTransferDialog";
import { CreateWithdrawDialog } from "@/components/dialog/CreateWithdrawDialog";
import { Card, CardContent } from "@/components/ui/card";
import { getServerByShortName } from "@/lib/db/queries/server.queries";

interface QuickActionsProps {
  serverSlug: string;
}

const quickActions = [
  {
    title: "Make Deposit",
    icon: IconPlus,
    color: "text-green-600",
    component: CreateDepositDialog,
  },
  {
    title: "Withdraw Funds",
    icon: IconMinus,
    color: "text-red-600",
    component: CreateWithdrawDialog,
  },
  {
    title: "Transfer Money",
    icon: IconArrowRight,
    color: "text-blue-600",
    component: CreateTransferDialog,
  },
];

export async function QuickActions({ serverSlug }: QuickActionsProps) {
  const server = await getServerByShortName(serverSlug);

  if (!server) {
    return null;
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {quickActions.map((action) => {
          const DialogComponent = action.component;

          return (
            <DialogComponent key={action.title} serverId={server.id}>
              <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center justify-center p-6">
                  <div className="text-center">
                    <action.icon
                      className={`mx-auto mb-2 h-8 w-8 ${action.color}`}
                    />
                    <p className="text-sm font-medium">{action.title}</p>
                  </div>
                </CardContent>
              </Card>
            </DialogComponent>
          );
        })}
      </div>
    </div>
  );
}
