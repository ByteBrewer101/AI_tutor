import { motion } from 'framer-motion'
import { slideUp, staggerContainer } from '@/design/motion'

const testimonials = [
  {
    quote: "I've tried every study app out there. This is the first one that feels like it's actually mine.",
    name: 'Priya S.',
    subject: 'Physics, 3rd year',
  },
  {
    quote: "The margin notes are genius. I open a chapter and see what I was thinking last week — it's like time-travel.",
    name: 'Marcus T.',
    subject: 'History, Masters',
  },
  {
    quote: "I stopped using three other apps after finding this. One notebook, one place, everything connected.",
    name: 'Yuki A.',
    subject: 'Organic Chemistry',
  },
]

const metrics = [
  { value: '2,400+', label: 'students' },
  { value: '18,000', label: 'notes written' },
  { value: '120,000', label: 'questions answered' },
]

function LandingSocialProof() {
  return (
    <section className="border-t border-walnut/10 bg-paper-dark/30">
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
            Trusted by students who care about learning
          </motion.h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={i}
              variants={slideUp}
              className="bg-paper border border-walnut/15 rounded-[2px] p-6 shadow-hard"
              style={{ transform: `rotate(${(i * 37 % 10) / 10 - 0.5}deg)` }}
            >
              <p className="font-body text-base text-ink/80 italic leading-relaxed mb-4">
                "{t.quote}"
              </p>
              <footer>
                <cite className="not-italic">
                  <span className="font-body text-sm font-medium text-ink">{t.name}</span>
                  <span className="block font-mono text-xs text-walnut/50 mt-0.5">{t.subject}</span>
                </cite>
              </footer>
            </motion.blockquote>
          ))}
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-8 lg:gap-16"
        >
          {metrics.map((m) => (
            <motion.div key={m.label} variants={slideUp} className="text-center">
              <div className="font-display text-2xl lg:text-3xl font-medium text-ink">
                {m.value}
              </div>
              <div className="font-mono text-xs text-walnut/50 mt-1">{m.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export { LandingSocialProof }
