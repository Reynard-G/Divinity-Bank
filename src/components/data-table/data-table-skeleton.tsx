"use client";

import * as motion from "motion/react-client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils/cn";

interface DataTableSkeletonProps extends React.ComponentProps<"div"> {
  columnCount: number;
  rowCount?: number;
  filterCount?: number;
  cellWidths?: string[];
  withViewOptions?: boolean;
  withPagination?: boolean;
  shrinkZero?: boolean;
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 10,
  filterCount = 0,
  cellWidths = ["auto"],
  withViewOptions = true,
  withPagination = true,
  shrinkZero = false,
  className,
}: DataTableSkeletonProps) {
  const cozyCellWidths = Array.from(
    { length: columnCount },
    (_, index) => cellWidths[index % cellWidths.length] ?? "auto"
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("flex w-full flex-col gap-2.5 overflow-auto", className)}
    >
      <div className="flex w-full items-center justify-between gap-2 overflow-auto p-1">
        <div className="flex flex-1 items-center gap-2">
          {filterCount > 0
            ? Array.from({ length: filterCount }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-20 border-dashed bg-white/[0.06]" />
              ))
            : null}
        </div>
        {withViewOptions ? (
          <Skeleton className="ml-auto hidden h-7 w-24 bg-white/[0.06] lg:flex" />
        ) : null}
      </div>
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
        <Table>
          <TableHeader>
            {Array.from({ length: 1 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableHead
                    key={j}
                    style={{
                      width: cozyCellWidths[j],
                      minWidth: shrinkZero ? cozyCellWidths[j] : "auto",
                    }}
                  >
                    <Skeleton className="h-6 w-full bg-white/[0.06]" />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="overflow-hidden">
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i} className="border-b border-white/[0.06]">
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell
                    key={j}
                    style={{
                      width: cozyCellWidths[j],
                      minWidth: shrinkZero ? cozyCellWidths[j] : "auto",
                    }}
                  >
                    <Skeleton className="h-6 w-full bg-white/[0.06]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {withPagination ? (
        <div className="flex flex-col-reverse items-center gap-4 sm:ml-auto sm:flex-row sm:gap-6 lg:gap-8">
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-24 bg-white/[0.06]" />
              <Skeleton className="w-18 h-7 bg-white/[0.06]" />
            </div>
            <div className="flex items-center justify-center text-sm font-medium">
              <Skeleton className="h-7 w-20 bg-white/[0.06]" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="hidden size-7 bg-white/[0.06] lg:block" />
              <Skeleton className="size-7 bg-white/[0.06]" />
              <Skeleton className="size-7 bg-white/[0.06]" />
              <Skeleton className="hidden size-7 bg-white/[0.06] lg:block" />
            </div>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
