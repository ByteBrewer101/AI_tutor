import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { useApp } from '../../hooks/useApp';
import InkInput from '../ui/InkInput';
import Button from '../ui/Button';
import { inkReveal } from '../../design/motion';

export default function ChatSection() {
  const { state, dispatch } = useApp();
  const shouldReduce = useReducedMotion();
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  const { messages, activeNotebookId, notebooks } = state;
  const activeNotebook = notebooks.find((n) => n.id === activeNotebookId);
  const chatMessages = messages.filter((m) => m.notebookId === activeNotebookId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    dispatch({ type: 'SEND_MESSAGE', payload: input });
    setInput('');
  }

  return (
    <section className="flex-1 flex flex-col h-full min-w-0">
      <div className="px-6 py-3 border-b border-walnut/25 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl text-ink tracking-[0.01em]">
            {activeNotebook ? activeNotebook.title : 'Select a Notebook'}
          </h1>
          {activeNotebook && (
            <p className="font-mono text-xs text-walnut/50">{activeNotebook.description}</p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
        {chatMessages.length === 0 ? (
          <p className="font-body text-base text-ink/40 italic text-center mt-10">
            No messages yet — ask your tutor something to begin.
          </p>
        ) : (
          chatMessages.map((msg) => (
            <motion.div
              key={msg.id}
              {...(shouldReduce ? {} : inkReveal)}
              className={`max-w-[78%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
            >
              <div
                className={`font-body text-base leading-relaxed px-4 py-3 rounded-[3px] ${
                  msg.role === 'user'
                    ? 'bg-pine/10 text-ink border border-pine/20'
                    : 'bg-transparent text-ink border border-transparent'
                }`}
              >
                {msg.text}
              </div>
              <p className={`font-mono text-xs text-walnut/30 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </motion.div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-walnut/25 px-6 py-4 flex gap-3 items-end"
      >
        <div className="flex-1">
          <InkInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your tutor something…"
          />
        </div>
        <Button variant="primary" type="submit">
          Send
        </Button>
      </form>
    </section>
  );
}
