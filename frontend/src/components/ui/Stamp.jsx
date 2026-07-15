import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { stampIn } from '../../design/motion';

export default function Stamp({ children, className = '' }) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      {...(shouldReduce ? {} : stampIn)}
      className={`font-hand text-brass border border-brass/60 px-3 py-1 inline-block
                   rounded-[2px] text-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}
