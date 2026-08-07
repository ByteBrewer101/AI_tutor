import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'
import { Printer, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PROSE_CLASSES =
  'prose prose-ink max-w-none prose-headings:font-display prose-code:font-mono prose-code:text-claret prose-code:before:content-none prose-code:after:content-none prose-pre:bg-paper-dark prose-pre:text-ink prose-blockquote:border-l-pine prose-blockquote:text-walnut'

function PdfExport({ title, sections, onClose }) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title || 'Nuro'
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.title = prevTitle
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [title, onClose])

  return createPortal(
    <div className="print-overlay fixed inset-0 z-50 bg-walnut/25 backdrop-blur-[2px] flex flex-col">
      <div className="print-toolbar flex items-center justify-between gap-4 px-6 lg:px-10 py-4 bg-paper border-b border-walnut/15 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-display text-lg font-medium text-ink truncate">
            {title}
          </span>
          <span className="font-mono text-xs text-walnut/50 shrink-0">
            {sections.length === 1
              ? '1 section'
              : `${sections.length} sections`}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button onClick={() => window.print()}>
            <Printer size={16} />
            Print / Save as PDF
          </Button>
          <Button variant="secondary" size="icon" onClick={onClose} aria-label="Close preview">
            <X size={16} />
          </Button>
        </div>
      </div>

      <div className="print-scroll flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-6 lg:px-10 py-10">
          <div className="print-sheet bg-paper p-8 lg:p-12 border border-walnut/15 rounded-[2px] shadow-hard">
            <div className={`print-doc ${PROSE_CLASSES}`}>
              {title && (
                <h1 className="print-title font-display text-3xl font-semibold text-ink border-b border-walnut/15 pb-4 mb-8">
                  {title}
                </h1>
              )}
              {sections.map((section, i) => (
                <div key={i} className={i > 0 ? 'mt-10' : ''}>
                  {section.heading && (
                    <h2 className="font-display text-xl font-semibold text-ink mb-4">
                      {section.heading}
                    </h2>
                  )}
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {section.content}
                  </ReactMarkdown>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export { PdfExport }
