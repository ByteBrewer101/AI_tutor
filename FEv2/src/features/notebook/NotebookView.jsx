import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, MessageCircle, HelpCircle, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InkTextarea } from '@/components/ui/input'
import { Stamp } from '@/components/ui/stamp'
import { slideUp, staggerContainer, liftOnHover } from '@/design/motion'
import { formatRelativeTime, cn } from '@/lib/utils'
import * as api from '@/lib/api'

function NotebookView() {
  const { notebookId } = useParams()
  const [notebook, setNotebook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPrompt, setShowPrompt] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    api.fetchNotebook(notebookId).then((nb) => {
      setNotebook(nb)
      setLoading(false)
      if (nb && nb.topics.length === 0) {
        setShowPrompt(true)
      }
    })
  }, [notebookId])

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setGenerating(true)
    const topics = await api.generateTopics(notebookId, prompt)
    setNotebook((prev) => ({ ...prev, topics }))
    setShowPrompt(false)
    setGenerating(false)
    setPrompt('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-48 h-px bg-walnut/20 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-pine animate-[ink-fill_1.5s_ease-out]" style={{ width: '60%' }} />
        </div>
      </div>
    )
  }

  if (!notebook) {
    return (
      <div className="text-center py-20">
        <p className="font-display text-xl text-ink/60">Notebook not found</p>
        <Link to="/app/library" className="text-pine text-sm mt-4 inline-block">Back to library</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-2xl font-medium text-ink">
          {notebook.title}
        </h2>
        {notebook.description && (
          <p className="text-walnut text-sm mt-2">{notebook.description}</p>
        )}
      </div>

      {notebook.topics.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg text-ink">Topics</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowPrompt(true)}>
              <Sparkles size={14} className="mr-1" />
              Generate more
            </Button>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            {notebook.topics.map((topic) => (
              <motion.div key={topic.id} variants={slideUp}>
                <Link
                  to={`/app/notebook/${notebookId}/topic/${topic.id}`}
                  className="no-underline block"
                >
                  <motion.div {...liftOnHover}>
                    <Card seed={topic.id.charCodeAt(3)} className="flex items-center gap-4 cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-base font-medium text-ink mb-1">
                          {topic.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-walnut/60 font-mono">
                          {topic.progress.read && (
                            <span className="flex items-center gap-1">
                              <FileText size={11} /> Read
                            </span>
                          )}
                          {topic.userNotes.length > 0 && (
                            <span>{topic.userNotes.length} note{topic.userNotes.length !== 1 ? 's' : ''}</span>
                          )}
                          {topic.questions.length > 0 && (
                            <span>{topic.questions.length} question{topic.questions.length !== 1 ? 's' : ''}</span>
                          )}
                          <span>{formatRelativeTime(topic.progress.read ? topic.id : notebook.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {topic.progress.quizzed && (
                          <Stamp variant="pine">quiz</Stamp>
                        )}
                        <div className="flex gap-1">
                          <span className={cn(
                            'w-6 h-6 rounded-[2px] flex items-center justify-center text-xs',
                            topic.progress.read ? 'bg-pine/10 text-pine' : 'bg-walnut/5 text-walnut/30'
                          )}>
                            <FileText size={12} />
                          </span>
                          <span className={cn(
                            'w-6 h-6 rounded-[2px] flex items-center justify-center text-xs',
                            topic.userNotes.length > 0 ? 'bg-pine/10 text-pine' : 'bg-walnut/5 text-walnut/30'
                          )}>
                            <MessageCircle size={12} />
                          </span>
                          <span className={cn(
                            'w-6 h-6 rounded-[2px] flex items-center justify-center text-xs',
                            topic.progress.quizzed ? 'bg-pine/10 text-pine' : 'bg-walnut/5 text-walnut/30'
                          )}>
                            <HelpCircle size={12} />
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-paper border border-walnut/20 rounded-[2px] shadow-hard"
        >
          <h3 className="font-display text-lg font-medium text-ink mb-2">
            {notebook.topics.length === 0
              ? 'What would you like to study?'
              : 'Generate more topics'}
          </h3>
          <p className="text-sm text-walnut mb-4">
            Describe what you want to learn, and AI will generate topic outlines for your notebook.
          </p>
          <InkTextarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. The laws of thermodynamics, with focus on entropy and heat engines..."
            className="min-h-[80px] mb-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleGenerate()
              }
            }}
          />
          <div className="flex gap-3">
            {notebook.topics.length > 0 && (
              <Button variant="ghost" onClick={() => setShowPrompt(false)}>
                Cancel
              </Button>
            )}
            <Button onClick={handleGenerate} disabled={generating || !prompt.trim()}>
              {generating ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-px bg-current relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-current animate-[ink-fill_2s_ease-out]" style={{ width: '40%' }} />
                  </div>
                  Generating...
                </span>
              ) : (
                <>
                  <Sparkles size={14} />
                  Generate topics
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-walnut/50 mt-3 font-mono">
            Press Ctrl+Enter to generate
          </p>
        </motion.div>
      )}
    </div>
  )
}

export { NotebookView }
