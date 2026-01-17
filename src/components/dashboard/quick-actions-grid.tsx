"use client";

import { forwardRef } from "react";
import type { ReactElement } from "react";

import { ArrowRightLeftIcon, MinusIcon, PlusIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import * as motion from "motion/react-client";

import { cn } from "@/lib/utils/cn";

const iconMap: Record<string, LucideIcon> = {
  "Make Deposit": PlusIcon,
  "Withdraw Funds": MinusIcon,
  "Transfer Money": ArrowRightLeftIcon,
};

interface QuickActionsGridProps {
  depositDialog: ReactElement;
  withdrawDialog: ReactElement;
  transferDialog: ReactElement;
}

export function QuickActionsGrid({
  depositDialog,
  withdrawDialog,
  transferDialog,
}: QuickActionsGridProps) {
  const dialogs = [depositDialog, withdrawDialog, transferDialog];

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.25,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        <h2 className="text-lg font-medium text-white/80">Quick Actions</h2>
      </motion.div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {dialogs.map((dialog, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.3 + index * 0.08,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            {dialog}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

interface ActionCardContentProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  action: {
    title: string;
    description: string;
  };
}

export const ActionCardContent = forwardRef<
  HTMLButtonElement,
  ActionCardContentProps
>(({ action, className, ...props }, ref) => {
  const Icon = iconMap[action.title] || PlusIcon;

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "group relative w-full cursor-pointer overflow-hidden rounded-xl text-left",
        "border border-white/[0.08] bg-white/[0.02]",
        "transition-colors duration-300",
        "hover:border-white/[0.15] hover:bg-white/[0.04]",
        className
      )}
      {...props}
    >
      {/* Gradient hover effect */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          "bg-gradient-to-br from-white/[0.03] via-transparent to-transparent",
          "opacity-0 transition-opacity duration-300",
          "group-hover:opacity-100"
        )}
      />

      <div className="relative flex items-center gap-4 p-5">
        {/* Icon container */}
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
            "border border-white/[0.06] bg-white/[0.03]",
            "transition-all duration-300",
            "group-hover:border-white/[0.1] group-hover:bg-white/[0.06]"
          )}
        >
          <Icon className="h-5 w-5 text-white/50 transition-colors duration-300 group-hover:text-white/80" />
        </div>

        {/* Text content */}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-white/90 transition-colors duration-300 group-hover:text-white">
            {action.title}
          </p>
          <p className="mt-0.5 text-sm text-white/40 transition-colors duration-300 group-hover:text-white/50">
            {action.description}
          </p>
        </div>

        {/* Arrow indicator */}
        <div className="text-white/30">
          <svg
            className="h-5 w-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </div>
      </div>
    </button>
  );
});

ActionCardContent.displayName = "ActionCardContent";
