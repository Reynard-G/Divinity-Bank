"use client";

import * as motion from "motion/react-client";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="text-3xl font-semibold tracking-tight text-white"
        >
          {title}
        </motion.h1>
        {children}
      </div>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.1,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="mt-1 text-white/50"
        >
          {description}
        </motion.p>
      )}

      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{
          duration: 0.6,
          delay: 0.15,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className="mt-6 h-px origin-left bg-gradient-to-r from-white/10 via-white/5 to-transparent"
      />
    </div>
  );
}
