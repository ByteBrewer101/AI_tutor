import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { inkReveal } from '../../design/motion';

export default function MarginNote({ text, rotation = 0, top = 0, className = '' }) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      {...(shouldReduce ? {} : inkReveal)}
      style={{
        transform: `rotate(${rotation}deg)`,
        top: `${top}px`,
      }}
      className={`absolute right-0 font-hand text-sm text-ink/70 leading-snug
                   max-w-[160px] px-2 py-1 border-l-2 border-claret/30
                   bg-paper/80 ${className}`}
    >
      {text}
    </motion.div>
  );
}
