import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { pageTurn } from '../design/motion';
import { Button } from '../components/ui/Button';
import { BookOpen } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const shouldReduce = useReducedMotion();

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center max-w-[680px] mx-auto px-10"
      {...(shouldReduce ? {} : pageTurn)}
    >
      <div className="text-center space-y-12">
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center mb-8 text-pine"
          >
            <BookOpen size={48} strokeWidth={1} />
          </motion.div>
          <h1 className="text-3xl text-ink">The Marginalia</h1>
          <p className="text-lg text-ink/80 max-w-md mx-auto">
            A study app that behaves like a notebook you've kept for years, not software you log into. Every session leaves a mark.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Button variant="primary" onClick={() => navigate('/home')} className="text-lg px-8 py-3">
            Open Notebook
          </Button>
        </motion.div>
      </div>
      
      {/* Decorative hairline divider mimicking a page fold or edge */}
      <div className="fixed left-16 top-0 bottom-0 w-px bg-walnut/10 hidden md:block" />
    </motion.div>
  );
}
