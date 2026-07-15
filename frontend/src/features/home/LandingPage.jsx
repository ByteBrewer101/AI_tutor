import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import PageShell from '../../components/layout/PageShell';
import Button from '../../components/ui/Button';
import { fadeInUp, staggerList } from '../../design/motion';

export default function LandingPage() {
  const navigate = useNavigate();
  const shouldReduce = useReducedMotion();

  return (
    <PageShell className="flex flex-col items-center justify-center min-h-screen">
      <motion.div 
        {...(shouldReduce ? {} : staggerList)}
        className="max-w-[680px] mx-auto px-6 text-center"
      >
        <motion.h1 
          {...(shouldReduce ? {} : fadeInUp)}
          className="font-display text-3xl text-ink tracking-[0.01em] mb-6"
        >
          The Marginalia
        </motion.h1>
        
        <motion.p 
          {...(shouldReduce ? {} : fadeInUp)}
          className="font-body text-xl text-ink/80 leading-relaxed mb-10"
        >
          A study app that behaves like a notebook you've kept for years, not software you log into. Every screen is a page; every session leaves a mark.
        </motion.p>
        
        <motion.div {...(shouldReduce ? {} : fadeInUp)}>
          <Button 
            variant="primary" 
            className="text-lg px-8 py-3"
            onClick={() => navigate('/home')}
          >
            Get Started
          </Button>
        </motion.div>
      </motion.div>
    </PageShell>
  );
}
