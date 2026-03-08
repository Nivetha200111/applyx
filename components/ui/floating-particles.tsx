"use client";

import { motion, useReducedMotion } from "framer-motion";

const particles = [
  { x: "10%", y: "20%", size: 6, delay: 0, duration: 8 },
  { x: "25%", y: "60%", size: 4, delay: 1.2, duration: 10 },
  { x: "45%", y: "30%", size: 8, delay: 0.6, duration: 12 },
  { x: "65%", y: "70%", size: 5, delay: 2.1, duration: 9 },
  { x: "80%", y: "15%", size: 7, delay: 0.3, duration: 11 },
  { x: "90%", y: "50%", size: 4, delay: 1.8, duration: 7 },
  { x: "35%", y: "85%", size: 6, delay: 0.9, duration: 13 },
  { x: "55%", y: "10%", size: 5, delay: 1.5, duration: 8.5 },
  { x: "15%", y: "45%", size: 3, delay: 2.4, duration: 10.5 },
  { x: "75%", y: "40%", size: 4, delay: 0.7, duration: 9.5 },
];

export function FloatingParticles() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/20 dark:bg-primary/15"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0, 20, 0],
            x: [0, 15, -10, 5, 0],
            opacity: [0.3, 0.7, 0.4, 0.8, 0.3],
            scale: [1, 1.3, 0.9, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
