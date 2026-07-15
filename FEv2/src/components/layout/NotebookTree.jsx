import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getNotebooks } from '@/lib/mockData'

function NotebookTree({ onNavigate }) {
  const [notebooks] = useState(() => getNotebooks())
  const [expandedIds, setExpandedIds] = useState(() => {
    const path = window.location.pathname
    const match = path.match(/\/notebook\/([^/]+)/)
    return match ? new Set([match[1]]) : new Set()
  })
  const { notebookId, topicId } = useParams()

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (notebooks.length === 0) return null

  return (
    <div className="space-y-0.5">
      <div className="px-2 mb-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-walnut/40">
          Notebooks
        </span>
      </div>

      {notebooks.map((nb) => {
        const isExpanded = expandedIds.has(nb.id)
        const isCurrentNotebook = notebookId === nb.id
        const topicCount = nb.topics.length

        return (
          <div key={nb.id}>
            <button
              onClick={() => toggleExpand(nb.id)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-[3px] text-left transition-colors',
                isCurrentNotebook
                  ? 'bg-pine/5 text-ink'
                  : 'text-walnut hover:text-ink hover:bg-walnut/5'
              )}
            >
              <span className="shrink-0 text-walnut/40">
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </span>
              <span className="font-body text-sm truncate flex-1">{nb.title}</span>
              {topicCount > 0 && (
                <span className="font-mono text-[10px] text-walnut/30 shrink-0">
                  {topicCount}
                </span>
              )}
            </button>

            {isExpanded && (
              <div className="ml-4 pl-3 border-l border-walnut/10 space-y-0.5 py-0.5">
                {nb.topics.map((topic) => {
                  const isCurrentTopic = topicId === topic.id
                  return (
                    <Link
                      key={topic.id}
                      to={`/app/notebook/${nb.id}/topic/${topic.id}`}
                      onClick={onNavigate}
                      className={cn(
                        'block px-2 py-1 rounded-[3px] text-sm no-underline transition-colors truncate',
                        isCurrentTopic
                          ? 'bg-pine/10 text-pine font-medium'
                          : 'text-walnut/70 hover:text-ink hover:bg-walnut/5'
                      )}
                    >
                      {topic.title}
                    </Link>
                  )
                })}
                {nb.topics.length === 0 && (
                  <span className="block px-2 py-1 text-xs text-walnut/30 italic">
                    No topics yet
                  </span>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export { NotebookTree }
