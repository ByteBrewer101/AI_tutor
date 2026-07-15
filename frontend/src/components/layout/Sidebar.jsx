import { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { useApp } from '../../hooks/useApp';
import Button from '../ui/Button';
import Divider from '../ui/Divider';
import InkInput from '../ui/InkInput';
import { liftOnHover, fadeInUp, staggerList } from '../../design/motion';

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const shouldReduce = useReducedMotion();
  const [showNewInput, setShowNewInput] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const { notebooks, activeNotebookId } = state;

  function handleSelect(id) {
    dispatch({ type: 'SELECT_NOTEBOOK', payload: id });
  }

  function handleCreate(e) {
    e.preventDefault();
    if (newTitle.trim()) {
      dispatch({ type: 'CREATE_NOTEBOOK', payload: { title: newTitle.trim() } });
      setNewTitle('');
      setShowNewInput(false);
    }
  }

  const activeNb = notebooks.find((n) => n.id === activeNotebookId);
  const recentNotebooks = notebooks.filter((n) => n.id !== activeNotebookId);

  return (
    <aside className="w-60 border-r border-walnut/25 flex flex-col p-4 h-full overflow-y-auto">
      {!showNewInput ? (
        <Button
          className="w-full"
          onClick={() => setShowNewInput(true)}
        >
          + New Notebook
        </Button>
      ) : (
        <form onSubmit={handleCreate} className="space-y-2">
          <InkInput
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Notebook name..."
            autoFocus
          />
          <div className="flex gap-2">
            <Button variant="primary" type="submit">
              Create
            </Button>
            <Button
              variant="ghost"
              type="button"
              className="text-sm"
              onClick={() => {
                setShowNewInput(false);
                setNewTitle('');
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <Divider />

      {activeNb && (
        <div className="mb-4">
          <h2 className="font-mono text-xs text-walnut/50 uppercase tracking-wide mb-2">Active</h2>
          <motion.button
            {...(shouldReduce ? {} : liftOnHover)}
            onClick={() => handleSelect(activeNb.id)}
            className="w-full text-left px-3 py-2.5 rounded-[3px] font-body text-base
                       bg-pine/10 border border-pine/25 text-ink transition-colors duration-150"
          >
            <span className="block leading-tight font-medium">{activeNb.title}</span>
            <span className="block font-mono text-xs text-walnut/50 mt-0.5">
              {activeNb.chapters} chapters · streak {activeNb.streak}
            </span>
          </motion.button>
        </div>
      )}

      <h2 className="font-body text-sm text-walnut/70 uppercase tracking-wide mb-3">Recent Notebooks</h2>

      {recentNotebooks.length === 0 ? (
        <p className="font-body text-sm text-ink/40 italic">
          No other notebooks yet.
        </p>
      ) : (
        <motion.nav
          {...(shouldReduce ? {} : staggerList)}
          className="flex flex-col gap-1 flex-1"
        >
          {recentNotebooks.map((nb) => (
            <motion.button
              key={nb.id}
              {...(shouldReduce ? {} : { ...liftOnHover, ...fadeInUp })}
              onClick={() => handleSelect(nb.id)}
              className="text-left px-3 py-2 rounded-[3px] font-body text-base text-ink
                         hover:bg-walnut/10 transition-colors duration-150
                         border border-transparent hover:border-walnut/15"
            >
              <span className="block leading-tight">{nb.title}</span>
              <span className="block font-mono text-xs text-walnut/50 mt-0.5">
                {nb.lastStudied} · {nb.chapters} chapters
              </span>
            </motion.button>
          ))}
        </motion.nav>
      )}
    </aside>
  );
}
