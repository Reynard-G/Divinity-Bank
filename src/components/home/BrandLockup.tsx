"use client";

import { motion, useReducedMotion } from "motion/react";

export function BrandLockup() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="font-anta text-[19px] tracking-[.2em] text-white/[.92]">
        DIVINITY
      </div>
      <div className="mt-[7px] text-[9.5px] font-semibold uppercase tracking-[.24em] text-white/[.38]">
        Commercial Banking
      </div>
    </motion.div>
  );
}
