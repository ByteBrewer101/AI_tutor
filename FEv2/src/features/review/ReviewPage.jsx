import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, RotateCcw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { slideUp, staggerContainer, inkReveal } from '@/design/motion'
import { getNotebooks } from '@/lib/mockData'

function ReviewPage() {
  const [view, setView] = useState('notes')
  const notebooks = getNotebooks()
  const allNotes = notebooks.flatMap((nb) =>
    nb.topics.flatMap((t) =>
      t.userNotes.map((n) => ({ ...n, topicTitle: t.title, notebookTitle: nb.title }))
    )
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const allQuestions = notebooks.flatMap((nb) =>
    nb.topics.flatMap((t) =>
      t.questions.map((q) => ({ ...q, topicTitle: t.title }))
    )
  )

  return (
    <div>
      <h2 className="font-display text-2xl font-medium text-ink mb-6">
        Review
      </h2>

      <div className="flex gap-4 mb-8">
        <Button
          variant={view === 'notes' ? 'primary' : 'ghost'}
          onClick={() => setView('notes')}
        >
          <BookOpen size={14} />
          Notes Review
        </Button>
        <Button
          variant={view === 'flashcards' ? 'primary' : 'ghost'}
          onClick={() => setView('flashcards')}
        >
          <RotateCcw size={14} />
          Flashcards
        </Button>
      </div>

      {view === 'notes' && (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          {allNotes.length === 0 && (
            <div className="text-center py-16">
              <p className="font-display text-xl text-ink/60">No notes to review yet</p>
              <p className="text-walnut/60 text-sm mt-2">
                Add margin notes while reading, and they'll appear here.
              </p>
            </div>
          )}
          {allNotes.map((note) => (
            <motion.div key={note.id} variants={slideUp}>
              <Card seed={note.id.charCodeAt(5)}>
                <p className="font-hand text-base text-ink/80 mb-2">{note.text}</p>
                <div className="flex items-center gap-2 text-xs text-walnut/50 font-mono">
                  <span>{note.topicTitle}</span>
                  <span>·</span>
                  <span>{note.notebookTitle}</span>
                  <span>·</span>
                  <span>{new Date(note.timestamp).toLocaleDateString()}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {view === 'flashcards' && (
        <FlashcardDeck questions={allQuestions} />
      )}
    </div>
  )
}

function FlashcardDeck({ questions }) {
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [score, setScore] = useState(0)

  if (questions.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-display text-xl text-ink/60">No flashcards yet</p>
        <p className="text-walnut/60 text-sm mt-2">
          Questions from your study sessions will appear here.
        </p>
      </div>
    )
  }

  const q = questions[current]

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <span className="font-mono text-xs text-walnut/50">
          Card {current + 1} of {questions.length}
        </span>
        <span className="font-mono text-xs text-pine">
          Score: {score}
        </span>
      </div>

      <motion.div
        key={current}
        initial={{ opacity: 0, rotateY: -10 }}
        animate={{ opacity: 1, rotateY: 0 }}
        className="cursor-pointer"
        onClick={() => setFlipped(!flipped)}
        style={{ perspective: '1000px' }}
      >
        <Card seed={q.id.charCodeAt(3)} className="min-h-[200px] flex items-center justify-center text-center p-8">
          {!flipped ? (
            <div>
              <p className="font-body text-lg text-ink">{q.question}</p>
              <p className="text-xs text-walnut/40 mt-4 font-mono">Click to reveal answer</p>
            </div>
          ) : (
            <motion.div {...inkReveal}>
              <p className="font-body text-base text-ink/80">
                {q.type === 'mcq' ? q.options[q.answer] : q.answer}
              </p>
            </motion.div>
          )}
        </Card>
      </motion.div>

      <div className="flex justify-center gap-4 mt-6">
        {flipped && (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setCurrent((c) => (c + 1) % questions.length)
                setFlipped(false)
              }}
            >
              Skip
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setScore((s) => s + 1)
                setCurrent((c) => (c + 1) % questions.length)
                setFlipped(false)
              }}
            >
              Got it right
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export { ReviewPage }
