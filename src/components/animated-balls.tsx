"use client";

import { motion, useReducedMotion } from "motion/react";

export function AnimatedBalls({
  numbers,
  euroNumbers = [],
  className,
}: {
  numbers: number[];
  euroNumbers?: number[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const all = [
    ...numbers.map((n) => ({ value: n, euro: false })),
    ...euroNumbers.map((n) => ({ value: n, euro: true })),
  ];

  return (
    <div className={className}>
      {all.map((ball, index) => (
        <motion.span
          key={`${ball.euro ? "e" : "n"}-${index}`}
          className={`number-ball${ball.euro ? " euro-ball" : ""}`}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.6 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={
            reduce
              ? { duration: 0.2, delay: index * 0.04 }
              : { type: "spring", stiffness: 500, damping: 18, delay: index * 0.08 }
          }
        >
          {ball.value}
        </motion.span>
      ))}
    </div>
  );
}
