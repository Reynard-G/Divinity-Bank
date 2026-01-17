"use client";

import { ClockIcon, CreditCardIcon, ReceiptTextIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import * as motion from "motion/react-client";

import { cn } from "@/lib/utils/cn";

const iconMap: Record<string, LucideIcon> = {
  "Current Balance": CreditCardIcon,
  "Total Transactions": ReceiptTextIcon,
  "Last Transaction": ClockIcon,
};

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  index?: number;
}

export function StatCard({ title, value, subtitle, index = 0 }: StatCardProps) {
  const Icon = iconMap[title] || CreditCardIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="group relative"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] p-6",
          "transition-colors duration-300",
          "hover:border-white/[0.15] hover:bg-white/[0.04]"
        )}
      >
        {/* Subtle gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />

        {/* Content */}
        <div className="relative">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium tracking-wide text-white/50">
                {title}
              </p>
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1 + 0.2,
                  ease: "easeOut",
                }}
                className="text-3xl font-semibold tracking-tight text-white"
              >
                {value}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1 + 0.1,
              }}
              className={cn(
                "rounded-lg border border-white/[0.06] bg-white/[0.03] p-2.5",
                "transition-all duration-300",
                "group-hover:border-white/[0.1] group-hover:bg-white/[0.05]"
              )}
            >
              <Icon className="h-5 w-5 text-white/40 transition-colors duration-300 group-hover:text-white/60" />
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
            className="mt-3 text-sm text-white/30"
          >
            {subtitle}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
