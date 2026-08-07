import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  busy = false,
  error = null,
}) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !busy) onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, busy, onCancel])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-walnut/25 backdrop-blur-[2px] flex items-center justify-center px-6"
          onClick={() => !busy && onCancel()}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm p-6 bg-paper border border-walnut/20 rounded-[2px] shadow-hard"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-[3px] bg-claret/10 flex items-center justify-center shrink-0">
                <TriangleAlert size={18} className="text-claret" />
              </div>
              <h3 className="font-display text-lg font-medium text-ink leading-snug pt-1">
                {title}
              </h3>
            </div>

            {message && (
              <p className="text-sm text-walnut font-body mb-5">{message}</p>
            )}

            {error && (
              <p className="text-sm text-claret font-body mb-4 border border-claret/20 bg-claret/5 rounded-[2px] px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={onCancel} disabled={busy}>
                {cancelLabel}
              </Button>
              <Button variant="destructive" onClick={onConfirm} disabled={busy}>
                {busy && <Loader2 size={14} className="animate-spin" />}
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { ConfirmDialog }
