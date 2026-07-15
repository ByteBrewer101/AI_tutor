<<<<<<< HEAD
import React, { useMemo } from 'react';

export function Card({ children, seed = 0, className = '', ...props }) {
  // Deterministic -0.5deg to 0.5deg based on seed
  const rotation = useMemo(() => {
    return ((seed * 37) % 10) / 10 - 0.5;
  }, [seed]);

  return (
    <div
      style={{ transform: `rotate(${rotation}deg)` }}
      className={`bg-paper border border-walnut/20 shadow-[2px_3px_0_rgba(42,36,28,0.06)] p-4 rounded-2xl ${className}`}
      {...props}
    >
      {children}
    </div>
=======
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { liftOnHover } from '../../design/motion';

export default function Card({ children, seed = 0, className = '', ...props }) {
  const shouldReduce = useReducedMotion();
  const rotation = ((seed * 37) % 10) / 10 - 0.5;

  return (
    <motion.div
      {...(shouldReduce ? {} : liftOnHover)}
      style={{ transform: `rotate(${rotation}deg)` }}
      className={`bg-paper border border-walnut/20 shadow-[2px_3px_0_rgba(42,36,28,0.06)]
                   p-6 rounded-[2px] ${className}`}
      {...props}
    >
      {children}
    </motion.div>
>>>>>>> 1634ab3c1a58d388e1710a964a3526d8c4fbd65b
  );
}
