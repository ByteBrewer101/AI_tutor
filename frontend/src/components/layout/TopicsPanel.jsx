import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { useApp } from '../../hooks/useApp';
import Divider from '../ui/Divider';
import Stamp from '../ui/Stamp';
import { liftOnHover, fadeInUp, staggerList } from '../../design/motion';

export default function TopicsPanel() {
  const { state, dispatch } = useApp();
  const shouldReduce = useReducedMotion();

  const { topics, activeNotebookId, notebooks } = state;
  const activeNotebook = notebooks.find((n) => n.id === activeNotebookId);
  const notebookTopics = topics
    .filter((t) => t.notebookId === activeNotebookId)
    .sort((a, b) => a.order - b.order);

  const completedCount = notebookTopics.filter((t) => t.completed).length;

  function handleToggle(id) {
    dispatch({ type: 'TOGGLE_TOPIC', payload: id });
  }

  if (!activeNotebook) {
    return (
      <aside className="w-72 border-l border-walnut/25 flex flex-col p-5 h-full">
        <p className="font-body text-sm text-ink/40 italic text-center mt-10">
          Select a notebook to see its topics.
        </p>
      </aside>
    );
  }

  return (
    <aside className="w-72 border-l border-walnut/25 flex flex-col p-5 h-full overflow-y-auto">
      <h2 className="font-display text-xl text-ink tracking-[0.01em] mb-1">
        {activeNotebook.title}
      </h2>
      <p className="font-mono text-xs text-walnut/50 mb-2">
        {notebookTopics.length} topics · {completedCount} complete
      </p>

      {completedCount === notebookTopics.length && notebookTopics.length > 0 && (
        <Stamp className="self-start mb-3">Complete!</Stamp>
      )}

      <Divider />

      <h3 className="font-body text-sm text-walnut/70 uppercase tracking-wide mb-3">Topics</h3>

      {notebookTopics.length === 0 ? (
        <p className="font-body text-sm text-ink/40 italic">
          This page is still blank — add the first topic.
        </p>
      ) : (
        <motion.nav
          {...(shouldReduce ? {} : staggerList)}
          className="flex flex-col gap-1.5 flex-1"
        >
          {notebookTopics.map((topic) => (
            <motion.button
              key={topic.id}
              {...(shouldReduce ? {} : { ...liftOnHover, ...fadeInUp })}
              onClick={() => handleToggle(topic.id)}
              className="text-left px-3 py-2.5 rounded-[2px] font-body text-base
                         hover:bg-walnut/10 transition-colors duration-150
                         flex items-start gap-3 border border-transparent hover:border-walnut/15"
            >
              <span
                className={`w-4 h-4 mt-0.5 rounded-[2px] border flex-shrink-0 flex items-center justify-center transition-colors duration-200 ${
                  topic.completed
                    ? 'bg-brass/20 border-brass/50 text-brass'
                    : 'border-walnut/30'
                }`}
              >
                {topic.completed && (
                  <span className="font-mono text-xs leading-none">✓</span>
                )}
              </span>
              <span className="flex flex-col">
                <span className={topic.completed ? 'text-ink/60 line-through decoration-brass/40' : 'text-ink'}>
                  {topic.title}
                </span>
                <span className="font-mono text-xs text-walnut/40 mt-0.5">
                  p. {topic.pageNumber}
                </span>
              </span>
            </motion.button>
          ))}
        </motion.nav>
      )}
    </aside>
  );
}
