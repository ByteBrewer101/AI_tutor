import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { useApp } from '../../hooks/useApp';
import PageShell from '../../components/layout/PageShell';
import Header from '../../components/layout/Header';
import Divider from '../../components/ui/Divider';
import Stamp from '../../components/ui/Stamp';
import Button from '../../components/ui/Button';
import MarginRail from '../../components/marginalia/MarginRail';
import { fadeInUp, inkReveal } from '../../design/motion';

export default function NotebookPage() {
  const { id } = useParams();
  const { state } = useApp();
  const shouldReduce = useReducedMotion();

  const notebook = state.notebooks.find((n) => n.id === Number(id));
  const notebookTopics = state.topics
    .filter((t) => t.notebookId === Number(id))
    .sort((a, b) => a.order - b.order);

  if (!notebook) {
    return (
      <PageShell>
        <Header />
        <main className="max-w-[680px] mx-auto pl-16 pr-10 py-10">
          <p className="font-body text-base text-ink/50 italic">
            Notebook not found.
          </p>
          <Link to="/library" className="font-body text-pine underline underline-offset-4 decoration-pine/40 mt-4 inline-block">
            ← Back to Library
          </Link>
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Header />
      <main className="max-w-[680px] mx-auto pl-16 pr-10 py-10">
        <motion.div {...(shouldReduce ? {} : fadeInUp)}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <Link
                to="/library"
                className="font-mono text-xs text-walnut/50 hover:text-pine transition-colors duration-150"
              >
                ← Library
              </Link>
              <h1 className="font-display text-2xl text-ink tracking-[0.01em] mt-2">
                {notebook.title}
              </h1>
            </div>
            <Stamp>{notebook.streak > 0 ? `${notebook.streak}-day streak` : 'New'}</Stamp>
          </div>
          <p className="font-body text-base text-walnut/60 mb-6">
            {notebook.description} · {notebook.chapters} chapters · {notebook.pageCount} pages
          </p>
        </motion.div>

        <motion.div {...(shouldReduce ? {} : inkReveal)} className="mb-8">
          <h2 className="font-display text-xl text-ink tracking-[0.01em] mb-4">Table of Contents</h2>
          <div className="space-y-2">
            {notebookTopics.map((topic) => (
              <div
                key={topic.id}
                className={`flex items-center justify-between px-3 py-2 rounded-[2px] font-body text-base border ${
                  topic.completed
                    ? 'border-brass/20 bg-brass/5 text-ink/60'
                    : 'border-transparent text-ink'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-4 h-4 rounded-[2px] border flex-shrink-0 flex items-center justify-center ${
                      topic.completed ? 'bg-brass/20 border-brass/50 text-brass' : 'border-walnut/30'
                    }`}
                  >
                    {topic.completed && <span className="font-mono text-xs leading-none">✓</span>}
                  </span>
                  <span className={topic.completed ? 'line-through decoration-brass/40' : ''}>
                    {topic.title}
                  </span>
                </div>
                <span className="font-mono text-xs text-walnut/40">p. {topic.pageNumber}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <Divider dinkus />

        <motion.div {...(shouldReduce ? {} : fadeInUp)}>
          <p className="font-body text-base text-ink/70 leading-relaxed">
            This is the beginning of your study session. Read through the material, make margin notes,
            and track your progress topic by topic. The margin rail on the left will accumulate your
            handwritten annotations as you go — making each notebook uniquely yours.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="primary">Mark chapter read</Button>
            <Button variant="secondary">Add a note</Button>
          </div>
        </motion.div>

        <Divider />

        <div className="flex items-center justify-between font-mono text-xs text-walnut/50">
          <span>p. 1</span>
          <span>{notebookTopics.length} topics</span>
        </div>
      </main>

      <MarginRail notebookId={Number(id)} />
    </PageShell>
  );
}
