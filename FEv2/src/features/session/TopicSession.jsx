import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'
import {
  BookOpen,
  MessageCircle,
  HelpCircle,
  CheckCircle,
  Circle,
  Save,
  Loader2,
  FileText,
  Send,
  Lightbulb,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Stamp } from '@/components/ui/stamp'
import { pageTurn } from '@/design/motion'
import { cn } from '@/lib/utils'
import * as api from '@/lib/api'

const SUMMARIZE_THRESHOLD = 5

function TopicSession() {
  const { notebookId, topicId } = useParams()
  const [topic, setTopic] = useState(null)
  const [notebook, setNotebook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('read')
  const [contentVersion, setContentVersion] = useState(0)

  const [chatMessages, setChatMessages] = useState([])
  const [chatSending, setChatSending] = useState(false)
  const chatMessagesEndRef = useRef(null)

  useEffect(() => {
    Promise.all([
      api.fetchTopic(notebookId, topicId),
      api.fetchNotebook(notebookId),
    ]).then(([t, nb]) => {
      setTopic(t)
      setNotebook(nb)
      setLoading(false)
      setChatMessages([
        {
          id: '1',
          role: 'assistant',
          content: `Welcome! Let's explore **${nb?.title || 'this topic'}** together. I'll help you understand it step by step.\n\nWhat aspect would you like to dive into first?`,
          responseType: 'conversational',
          suggestions: [
            { text: 'Give me an overview of this topic' },
            { text: 'What are the key concepts?' },
            { text: 'Explain the basics to me' },
          ],
          keyTakeaways: [],
        },
      ])
    })
  }, [notebookId, topicId])

  const handleContentUpdated = useCallback(() => {
    setContentVersion((v) => v + 1)
  }, [])

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

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

  const modes = [
    { id: 'read', label: 'Read', icon: BookOpen },
    { id: 'learn', label: 'Learn', icon: MessageCircle },
    { id: 'quiz', label: 'Questions', icon: HelpCircle },
  ]

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 72px)' }}>
      <div className="mb-4 px-4 lg:px-0">
        <p className="font-mono text-xs text-walnut/50">
          {notebook?.title}
        </p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col px-4 lg:px-0">
        <AnimatePresence mode="wait">
          {mode === 'read' && (
            <motion.div key="read" {...pageTurn} className="flex-1 min-h-0">
              <ReadMode topicId={topicId} contentVersion={contentVersion} />
            </motion.div>
          )}
          {mode === 'learn' && (
            <motion.div key="learn" {...pageTurn} className="flex-1 min-h-0 flex flex-col">
              <LearnMode
                messages={chatMessages}
                sending={chatSending}
                messagesEndRef={chatMessagesEndRef}
              />
            </motion.div>
          )}
          {mode === 'quiz' && (
            <motion.div key="quiz" {...pageTurn} className="flex-1 min-h-0">
              <QuizMode topicId={topicId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className="sticky bottom-0 shrink-0 border-t border-walnut/15 bg-paper pt-3 pb-4 px-4 lg:px-0 -mx-6 lg:-mx-10 -mb-6 lg:-mb-10"
      >
        <div className="flex justify-center mb-3">
          <div className="inline-flex bg-paper-dark/50 border border-walnut/15 rounded-[3px] p-1">
            {modes.map(({ id, label, icon: Icon }) => (
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

        {mode === 'learn' && (
          <div className="max-w-[680px] mx-auto">
            <LearnInput
              topic={topic}
              messages={chatMessages}
              setMessages={setChatMessages}
              sending={chatSending}
              setSending={setChatSending}
              onContentUpdated={handleContentUpdated}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function ReadMode({ topicId, contentVersion }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    api.fetchTopicContent(topicId).then((data) => {
      if (!cancelled) {
        setContent(data?.content || '')
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [topicId, contentVersion])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={20} className="animate-spin text-walnut/40" />
      </div>
    )
  }

  if (!content || !content.trim()) {
    return (
      <div className="text-center py-16">
        <FileText size={40} className="mx-auto text-walnut/30 mb-4" />
        <p className="font-display text-xl text-ink/60">No content yet</p>
        <p className="text-walnut/60 text-sm mt-2">
          Start a conversation in Learn mode to build your notes for this topic.
        </p>
      </div>
    )
  }

  return (
    <article className="prose prose-ink max-w-[680px] prose-headings:font-display prose-code:font-mono prose-code:text-claret prose-code:before:content-none prose-code:after:content-none prose-pre:bg-paper-dark prose-pre:text-ink prose-blockquote:border-l-pine prose-blockquote:text-walnut">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </article>
  )
}

function TakeawayCard({ takeaways }) {
  if (!takeaways || takeaways.length === 0) return null

  return (
    <div className="mt-3 p-3 bg-paper-dark/30 border border-walnut/10 rounded-[2px]">
      <div className="flex items-center gap-1.5 mb-2">
        <Lightbulb size={12} className="text-brass" />
        <span className="font-mono text-xs text-walnut/50">Key Takeaways</span>
      </div>
      <ul className="space-y-1">
        {takeaways.map((t, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-ink/80 font-body">
            <span className="w-1.5 h-1.5 rounded-full bg-pine/60 mt-1.5 shrink-0" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ChatBubble({ message }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="ml-8">
        <div className="p-4 rounded-[2px] bg-pine/10 text-ink">
          <div className="prose prose-sm max-w-none prose-headings:font-display prose-code:font-mono prose-code:text-claret prose-code:before:content-none prose-code:after:content-none prose-pre:bg-paper-dark prose-pre:text-ink">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    )
  }

  const hasTakeaways = message.keyTakeaways?.length > 0

  return (
    <div className="mr-8">
      <div className="p-4 rounded-[2px] text-sm bg-paper border border-walnut/15">
        <div className="prose prose-sm max-w-none prose-headings:font-display prose-code:font-mono prose-code:text-claret prose-code:before:content-none prose-code:after:content-none prose-pre:bg-paper-dark prose-pre:text-ink">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {message.content}
          </ReactMarkdown>
        </div>

        {hasTakeaways && <TakeawayCard takeaways={message.keyTakeaways} />}
      </div>
    </div>
  )
}

function LearnMode({ messages, sending, messagesEndRef }) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto space-y-4 pt-4 pb-4">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
          />
        ))}
        {sending && (
          <div className="mr-8">
            <div className="bg-paper border border-walnut/15 p-4 rounded-[2px]">
              <Loader2 size={16} className="animate-spin text-walnut/40" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

function LearnInput({ topic, messages, setMessages, sending, setSending, onContentUpdated }) {
  const [input, setInput] = useState('')
  const [summarizing, setSummarizing] = useState(false)
  const [toast, setToast] = useState(null)
  const messageCountRef = useRef(0)
  const textareaRef = useRef(null)
  const msgIdRef = useRef(0)

  const latestSuggestions = messages.length > 0
    ? messages[messages.length - 1]
    : null
  const showSuggestions = latestSuggestions
    && latestSuggestions.role === 'assistant'
    && latestSuggestions.suggestions?.length > 0
    && !sending

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const doSummarize = useCallback(async (currentMessages) => {
    if (summarizing) return
    setSummarizing(true)
    try {
      await api.summarizeChat(topic.id, currentMessages)
      showToast('Content updated from chat')
      onContentUpdated?.()
    } catch {
      showToast('Failed to save content', 'error')
    } finally {
      setSummarizing(false)
    }
  }, [topic.id, summarizing, showToast, onContentUpdated])

  const sendMessage = async (text) => {
    if (!text.trim() || sending) return
    const userMsg = { id: `user_${++msgIdRef.current}`, role: 'user', content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setSending(true)

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const historyForApi = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
        suggestion_hints: m.suggestions?.map((s) => s.text) || [],
      }))
      const result = await api.sendChatMessage(topic.id, text, historyForApi)
      const assistantMsg = {
        id: `ai_${++msgIdRef.current}`,
        role: 'assistant',
        content: result.reply,
        responseType: result.responseType,
        suggestions: result.suggestions,
        keyTakeaways: result.keyTakeaways,
      }
      const finalMessages = [...updatedMessages, assistantMsg]
      setMessages(finalMessages)

      messageCountRef.current += 1
      if (messageCountRef.current >= SUMMARIZE_THRESHOLD) {
        messageCountRef.current = 0
        doSummarize(finalMessages.map((m) => ({ role: m.role, content: m.content })))
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `ai_${++msgIdRef.current}`, role: 'assistant', content: 'Sorry, something went wrong. Please try again.', responseType: 'conversational', suggestions: [], keyTakeaways: [] },
      ])
    } finally {
      setSending(false)
    }
  }

  const handleSend = () => sendMessage(input)

  const handleSaveManual = () => {
    if (messages.length === 0) {
      showToast('No messages to save', 'error')
      return
    }
    doSummarize(messages.map((m) => ({ role: m.role, content: m.content })))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`
  }

  return (
    <>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 rounded-[2px] text-sm font-body shadow-hard whitespace-nowrap z-10',
              toast.type === 'error'
                ? 'bg-claret/10 text-claret border border-claret/20'
                : 'bg-pine/10 text-pine border border-pine/20'
            )}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {showSuggestions && (
        <div className="mb-3">
          <p className="text-xs font-mono text-walnut/40 mb-2">Suggested questions</p>
          <div className="flex flex-wrap gap-2">
            {latestSuggestions.suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s.text)}
                className="px-3 py-1.5 text-sm font-body bg-paper-dark/50 border border-walnut/15 rounded-full text-walnut hover:text-ink hover:bg-paper-dark transition-colors cursor-pointer"
              >
                {s.text}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={sending ? 'Waiting for response...' : 'Ask about this topic...'}
          disabled={sending}
          rows={1}
          className="flex-1 bg-transparent border-b border-walnut/40 focus:border-pine font-body text-base py-2 outline-none placeholder:text-ink/40 transition-colors disabled:opacity-50 resize-none leading-relaxed"
        />
        <Button
          onClick={handleSaveManual}
          size="sm"
          variant="ghost"
          disabled={summarizing || sending || messages.length === 0}
          title="Save chat to content"
        >
          {summarizing ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        </Button>
        <Button onClick={handleSend} size="sm" disabled={sending || !input.trim()}>
          <Send size={14} />
        </Button>
      </div>
    </>
  )
}

function QuizMode({ topicId }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)

  const fetchQuiz = useCallback(async () => {
    setGenerating(true)
    try {
      const data = await api.generateQuiz(topicId)
      setQuestions(data?.questions || [])
    } catch {
      setQuestions([])
    } finally {
      setLoading(false)
      setGenerating(false)
    }
  }, [topicId])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setGenerating(true)
      try {
        const data = await api.generateQuiz(topicId)
        if (!cancelled) setQuestions(data?.questions || [])
      } catch {
        if (!cancelled) setQuestions([])
      } finally {
        if (!cancelled) {
          setLoading(false)
          setGenerating(false)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [topicId])

  const handleCheck = () => {
    if (questions[current]?.type === 'mcq' && selected === questions[current].answer) {
      setScore((s) => s + 1)
    }
    setRevealed(true)
  }

  const handleNext = () => {
    setCurrent((c) => c + 1)
    setSelected(null)
    setRevealed(false)
  }

  const handleRegenerate = () => {
    setCurrent(0)
    setSelected(null)
    setRevealed(false)
    setScore(0)
    fetchQuiz()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 size={24} className={cn('text-walnut/40 mb-4', generating && 'animate-spin')} />
        <p className="font-body text-sm text-walnut/60">
          {generating ? 'Generating questions...' : 'Loading...'}
        </p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-16">
        <HelpCircle size={40} className="mx-auto text-walnut/30 mb-4" />
        <p className="font-display text-xl text-ink/60">No questions yet</p>
        <p className="text-walnut/60 text-sm mt-2 mb-6">
          Build some content in Learn mode first, then come back for a quiz.
        </p>
        <Button onClick={handleRegenerate} size="sm" variant="secondary">
          Try generating quiz
        </Button>
      </div>
    )
  }

  const q = questions[current]

  return (
    <div className="max-w-[680px]">
      <div className="flex items-center justify-between mb-6">
        <span className="font-mono text-xs text-walnut/50">
          Question {current + 1} of {questions.length}
        </span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-pine">
            Score: {score}/{current + (revealed ? 1 : 0)}
          </span>
          <Button onClick={handleRegenerate} size="sm" variant="secondary">
            New quiz
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="mb-8"
        >
          <p className="font-body text-lg text-ink mb-6">{q.question}</p>

          {q.type === 'mcq' && q.options && (
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

          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-paper-dark/30 border border-walnut/10 rounded-[2px]"
            >
              <p className="font-body text-sm text-walnut">{q.answer}</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

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
