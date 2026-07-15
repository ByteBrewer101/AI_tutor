import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { pageTurn } from '../../design/motion';

export default function PageShell({ children, className = '' }) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      {...(shouldReduce ? {} : pageTurn)}
      className={`min-h-screen relative ${className}`}
    >
      <div className="noise-overlay" aria-hidden="true">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>
      {children}
    </motion.div>
  );
}
