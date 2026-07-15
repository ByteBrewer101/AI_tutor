import { motion } from 'framer-motion'
import { inkReveal } from '@/design/motion'
import { deterministicRotation } from '@/lib/utils'
import { X } from 'lucide-react'

function MarginNote({ note, onRemove, index = 0 }) {
  const rotation = deterministicRotation(note.id.charCodeAt(5) || index, 1.5)

  return (
    <motion.div
      {...inkReveal}
      transition={{ ...inkReveal.transition, delay: index * 0.05 }}
      className="relative group mb-4"
    >
      <div
        style={{ transform: `rotate(${rotation}deg)` }}
        className="font-hand text-base text-ink/80 leading-snug"
      >
        {note.text}
      </div>
      <div className="font-mono text-xs text-walnut/50 mt-1">
        {new Date(note.timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      </div>
      {onRemove && (
        <button
          onClick={() => onRemove(note.id)}
          className="absolute -right-2 -top-1 opacity-0 group-hover:opacity-100 transition-opacity text-walnut/40 hover:text-claret"
          aria-label="Remove note"
        >
          <X size={12} />
        </button>
      )}
    </motion.div>
  )
}

export { MarginNote }
