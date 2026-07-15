import { useState } from 'react'
import { Plus } from 'lucide-react'
import { InkTextarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MarginNote } from './MarginNote'
import { useMarginalia } from './useMarginalia'

function MarginRail({ topicId }) {
  const { notes, addNote, removeNote } = useMarginalia(topicId)
  const [isAdding, setIsAdding] = useState(false)
  const [newText, setNewText] = useState('')

  const handleAdd = () => {
    if (newText.trim()) {
      addNote(newText)
      setNewText('')
      setIsAdding(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
    if (e.key === 'Escape') {
      setIsAdding(false)
      setNewText('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-hand text-sm text-walnut/60">Margin Notes</h4>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-walnut/40 hover:text-pine transition-colors"
            aria-label="Add a note"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {isAdding && (
        <div className="space-y-2">
          <InkTextarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a note..."
            className="font-hand text-sm min-h-[60px]"
            autoFocus
          />
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setIsAdding(false); setNewText('') }}>
              Cancel
            </Button>
            <Button variant="ghost" size="sm" onClick={handleAdd}>
              Save
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {notes.length === 0 && !isAdding && (
          <p className="font-hand text-sm text-walnut/40 italic">
            No notes yet — add one in the margin.
          </p>
        )}
        {notes.map((note, i) => (
          <MarginNote
            key={note.id}
            note={note}
            index={i}
            onRemove={removeNote}
          />
        ))}
      </div>
    </div>
  )
}

export { MarginRail }
