import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, MessageCircle, HelpCircle, CheckCircle, Circle } from 'lucide-react'
import { NotebookSpread } from '@/components/layout/NotebookSpread'
import { MarginRail } from '@/components/marginalia/MarginRail'
import { Button } from '@/components/ui/button'
import { Stamp } from '@/components/ui/stamp'
import { inkReveal, pageTurn } from '@/design/motion'
import { cn } from '@/lib/utils'
import * as api from '@/lib/api'

function TopicSession() {
  const { notebookId, topicId } = useParams()
  const [topic, setTopic] = useState(null)
  const [notebook, setNotebook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('read')

  useEffect(() => {
    Promise.all([
      api.fetchTopic(notebookId, topicId),
      api.fetchNotebook(notebookId),
    ]).then(([t, nb]) => {
      setTopic(t)
      setNotebook(nb)
      setLoading(false)
    })
  }, [notebookId, topicId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-48 h-px bg-walnut/20 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-pine animate-[ink-fill_1.5s_ease-out]" style={{ width: '60%' }} />
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="text-center py-20">
        <p className="font-display text-xl text-ink/60">Topic not found</p>
        <Link to={`/app/notebook/${notebookId}`} className="text-pine text-sm mt-4 inline-block">Back to notebook</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <p className="font-mono text-xs text-walnut/50">
          {notebook?.title}
        </p>
      </div>

      <NotebookSpread
        marginRail={<MarginRail topicId={topicId} />}
      >
        <AnimatePresence mode="wait">
          {mode === 'read' && (
            <motion.div
              key="read"
              {...pageTurn}
              className="max-w-[680px]"
            >
              <ReadMode content={topic.content} />
            </motion.div>
          )}
          {mode === 'learn' && (
            <motion.div
              key="learn"
              {...pageTurn}
              className="max-w-[680px]"
            >
              <LearnMode topic={topic} />
            </motion.div>
          )}
          {mode === 'quiz' && (
            <motion.div
              key="quiz"
              {...pageTurn}
              className="max-w-[680px]"
            >
              <QuizMode questions={topic.questions} />
            </motion.div>
          )}
        </AnimatePresence>
      </NotebookSpread>

      <div className="mt-8 flex justify-center">
        <div className="inline-flex bg-paper-dark/50 border border-walnut/15 rounded-[3px] p-1">
          {[
            { id: 'read', label: 'Read', icon: BookOpen },
            { id: 'learn', label: 'Learn', icon: MessageCircle },
            { id: 'quiz', label: 'Questions', icon: HelpCircle },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 text-sm font-body rounded-[2px] transition-colors',
                mode === id
                  ? 'bg-paper text-pine shadow-hard border border-walnut/10'
                  : 'text-walnut hover:text-ink'
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ReadMode({ content }) {
  const paragraphs = content.split('\n\n').filter(Boolean)

  return (
    <article className="prose prose-ink max-w-none">
      {paragraphs.map((p, i) => {
        if (p.startsWith('# ')) {
          return (
            <motion.h1
              key={i}
              {...inkReveal}
              className="font-display text-2xl font-medium text-ink mb-4"
            >
              {p.replace(/^# /, '')}
            </motion.h1>
          )
        }
        if (p.startsWith('## ')) {
          return (
            <motion.h2
              key={i}
              {...inkReveal}
              className="font-display text-xl font-medium text-ink mt-8 mb-3"
            >
              {p.replace(/^## /, '')}
            </motion.h2>
          )
        }
        if (p.startsWith('**') && p.endsWith('**')) {
          return (
            <p key={i} className="font-body text-base text-ink font-medium my-2">
              {p.replace(/\*\*/g, '')}
            </p>
          )
        }
        if (p.startsWith('- ')) {
          const items = p.split('\n').filter(Boolean)
          return (
            <ul key={i} className="space-y-1 my-3 ml-4">
              {items.map((item, j) => (
                <li key={j} className="text-base text-ink/80 list-disc">
                  {item.replace(/^- /, '').replace(/\*\*/g, '')}
                </li>
              ))}
            </ul>
          )
        }
        if (p.startsWith('> ')) {
          return (
            <blockquote
              key={i}
              className="border-l-2 border-walnut/30 pl-4 my-4 text-ink/70 italic"
            >
              {p.replace(/^> /, '')}
            </blockquote>
          )
        }
        if (p.startsWith('$$')) {
          return (
            <div key={i} className="my-4 py-3 px-4 bg-paper-dark/30 rounded-[2px] font-mono text-sm text-ink/70 text-center">
              {p.replace(/\$\$/g, '')}
            </div>
          )
        }
        const isDropCap = i === 0
        return (
          <p key={i} className="font-body text-base text-ink/90 my-3 leading-[1.7]">
            {isDropCap ? (
              <>
                <span className="font-display text-3xl font-medium text-pine float-left mr-2 mt-1 leading-none">
                  {p.charAt(0)}
                </span>
                {p.slice(1)}
              </>
            ) : (
              p.replace(/\*\*/g, '').replace(/`([^`]+)`/g, '<code>$1</code>')
            )}
          </p>
        )
      })}
    </article>
  )
}

function LearnMode({ topic }) {
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: `I can help you understand "${topic.title}". What would you like to know?`,
    },
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    setMessages((prev) => [
      ...prev,
      { id: `user_${Date.now()}`, role: 'user', content: input },
    ])
    setInput('')
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: `This is a placeholder response about "${topic.title}". In the real app, this would be an AI-generated explanation. The backend would stream the response using the LLM.`,
        },
      ])
    }, 500)
  }

  return (
    <div className="flex flex-col h-[60vh]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'p-4 rounded-[2px] text-sm',
              msg.role === 'user'
                ? 'bg-pine/10 text-ink ml-8'
                : 'bg-paper border border-walnut/15 mr-8'
            )}
          >
            <p className="font-body text-base leading-relaxed">{msg.content}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about this topic..."
          className="flex-1 bg-transparent border-b border-walnut/40 focus:border-pine font-body text-base py-2 outline-none placeholder:text-ink/40 transition-colors"
        />
        <Button onClick={handleSend} size="sm">Send</Button>
      </div>
    </div>
  )
}

function QuizMode({ questions }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)

  if (questions.length === 0) {
    return (
      <div className="text-center py-16">
        <HelpCircle size={40} className="mx-auto text-walnut/30 mb-4" />
        <p className="font-display text-xl text-ink/60">No questions yet</p>
        <p className="text-walnut/60 text-sm mt-2">
          Questions will appear here once they're generated.
        </p>
      </div>
    )
  }

  const q = questions[current]

  const handleCheck = () => {
    if (q.type === 'mcq' && selected === q.answer) {
      setScore((s) => s + 1)
    }
    setRevealed(true)
  }

  const handleNext = () => {
    setCurrent((c) => c + 1)
    setSelected(null)
    setRevealed(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="font-mono text-xs text-walnut/50">
          Question {current + 1} of {questions.length}
        </span>
        <span className="font-mono text-xs text-pine">
          Score: {score}/{current + (revealed ? 1 : 0)}
        </span>
      </div>

      <motion.div
        key={current}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <p className="font-body text-lg text-ink mb-6">{q.question}</p>

        {q.type === 'mcq' && (
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => !revealed && setSelected(i)}
                className={cn(
                  'w-full text-left p-3 rounded-[2px] border font-body text-base transition-all',
                  selected === i
                    ? 'border-pine bg-pine/5'
                    : 'border-walnut/20 hover:border-walnut/40',
                  revealed && i === q.answer && 'border-pine bg-pine/10',
                  revealed && selected === i && i !== q.answer && 'border-claret/40 bg-claret/5'
                )}
              >
                <span className="flex items-center gap-3">
                  {selected === i ? (
                    <CheckCircle size={16} className="text-pine shrink-0" />
                  ) : (
                    <Circle size={16} className="text-walnut/30 shrink-0" />
                  )}
                  {opt}
                </span>
              </button>
            ))}
          </div>
        )}

        {q.type === 'open' && (
          <div className="space-y-3">
            <textarea
              placeholder="Write your answer..."
              className="w-full bg-transparent border border-walnut/20 rounded-[2px] p-3 font-body text-base outline-none focus:border-pine min-h-[100px] resize-none"
            />
            {!revealed && (
              <Button onClick={handleCheck} variant="secondary" size="sm">
                Check answer
              </Button>
            )}
          </div>
        )}

        {revealed && q.type !== 'open' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-paper-dark/30 border border-walnut/10 rounded-[2px]"
          >
            <p className="font-body text-sm text-walnut">{q.answer}</p>
          </motion.div>
        )}
      </motion.div>

      <div className="flex justify-between items-center">
        <ProgressDots current={current} total={questions.length} />
        {current < questions.length - 1 ? (
          <Button onClick={handleNext} size="sm">
            Next question
          </Button>
        ) : (
          <div className="text-center">
            <Stamp variant="brass" className="text-lg">
              {score}/{questions.length} correct
            </Stamp>
          </div>
        )}
      </div>
    </div>
  )
}

function ProgressDots({ current, total }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            'w-2 h-2 rounded-full transition-colors',
            i <= current ? 'bg-pine' : 'bg-walnut/20'
          )}
        />
      ))}
    </div>
  )
}

export { TopicSession }
