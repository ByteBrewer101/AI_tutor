import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Stamp } from '@/components/ui/stamp'
import { slideUp, staggerContainer } from '@/design/motion'

function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-[1040px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <motion.div variants={slideUp}>
              <Stamp variant="brass" className="mb-4 text-xs">est. 2025</Stamp>
            </motion.div>

            <motion.h1
              variants={slideUp}
              className="font-display text-4xl lg:text-5xl font-semibold text-ink leading-tight mb-4"
            >
              The Marginalia
            </motion.h1>

            <motion.p
              variants={slideUp}
              className="font-body text-lg text-walnut leading-relaxed mb-8 max-w-md"
            >
              A study journal that ages with you. Write in the margins,
              ask the AI, quiz yourself — and watch the notebook fill with your own hand.
            </motion.p>

            <motion.div variants={slideUp} className="flex gap-4">
              <Link
                to="/app"
                className="inline-flex items-center gap-2 bg-pine text-paper border border-pine rounded-[3px] px-6 py-3 font-body text-base hover:bg-pine/90 transition-colors no-underline"
              >
                Start studying
                <ArrowRight size={16} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 text-pine underline underline-offset-4 decoration-pine/40 hover:decoration-pine font-body text-base transition-colors"
              >
                See how it works
              </a>
            </motion.div>
          </motion.div>

          {/* Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 20, rotate: 1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative">
              {/* Main card mockup */}
              <Card seed={42} className="p-8 relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-pine/40" />
                  <div className="w-2 h-2 rounded-full bg-walnut/20" />
                  <div className="w-2 h-2 rounded-full bg-walnut/20" />
                  <span className="ml-auto font-mono text-xs text-walnut/40">Ch. 4</span>
                </div>

                <h3 className="font-display text-xl font-medium text-ink mb-3">
                  The Second Law
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="h-2 bg-ink/8 rounded-full w-full" />
                  <div className="h-2 bg-ink/8 rounded-full w-11/12" />
                  <div className="h-2 bg-ink/8 rounded-full w-4/5" />
                  <div className="h-2 bg-ink/8 rounded-full w-full" />
                  <div className="h-2 bg-ink/8 rounded-full w-9/12" />
                </div>

                <div className="border-l-2 border-pine/30 pl-3 py-1 mb-3">
                  <div className="h-2 bg-pine/10 rounded-full w-3/4" />
                  <div className="h-2 bg-pine/10 rounded-full w-1/2 mt-1" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-block px-2 py-0.5 bg-pine/10 text-pine text-xs rounded-[2px] font-mono">
                    4/12
                  </span>
                  <span className="inline-block px-2 py-0.5 bg-brass/10 text-brass text-xs rounded-[2px] font-hand rotate-[-2deg]">
                    reviewing
                  </span>
                </div>
              </Card>

              {/* Margin note mockup */}
              <div className="absolute -right-4 top-12 hidden lg:block">
                <div
                  className="bg-paper border border-walnut/15 rounded-[2px] px-3 py-2 shadow-hard max-w-[140px]"
                  style={{ transform: 'rotate(1.5deg)' }}
                >
                  <p className="font-hand text-sm text-ink/70 leading-snug">
                    review w/ Prof. Tue
                  </p>
                  <span className="font-mono text-[9px] text-walnut/30">Jul 10</span>
                </div>
              </div>

              {/* Coffee ring */}
              <svg
                className="absolute -top-6 -right-6 opacity-[0.05] pointer-events-none"
                width="90"
                height="90"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                <circle cx="50" cy="50" r="40" fill="none" style={{ stroke: 'var(--color-walnut)' }} strokeWidth="3" strokeDasharray="8 3 15 4" />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export { LandingHero }
