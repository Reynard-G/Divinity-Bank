import { Link } from "@remix-run/react";
import { IconServer } from "@tabler/icons-react";
import { useState } from "react";

import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils/cn";
import { formatCurrency } from "~/lib/utils/formatCurrency";
import { getRelativeTimeString } from "~/lib/utils/getRelativeTimeString";

interface AdminServerSelectionCardProps {
  selectedServer: boolean;
  serverName: string;
  serverShortName?: string | undefined;
  serverBannerImage: string;

  /**
   * If the server balance is `undefined`, it means the balance is still loading.
   * If the server balance is `null`, it means the balance is not available.
   * If the server balance is a number, it means the balance is available.
   */
  totalServerBalance: number | undefined | null;
  totalTransactionsAmount: number | undefined | null;
  lastTransactionDate: Date | undefined | null;

  onClick?: () => void;
}

export default function AdminServerSelectionCard({
  selectedServer,
  serverName,
  serverShortName,
  serverBannerImage,
  totalServerBalance,
  totalTransactionsAmount,
  lastTransactionDate,
  ...props
}: AdminServerSelectionCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card
      className="group relative h-36 cursor-pointer overflow-hidden rounded-lg border border-[#3d3d43] bg-background !p-0 transition-all hover:shadow-lg"
      {...props}
    >
      <Link
        to={`/app/${serverShortName}/dashboard`}
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
                selectedServer && "brightness-75 grayscale-0",
                imageLoaded
                  ? "opacity-100 duration-500 animate-in fade-in"
                  : "opacity-0",
              )}
              onLoad={() => setImageLoaded(true)}
              ref={(img) => {
                if (img && img.complete) setImageLoaded(true);
              }}
            />
          </div>
        </div>
        <div className="relative z-20 flex items-center gap-2">
          <IconServer size={24} aria-hidden="true" />
          <h3 className="text-lg font-bold">{serverName}</h3>
        </div>
        <div className="relative z-20 flex items-center gap-2">
          {totalServerBalance === undefined ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <span className="text-sm font-medium text-[#ededed]">
              {totalServerBalance === null
                ? "N/A"
                : formatCurrency(totalServerBalance)}
            </span>
          )}
        </div>
      </div>

      <div className="p-3">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-normal text-[#ededed]">
              Total Transactions
            </span>
            {totalTransactionsAmount === undefined ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              <span className="text-sm font-normal text-[#ededed]">
                {totalTransactionsAmount === null
                  ? "N/A"
                  : totalTransactionsAmount}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-normal text-[#ededed]">
              Last Transaction
            </span>
            {lastTransactionDate === undefined ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <span className="text-sm font-normal text-[#ededed]">
                {lastTransactionDate === null
                  ? "N/A"
                  : getRelativeTimeString(lastTransactionDate)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
