import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { pageTurn, liftOnHover, inkReveal, stampIn } from '../design/motion';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { InkInput } from '../components/ui/InkInput';
import { PenSquare, Send, Book, ChevronRight, MessageSquareText, Moon, Sun, Search, LayoutTemplate } from 'lucide-react';

const MOCK_NOTEBOOKS = [
  { id: 1, title: 'Thermodynamics', lastEdited: '2 days ago', topics: ['The Second Law', 'Entropy', 'Enthalpy'] },
  { id: 2, title: 'Calculus III', lastEdited: '1 week ago', topics: ['Vector Fields', 'Line Integrals', 'Stokes Theorem'] },
  { id: 3, title: 'Philosophy of Mind', lastEdited: '3 weeks ago', topics: ['Dualism', 'Consciousness', 'Turing Test'] },
];

export function HomePage() {
  const shouldReduce = useReducedMotion();
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSelectNotebook = (nb) => {
    setSelectedNotebook(nb);
    setSelectedTopic(null);
    setMessages([]); // Reset messages on new notebook
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setMessages([...messages, { id: Date.now(), text: chatMessage, sender: 'user' }]);
    setChatMessage('');
    
    // Mock response after a delay
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: "That's an interesting point! Consider reviewing the core principles in chapter 4. Shall we delve deeper?", 
        sender: 'ai' 
      }]);
    }, 800);
  };

  return (
    <motion.div 
      className="h-screen w-full flex overflow-hidden font-body transition-colors duration-500 bg-paper text-ink"
      {...(shouldReduce ? {} : pageTurn)}
    >
      {/* Left Pane: Sidebar (ChatGPT Style) */}
      <div className="w-[280px] shrink-0 border-r border-walnut/20 flex flex-col pt-6 pb-6 bg-paper/80 relative z-20 shadow-[2px_0_15px_rgba(42,36,28,0.03)] backdrop-blur-sm">
        <div className="px-4 pb-4 space-y-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xl font-display font-semibold tracking-wide flex items-center gap-2">
               <Book size={18} className="text-pine" /> Marginalia
            </h2>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 hover:bg-walnut/10 rounded-full transition-colors text-ink/70">
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          
          <Button variant="primary" className="w-full flex justify-center items-center gap-2 text-sm py-2.5 rounded-xl shadow-sm">
            <PenSquare size={16} /> New Session
          </Button>
          
          <div className="relative mt-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input 
              type="text" 
              placeholder="Search library..." 
              className="w-full bg-walnut/5 border border-walnut/10 rounded-xl py-1.5 pl-8 pr-3 text-sm outline-none focus:border-pine/50 focus:bg-paper transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 scrollbar-thin">
          <p className="text-xs font-mono tracking-wider uppercase text-ink/40 px-2 mb-2">Recent Pages</p>
          {MOCK_NOTEBOOKS.map((nb) => (
            <motion.div 
              key={nb.id}
              whileHover={shouldReduce ? {} : liftOnHover.whileHover}
              transition={liftOnHover.transition}
            >
              <Card 
                seed={nb.id} 
                className={`cursor-pointer transition-colors ${selectedNotebook?.id === nb.id ? 'bg-pine/5 border-pine/30 shadow-sm' : 'hover:bg-walnut/5'} p-3 rounded-xl`}
                onClick={() => handleSelectNotebook(nb)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium mb-1 leading-tight">{nb.title}</h3>
                    <p className="font-mono text-[10px] text-ink/50">{nb.lastEdited}</p>
                  </div>
                  {selectedNotebook?.id === nb.id && (
                    <motion.div {...(shouldReduce ? {} : stampIn)}>
                      <LayoutTemplate size={14} className="text-pine/70" />
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="px-4 pt-4 border-t border-walnut/15 mt-auto">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-walnut/5 cursor-pointer transition-colors">
             <div className="w-8 h-8 rounded-full bg-pine/20 flex items-center justify-center text-pine font-display font-semibold border border-pine/30">
               U
             </div>
             <span className="text-sm font-medium">User Profile</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative bg-paper">
        {/* Top Navigation / Breadcrumbs */}
        <div className="h-14 border-b border-walnut/15 flex items-center px-6 bg-paper/90 backdrop-blur-md z-10 sticky top-0 shrink-0">
           {selectedNotebook ? (
             <div className="flex items-center text-sm font-mono text-ink/60">
                {selectedNotebook.title} 
                {selectedTopic && (
                  <>
                    <ChevronRight size={14} className="mx-2 text-walnut/40" /> 
                    <span className="text-pine font-medium">{selectedTopic}</span>
                  </>
                )}
             </div>
           ) : (
             <div className="text-sm font-mono text-ink/50">Select a notebook to begin</div>
           )}
        </div>

        <div className="flex-1 flex flex-col relative overflow-y-auto px-6 lg:px-12 pt-10 pb-40 scroll-smooth">
          <div className="max-w-[760px] mx-auto w-full relative">
            
            {/* Background Texture Detail - subtle ink spread */}
            <div className="absolute top-20 left-0 w-64 h-64 bg-pine/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-40 right-10 w-48 h-48 bg-brass/5 rounded-full blur-[60px] pointer-events-none" />

            <AnimatePresence mode="wait">
              {selectedNotebook ? (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-8"
                >
                  {/* Topic Selection Header */}
                  {!selectedTopic && (
                     <div className="mb-12">
                       <h1 className="text-4xl font-display mb-6">Index: <span className="italic opacity-80">{selectedNotebook.title}</span></h1>
                       <div className="grid gap-3 sm:grid-cols-2">
                         {selectedNotebook.topics.map((topic) => (
                           <button
                             key={topic}
                             onClick={() => setSelectedTopic(topic)}
                             className="text-left px-5 py-4 font-body text-base border border-walnut/20 rounded-2xl hover:bg-pine/5 hover:border-pine/30 transition-all flex items-center justify-between group"
                           >
                             <span className="group-hover:text-pine">{topic}</span>
                             <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-pine" />
                           </button>
                         ))}
                       </div>
                     </div>
                  )}

                  {/* Active Topic Reading View */}
                  {selectedTopic && (
                    <div className="flex items-start gap-8 relative">
                      <div className="text-6xl font-display text-ink leading-[0.8] pt-2 opacity-90 select-none">T</div>
                      <div className="space-y-6 text-lg leading-relaxed">
                        <p>
                          his is a generated summary of <strong className="font-semibold text-pine">{selectedTopic}</strong>. The content sits inside a centered reading column with generous margins — like a book laid open.
                        </p>
                        <p>
                          It features asymmetric margins carrying the "notebook" feeling. As you review this section, margin notes can be appended. The signature element of this design is that these annotations accumulate over time.
                        </p>
                        
                        <div className="py-8 flex justify-center opacity-50">
                          <span className="text-walnut/60 font-mono tracking-widest text-sm">───── ⁂ ─────</span>
                        </div>
                      </div>
                      
                      {/* Marginalia Rail Simulation */}
                      <motion.div 
                        {...(shouldReduce ? {} : inkReveal)}
                        className="absolute -right-32 top-10 w-48 hidden lg:block"
                      >
                        <div className="rotate-2 text-claret font-hand text-xl bg-claret/5 p-3 rounded-xl border border-claret/10 shadow-sm backdrop-blur-sm">
                          Review session due for Ch 4! 📚
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* Chat Messages Log */}
                  {messages.length > 0 && (
                    <div className="mt-12 space-y-6">
                      {messages.map((msg) => (
                        <motion.div 
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                            msg.sender === 'user' 
                              ? 'bg-pine text-paper rounded-br-sm' 
                              : 'bg-walnut/10 text-ink border border-walnut/15 rounded-bl-sm font-hand text-lg'
                          }`}>
                            {msg.text}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center pt-32 opacity-60"
                >
                  <motion.div whileHover={{ rotate: 5, scale: 1.05 }} className="mb-8 p-6 rounded-3xl bg-walnut/5 border border-walnut/10 shadow-inner">
                    <MessageSquareText size={56} className="text-walnut/40" strokeWidth={1} />
                  </motion.div>
                  <h2 className="text-3xl font-display mb-3">A Blank Page</h2>
                  <p className="font-hand text-xl text-ink/70">Select a notebook from the library to begin.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Chat Box (Pinned Bottom Center) */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-paper via-paper/90 to-transparent pt-10 pb-8 px-6 z-30 pointer-events-none">
          <motion.div 
            layout
            className="max-w-[760px] mx-auto w-full pointer-events-auto shadow-[0_-10px_40px_rgba(42,36,28,0.05)] rounded-full"
          >
            <div className="bg-paper/90 backdrop-blur-xl border border-walnut/20 shadow-[0_8px_30px_rgba(42,36,28,0.08)] p-2 rounded-full relative flex items-center gap-3">
              <InkInput 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask a question or jot a note..."
                className="flex-1 border-none shadow-none bg-transparent focus:bg-transparent px-4 py-3 placeholder:text-ink/40 font-body text-base"
              />
              <Button 
                variant="primary" 
                onClick={handleSendMessage}
                disabled={!chatMessage.trim()}
                className={`p-3 h-12 w-12 rounded-full flex items-center justify-center shrink-0 border-none transition-all ${chatMessage.trim() ? 'bg-pine shadow-md' : 'bg-walnut/20 text-ink/40 cursor-not-allowed'}`}
              >
                <Send size={18} className={chatMessage.trim() ? "text-paper" : ""} />
              </Button>
            </div>
            <p className="text-center mt-3 text-[11px] font-mono text-ink/40 opacity-70">
              Marginalia can make mistakes. Consider verifying important facts.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
