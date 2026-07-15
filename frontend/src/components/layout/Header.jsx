import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { fadeInUp } from '../../design/motion';

export default function Header() {
  const shouldReduce = useReducedMotion();

  return (
    <motion.header
      {...(shouldReduce ? {} : fadeInUp)}
      className="h-12 px-6 flex items-center justify-between border-b border-walnut/25"
    >
      <Link
        to="/library"
        className="font-body text-walnut hover:text-pine transition-colors duration-150 text-sm underline underline-offset-4 decoration-walnut/30 hover:decoration-pine/60"
      >
        ↺ Library
      </Link>
      <Link to="/" className="font-display text-lg text-ink/80 tracking-[0.01em] hover:text-ink transition-colors duration-150">
        The Marginalia
      </Link>
    </motion.header>
  );
}
