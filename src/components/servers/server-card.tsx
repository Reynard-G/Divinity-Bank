"use client";

import Image from "next/image";

import * as motion from "motion/react-client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

interface ServerCardProps {
  name: string;
  bannerLink: string;
  isCurrent: boolean;
  balance: string;
  transactionCount: number;
  lastActivity: string;
  index?: number;
}

export function ServerCard({
  name,
  bannerLink,
  isCurrent,
  balance,
  transactionCount,
  lastActivity,
  index = 0,
}: ServerCardProps) {
  const isActive = transactionCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.2 + index * 0.08,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="group relative"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-xl",
          "border border-white/[0.08] bg-white/[0.02]",
          "transition-colors duration-300",
          "hover:border-white/[0.15] hover:bg-white/[0.04]",
          isCurrent && "border-white/20"
        )}
      >
        {/* Image background - shows on hover */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-20">
          <Image
            src={bannerLink}
            alt={`${name} banner`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
        </div>

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />

        {/* Current badge */}
        {isCurrent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 + index * 0.08 + 0.2 }}
            className="absolute right-3 top-3 z-10"
          >
            <Badge className="border-white/10 bg-white/10 text-white/80">
              Current
            </Badge>
          </motion.div>
        )}

        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Server name */}
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 + index * 0.08 + 0.1 }}
            className="mb-4 text-lg font-semibold text-white"
          >
            {name}
          </motion.h3>

          {/* Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Balance</span>
              <span className="font-mono text-sm text-white/90">{balance}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Transactions</span>
              <span className="font-mono text-sm text-white/90">
                {transactionCount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Last Activity</span>
              <span className="text-sm text-white/60">{lastActivity}</span>
            </div>

            {/* Status indicator */}
            <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
              <span className="text-sm text-white/50">Status</span>
              <div className="flex items-center gap-2">
                {isActive ? (
                  <>
                    <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    <span className="text-sm text-emerald-400">Active</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-white/30" />
                    <span className="text-sm text-white/40">Inactive</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
