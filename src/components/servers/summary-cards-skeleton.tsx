"use client";

import * as motion from "motion/react-client";

import { cn } from "@/lib/utils/cn";

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={cn("rounded-md bg-white/[0.06]", className)}
    />
  );
}

export function SummaryCardsSkeleton() {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-3">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className={cn(
            "relative overflow-hidden rounded-xl",
            "border border-white/[0.08] bg-white/[0.02] p-6"
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />

          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-8 w-32" />
              </div>
              <SkeletonPulse className="h-10 w-10 rounded-lg" />
            </div>
            <SkeletonPulse className="mt-4 h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
