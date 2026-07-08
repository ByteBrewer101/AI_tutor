import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { useApp } from '../../hooks/useApp';
import PageShell from '../../components/layout/PageShell';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Stamp from '../../components/ui/Stamp';
import { fadeInUp, staggerList } from '../../design/motion';

export default function LibraryPage() {
  const { state } = useApp();
  const shouldReduce = useReducedMotion();
  const { notebooks } = state;

  return (
    <PageShell>
      <Header />
      <main className="max-w-[1040px] mx-auto pl-16 pr-10 py-10">
        <motion.h1
          {...(shouldReduce ? {} : fadeInUp)}
          className="font-display text-2xl text-ink tracking-[0.01em] mb-8"
        >
          Library
        </motion.h1>

        {notebooks.length === 0 ? (
          <motion.p
            {...(shouldReduce ? {} : fadeInUp)}
            className="font-body text-base text-ink/50 italic"
          >
            This page is still blank — write the first note.
          </motion.p>
        ) : (
          <motion.div
            {...(shouldReduce ? {} : staggerList)}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {notebooks.map((nb) => (
              <motion.div key={nb.id} {...(shouldReduce ? {} : fadeInUp)}>
                <Link to={`/notebook/${nb.id}`} className="block group">
                  <Card seed={nb.id} className="relative">
                    {nb.streak >= 5 && (
                      <div className="absolute -top-2 -right-2">
                        <Stamp>Well-loved</Stamp>
                      </div>
                    )}
                    <h2 className="font-display text-lg text-ink mb-1 tracking-[0.01em] group-hover:text-pine transition-colors duration-150">
                      {nb.title}
                    </h2>
                    <p className="font-body text-sm text-walnut/60 mb-3">{nb.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-body text-sm text-walnut/50">
                        {nb.chapters} chapters · {nb.pageCount} pages
                      </span>
                      <span className="font-mono text-xs text-walnut/40">{nb.lastStudied}</span>
                    </div>
                    {nb.streak > 0 && (
                      <div className="mt-2 flex items-center gap-1.5 text-brass">
                        <span className="font-hand text-sm">Streak</span>
                        <span className="font-mono text-xs">{nb.streak} days</span>
                      </div>
                    )}
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </PageShell>
  );
}
