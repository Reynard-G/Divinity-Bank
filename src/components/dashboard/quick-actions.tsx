import Link from "next/link";

import { IconPlus, IconMinus, IconArrowRight } from "@tabler/icons-react";

import { Card, CardContent } from "@/components/ui/card";
import { createServerRoutes } from "@/lib/utils/server-routes";

interface QuickActionsProps {
  serverSlug: string;
}

const quickActions = [
  {
    title: "Make Deposit",
    icon: IconPlus,
    color: "text-green-600",
  },
  {
    title: "Withdraw Funds",
    icon: IconMinus,
    color: "text-red-600",
  },
  {
    title: "Transfer Money",
    icon: IconArrowRight,
    color: "text-blue-600",
  },
];

export function QuickActions({ serverSlug }: QuickActionsProps) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            href={createServerRoutes.transactions(serverSlug)}
          >
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
          </Link>
        ))}
      </div>
    </div>
  );
}
