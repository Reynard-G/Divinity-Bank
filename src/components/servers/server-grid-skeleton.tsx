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

export function ServerGridSkeleton() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="mb-4">
        <SkeletonPulse className="h-6 w-32" />
      </div>

      {/* Grid skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className={cn(
              "relative overflow-hidden rounded-xl",
              "border border-white/[0.08] bg-white/[0.02] p-6"
            )}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />

            <div className="relative">
              {/* Server name */}
              <SkeletonPulse className="mb-4 h-6 w-32" />

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <SkeletonPulse className="h-4 w-16" />
                  <SkeletonPulse className="h-4 w-20" />
                </div>
                <div className="flex items-center justify-between">
                  <SkeletonPulse className="h-4 w-20" />
                  <SkeletonPulse className="h-4 w-12" />
                </div>
                <div className="flex items-center justify-between">
                  <SkeletonPulse className="h-4 w-20" />
                  <SkeletonPulse className="h-4 w-24" />
                </div>
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                  <SkeletonPulse className="h-4 w-12" />
                  <SkeletonPulse className="h-4 w-16" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
