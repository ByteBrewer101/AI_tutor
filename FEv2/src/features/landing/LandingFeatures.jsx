import { motion } from 'framer-motion'
import { PenTool, Sparkles, RotateCcw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { slideUp, staggerContainer } from '@/design/motion'

const features = [
  {
    icon: PenTool,
    title: 'Margin Notes',
    description:
      'Write in the margins like a real notebook. Your notes accumulate over time, making every chapter feel well-thumbed.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Learning',
    description:
      'Ask questions about any topic, get clear explanations, and save insights back into your notes — all powered by AI.',
  },
  {
    icon: RotateCcw,
    title: 'Spaced Review',
    description:
      'Quiz yourself with flashcards and track what sticks. Your notebook learns what you need to revisit.',
  },
]

function LandingFeatures() {
  return (
    <section id="features" className="border-t border-walnut/10">
      <div className="max-w-[1040px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-12"
        >
          <motion.h2
            variants={slideUp}
            className="font-display text-2xl lg:text-3xl font-medium text-ink mb-3"
          >
            Built for how you actually study
          </motion.h2>
          <motion.p variants={slideUp} className="font-body text-walnut text-base max-w-lg mx-auto">
            Not another flashcard app. A notebook that works the way your brain does.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
          className="grid md:grid-cols-3 gap-6"
        >
          {features.map((f, i) => (
            <motion.div key={f.title} variants={slideUp}>
              <Card seed={i + 10} className="h-full">
                <div className="w-10 h-10 rounded-[3px] bg-pine/10 flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-pine" />
                </div>
                <h3 className="font-display text-lg font-medium text-ink mb-2">
                  {f.title}
                </h3>
                <p className="font-body text-sm text-walnut leading-relaxed">
                  {f.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export { LandingFeatures }
