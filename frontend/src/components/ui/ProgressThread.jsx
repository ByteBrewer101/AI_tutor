import { motion } from 'framer-motion';

export default function ProgressThread({ progress = 0, className = '' }) {
  return (
    <div className={`w-full h-[2px] bg-walnut/15 relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-y-0 left-0 bg-pine"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}
