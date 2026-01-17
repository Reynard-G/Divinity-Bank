"use client";

import * as motion from "motion/react-client";

export function ServerGridHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: 0.15,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="mb-4"
    >
      <h2 className="text-lg font-medium text-white/80">Your Servers</h2>
    </motion.div>
  );
}
