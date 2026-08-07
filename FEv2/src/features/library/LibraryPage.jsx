import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, BookOpen, Download, Trash2, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProgressThread } from '@/components/ui/progress-thread'
import { Stamp } from '@/components/ui/stamp'
import { ConfirmDialog } from '@/components/ui/confirm'
import { PdfExport } from '@/components/print/PdfExport'
import { CoffeeRing, DogEar } from '@/design/textures'
import { staggerContainer, slideUp, liftOnHover } from '@/design/motion'
import { shouldShowCoffeeRing, shouldShowDogEar } from '@/lib/earnedDetails'
import { formatRelativeTime } from '@/lib/utils'
import * as api from '@/lib/api'

function LibraryPage() {
  const navigate = useNavigate()
  const [notebooks, setNotebooks] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [downloadingId, setDownloadingId] = useState(null)
  const [pdfData, setPdfData] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    api.fetchNotebooksList().then(setNotebooks)
  }, [])

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    const nb = await api.createNotebook(newTitle, newDesc)
    setNotebooks((prev) => [nb, ...prev])
    setNewTitle('')
    setNewDesc('')
    setShowCreate(false)
    navigate(`/app/notebook/${nb.id}`)
  }

  const handleDownloadPdf = async (nb) => {
    if (downloadingId || nb.topics.length === 0) return
    setDownloadingId(nb.id)
    try {
      const sections = []
      for (const topic of nb.topics) {
        try {
          const data = await api.fetchTopicContent(topic.id)
          if (data?.content && data.content.trim()) {
            sections.push({ heading: topic.title, content: data.content })
          }
        } catch {
          // skip topics without readable content
        }
      }
      setPdfData({ title: nb.title, sections })
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    setDeleteError(null)
    const ok = await api.deleteNotebook(deleteTarget.id)
    if (ok) {
      setNotebooks((prev) => prev.filter((n) => n.id !== deleteTarget.id))
      setDeleteTarget(null)
      setDeleting(false)
    } else {
      setDeleting(false)
      setDeleteError('Failed to delete the notebook. Please try again.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl font-medium text-ink">
            Your Notebooks
          </h2>
          <p className="text-walnut text-sm mt-1">
            {notebooks.length === 0
              ? 'Start your first notebook.'
              : `${notebooks.length} notebook${notebooks.length !== 1 ? 's' : ''} in your collection`}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
          <Plus size={16} />
          New Notebook
        </Button>
      </div>

      {showCreate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-paper border border-walnut/20 rounded-[2px] shadow-hard"
        >
          <h3 className="font-display text-lg font-medium text-ink mb-4">
            Create a new notebook
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What are you studying?"
              className="w-full bg-transparent border-b border-walnut/40 focus:border-pine font-body text-base py-1.5 outline-none placeholder:text-ink/40 transition-colors duration-150"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="A short description (optional)"
              className="w-full bg-transparent border-b border-walnut/40 focus:border-pine font-body text-sm py-1.5 outline-none placeholder:text-ink/40 transition-colors duration-150"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create notebook</Button>
            </div>
          </div>
        </motion.div>
      )}

      {notebooks.length === 0 && !showCreate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <BookOpen size={48} className="mx-auto text-walnut/30 mb-4" />
          <p className="font-display text-xl text-ink/60 mb-2">
            Your library is empty
          </p>
          <p className="text-walnut/60 text-sm mb-6">
            Create your first notebook to start studying.
          </p>
          <Button onClick={() => setShowCreate(true)}>
            Start your first notebook
          </Button>
        </motion.div>
      )}

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {notebooks.map((nb) => {
          const progress = nb.topics.length > 0
            ? Math.round((nb.topics.filter((t) => t.progress.read).length / nb.topics.length) * 100)
            : 0
          const coffeeRing = shouldShowCoffeeRing(nb.accessCount)
          const dogEar = shouldShowDogEar(
            nb.topics.filter((t) => t.progress.read).length,
            nb.topics.length
          )

          return (
            <motion.div key={nb.id} variants={slideUp}>
              <Link to={`/app/notebook/${nb.id}`} className="no-underline block">
                <motion.div {...liftOnHover}>
                  <Card seed={nb.id.charCodeAt(3)} className="relative h-full cursor-pointer">
                    {coffeeRing && (
                      <CoffeeRing className="absolute -top-4 -right-4" size={70} />
                    )}
                    {dogEar && (
                      <DogEar className="absolute top-0 right-0" />
                    )}

                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-display text-lg font-medium text-ink">
                        {nb.title}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0">
                        {progress === 100 && (
                          <Stamp variant="brass">done</Stamp>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDownloadPdf(nb)
                          }}
                          disabled={downloadingId !== null || nb.topics.length === 0}
                          aria-label="Download notebook as PDF"
                          className="w-8 h-8 rounded-[3px] flex items-center justify-center text-walnut/50 hover:text-pine hover:bg-pine/10 transition-colors disabled:pointer-events-none disabled:opacity-40"
                        >
                          {downloadingId === nb.id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Download size={15} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setDeleteError(null)
                            setDeleteTarget(nb)
                          }}
                          aria-label="Delete notebook"
                          className="w-8 h-8 rounded-[3px] flex items-center justify-center text-walnut/50 hover:text-claret hover:bg-claret/10 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {nb.description && (
                      <p className="text-sm text-walnut mb-3 line-clamp-2">
                        {nb.description}
                      </p>
                    )}

                    <div className="mt-auto space-y-2">
                      <div className="flex items-center justify-between text-xs text-walnut/60 font-mono">
                        <span>{nb.topics.length} topic{nb.topics.length !== 1 ? 's' : ''}</span>
                        <span>{formatRelativeTime(nb.accessedAt)}</span>
                      </div>
                      {nb.topics.length > 0 && (
                        <ProgressThread value={progress} />
                      )}
                    </div>
                  </Card>
                </motion.div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>

      {pdfData && (
        <PdfExport
          title={pdfData.title}
          sections={pdfData.sections}
          onClose={() => setPdfData(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this notebook?"
        message={`"${deleteTarget?.title}" and all of its content will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        busy={deleting}
        error={deleteError}
      />
    </div>
  )
}

export { LibraryPage }
