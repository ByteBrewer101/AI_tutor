import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, ArrowRight, ChevronRight } from 'lucide-react'
import { PaperTexture } from '@/design/textures'
import { Card } from '@/components/ui/card'
import { staggerContainer, slideUp, liftOnHover } from '@/design/motion'
import { formatRelativeTime } from '@/lib/utils'
import { useAuth } from '@/lib/useAuth'
import * as api from '@/lib/api'

const PAGE_SIZE = 6

function ExplorePage() {
  const { status } = useAuth()
  const [notebooks, setNotebooks] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const loadedOffset = useRef(0)
  const inFlight = useRef(false)
  const sentinelRef = useRef(null)

  const loadMore = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true
    setLoading(true)
    try {
      const page = await api.fetchFeedNotebooks({ offset: loadedOffset.current, limit: PAGE_SIZE })
      setNotebooks((prev) => {
        const seen = new Set(prev.map((n) => n.id))
        const fresh = page.items.filter((n) => !seen.has(n.id))
        return [...prev, ...fresh]
      })
      loadedOffset.current += page.items.length
      setHasMore(page.hasMore)
    } finally {
      setLoading(false)
      inFlight.current = false
    }
  }, [])

  useEffect(() => {
    loadMore()
  }, [loadMore])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <div className="min-h-screen bg-paper relative">
      <PaperTexture />

      <header className="sticky top-0 z-10 bg-paper/90 backdrop-blur-sm border-b border-walnut/10">
        <div className="max-w-[1040px] mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-lg font-semibold text-ink no-underline">
            Nuro
          </Link>
          <nav className="flex items-center gap-4">
            {status === 'authenticated' ? (
              <Link
                to="/app"
                className="inline-flex items-center gap-2 text-pine underline underline-offset-4 decoration-pine/40 hover:decoration-pine font-body text-sm transition-colors no-underline"
              >
                Your library
                <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-walnut hover:text-ink font-body text-sm transition-colors no-underline"
                >
                  Sign in
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-pine text-paper border border-pine rounded-[3px] px-4 py-2 font-body text-sm hover:bg-pine/90 transition-colors no-underline"
                >
                  Get started
                  <ArrowRight size={14} />
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-[1040px] mx-auto px-6 lg:px-10 py-10">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl font-medium text-ink">Explore</h2>
          <p className="text-walnut text-sm mt-1">
            Public notebooks shared by the Nuro community
          </p>
        </div>

        {notebooks.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Compass size={48} className="mx-auto text-walnut/30 mb-4" />
            <p className="font-display text-xl text-ink/60 mb-2">
              Nothing shared yet
            </p>
            <p className="text-walnut/60 text-sm">
              Public notebooks will appear here as people publish them.
            </p>
          </motion.div>
        )}

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mx-auto max-w-[640px] space-y-4"
        >
          {notebooks.map((nb) => (
            <motion.div key={nb.id} variants={slideUp}>
              <Link to={`/app/notebook/${nb.id}`} className="no-underline block">
                <motion.div {...liftOnHover}>
                  <Card seed={nb.id.charCodeAt(3) || 3} className="cursor-pointer">
                    <div className="flex items-center gap-4">
                      <span className="w-9 h-9 rounded-full bg-pine/15 text-pine flex items-center justify-center text-sm font-medium shrink-0">
                        {(nb.ownerName || 'A').charAt(0).toUpperCase()}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-xs text-walnut/60 truncate">
                            {nb.ownerName || 'Anonymous'}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-walnut/30 shrink-0" />
                          <span className="font-mono text-xs text-walnut/50 shrink-0">
                            {nb.topicCount} topic{nb.topicCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <h3 className="font-display text-lg font-medium text-ink mb-1 line-clamp-1">
                          {nb.title}
                        </h3>
                        {nb.description && (
                          <p className="text-sm text-walnut line-clamp-2">
                            {nb.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-xs text-walnut/50">
                          {formatRelativeTime(nb.createdAt)}
                        </span>
                        <ChevronRight size={18} className="text-walnut/40" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <div ref={sentinelRef} className="h-px" />

        {loading && notebooks.length > 0 && (
          <div className="text-center py-8">
            <span className="font-mono text-xs text-walnut/50">loading…</span>
          </div>
        )}

        {!hasMore && notebooks.length > 0 && (
          <div className="text-center py-8">
            <span className="font-mono text-xs text-walnut/40">
              — end of feed —
            </span>
          </div>
        )}
      </main>
    </div>
  )
}

export { ExplorePage }
