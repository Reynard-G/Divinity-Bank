import { useState } from "react";
import { Link } from "@remix-run/react";
import { IconServer } from "@tabler/icons-react";

import { Card } from "~/components/ui/card";
import { getRelativeTimeString } from "~/lib/utils/getRelativeTimeString";
import { formatCurrency } from "~/lib/utils/formatCurrency";
import { cn } from "~/lib/utils/cn";

interface ServerSelectionCardProps {
  serverName: string;
  serverBannerImage: string;
  serverBalance: string;
  transactionsAmount: number;
  lastTransactionDate: Date;
}

export default function ServerSelectionCard({
  serverName,
  serverBannerImage,
  serverBalance,
  transactionsAmount,
  lastTransactionDate,
}: ServerSelectionCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card className="group relative cursor-pointer overflow-hidden rounded-lg border border-[#3d3d43] bg-background !p-0 transition-all hover:shadow-lg">
      <Link
        to="/app/dashboard"
        className="absolute inset-0 z-10"
        prefetch="intent"
      >
        <span className="sr-only">View Server</span>
      </Link>

      <div className="relative flex items-center justify-between border-b border-[#3d3d43] p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 scale-[1.02] transition-transform duration-300 ease-in-out group-hover:scale-125">
            <img
              src={serverBannerImage}
              alt="Server background"
              className={cn(
                "h-full w-full object-cover object-center brightness-50 grayscale",
                imageLoaded && "duration-500 animate-in fade-in",
              )}
              onLoad={() => setImageLoaded(true)}
            />
          </div>
        </div>
        <div className="relative z-20 flex items-center gap-2">
          <IconServer size={24} aria-hidden="true" />
          <h3 className="text-lg font-bold">{serverName}</h3>
        </div>
        <div className="relative z-20 flex items-center gap-2">
          <span className="text-sm font-medium text-[#ededed]">
            {formatCurrency(parseFloat(serverBalance))}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-normal text-[#ededed]">
              Transactions
            </span>
            <span className="text-sm font-normal text-[#ededed]">
              {transactionsAmount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-normal text-[#ededed]">
              Last Transaction
            </span>
            <span className="text-sm font-normal text-[#ededed]">
              {getRelativeTimeString(lastTransactionDate)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
