import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Clock, Flame, Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Stamp } from '@/components/ui/stamp'
import { ProgressThread } from '@/components/ui/progress-thread'
import { slideUp, staggerContainer } from '@/design/motion'
import * as api from '@/lib/api'

const mockStats = {
  streak: 12,
  totalPages: 147,
  totalHours: 34.5,
  weeklyActivity: [3, 5, 2, 4, 6, 1, 3],
}

function DashboardPage() {
  const [notebooks, setNotebooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.fetchNotebooksList().then((nbs) => {
      setNotebooks(nbs)
      setLoading(false)
    })
  }, [])

  const totalTopics = notebooks.reduce((sum, nb) => sum + nb.topics.length, 0)
  const completedTopics = notebooks.reduce(
    (sum, nb) => sum + nb.topics.filter((t) => t.progress?.read).length,
    0
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-48 h-px bg-walnut/20 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-pine animate-[ink-fill_1.5s_ease-out]" style={{ width: '60%' }} />
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-medium text-ink mb-8">
        Your Progress
      </h2>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <motion.div variants={slideUp}>
          <Card seed={1}>
            <CardContent className="text-center py-2">
              <Flame size={24} className="mx-auto text-brass mb-2" />
              <div className="font-display text-3xl font-medium text-ink">
                {mockStats.streak}
              </div>
              <p className="text-xs text-walnut font-mono">day streak</p>
              <Stamp variant="brass" className="mt-2 text-xs">on fire</Stamp>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={slideUp}>
          <Card seed={2}>
            <CardContent className="text-center py-2">
              <BookOpen size={24} className="mx-auto text-pine mb-2" />
              <div className="font-display text-3xl font-medium text-ink">
                {mockStats.totalPages}
              </div>
              <p className="text-xs text-walnut font-mono">pages read</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={slideUp}>
          <Card seed={3}>
            <CardContent className="text-center py-2">
              <Clock size={24} className="mx-auto text-walnut mb-2" />
              <div className="font-display text-3xl font-medium text-ink">
                {mockStats.totalHours}
              </div>
              <p className="text-xs text-walnut font-mono">hours studied</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={slideUp}>
          <Card seed={4}>
            <CardContent className="text-center py-2">
              <Target size={24} className="mx-auto text-claret mb-2" />
              <div className="font-display text-3xl font-medium text-ink">
                {completedTopics}/{totalTopics}
              </div>
              <p className="text-xs text-walnut font-mono">topics done</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={slideUp}>
          <h3 className="font-display text-lg text-ink mb-4">Weekly Activity</h3>
          <Card seed={5}>
            <CardContent>
              <div className="flex items-end gap-2 h-24">
                {mockStats.weeklyActivity.map((hours, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-pine/20 rounded-[2px] transition-all"
                      style={{ height: `${(hours / 7) * 100}%` }}
                    />
                    <span className="text-xs text-walnut/40 font-mono">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={slideUp}>
          <h3 className="font-display text-lg text-ink mb-4">Overall Progress</h3>
          <div className="space-y-3">
            {notebooks.map((nb) => {
              const progress = nb.topics.length > 0
                ? Math.round((nb.topics.filter((t) => t.progress.read).length / nb.topics.length) * 100)
                : 0
              return (
                <Card key={nb.id} seed={nb.id.charCodeAt(3)}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-sm font-medium text-ink">{nb.title}</span>
                    <span className="font-mono text-xs text-walnut/50">{progress}%</span>
                  </div>
                  <ProgressThread value={progress} />
                </Card>
              )
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export { DashboardPage }
