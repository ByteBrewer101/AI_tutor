import { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { useMarginalia } from './useMarginalia';
import MarginNote from './MarginNote';
import InkInput from '../ui/InkInput';
import Button from '../ui/Button';
import { fadeInUp } from '../../design/motion';

export default function MarginRail({ notebookId }) {
  const { notes, addNote } = useMarginalia(notebookId);
  const shouldReduce = useReducedMotion();
  const [showInput, setShowInput] = useState(false);
  const [noteText, setNoteText] = useState('');

  function handleAddNote(e) {
    e.preventDefault();
    if (noteText.trim()) {
      addNote(noteText.trim());
      setNoteText('');
      setShowInput(false);
    }
  }

  return (
    <motion.aside
      {...(shouldReduce ? {} : fadeInUp)}
      className="fixed right-0 top-24 w-48 h-[calc(100vh-6rem)] border-l border-walnut/20
                 hidden lg:block overflow-y-auto"
    >
      <div className="p-4">
        <h3 className="font-mono text-xs text-walnut/50 uppercase tracking-wide mb-4">
          Marginalia
        </h3>

        <div className="relative min-h-[200px]">
          {notes.map((note, i) => (
            <MarginNote
              key={note.id}
              text={note.text}
              rotation={parseFloat(note.rotation)}
              top={i * 80 + 20}
            />
          ))}

          {notes.length === 0 && (
            <p className="font-hand text-sm text-ink/30 mt-8 text-center leading-relaxed">
              Your margin notes will appear here.
            </p>
          )}
        </div>

        {showInput ? (
          <form onSubmit={handleAddNote} className="mt-6 space-y-2">
            <InkInput
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write a note…"
              autoFocus
            />
            <div className="flex gap-2">
              <Button variant="primary" type="submit" className="text-sm py-1.5 px-3">
                Add
              </Button>
              <Button
                variant="ghost"
                type="button"
                className="text-sm py-1.5 px-3"
                onClick={() => {
                  setShowInput(false);
                  setNoteText('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="secondary"
            className="w-full mt-6 text-sm py-1.5"
            onClick={() => setShowInput(true)}
          >
            + Add a note
          </Button>
        )}
      </div>
    </motion.aside>
  );
}
