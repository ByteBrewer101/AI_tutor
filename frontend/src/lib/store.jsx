/* eslint react-refresh/only-export-components: 0 */
import { createContext, useReducer } from 'react';
import { notebooks as notebookData, topics as topicData, messages as messageData, marginalia as marginaliaData } from './data';

export const AppContext = createContext(null);

function appReducer(state, action) {
  switch (action.type) {
    case 'SELECT_NOTEBOOK':
      return { ...state, activeNotebookId: action.payload };

    case 'SEND_MESSAGE': {
      if (!action.payload.trim()) return state;
      const userMsg = {
        id: Date.now(),
        notebookId: state.activeNotebookId,
        role: 'user',
        text: action.payload,
        timestamp: new Date().toISOString(),
      };
      const aiReply = {
        id: Date.now() + 1,
        notebookId: state.activeNotebookId,
        role: 'ai',
        text: "That's a great question! Let me walk you through it step by step. What specific aspect would you like me to focus on?",
        timestamp: new Date().toISOString(),
      };
      return { ...state, messages: [...state.messages, userMsg, aiReply] };
    }

    case 'CREATE_NOTEBOOK': {
      const newNb = {
        id: Date.now(),
        title: action.payload.title || 'Untitled Notebook',
        description: 'New notebook',
        chapters: 0,
        pageCount: 0,
        lastStudied: 'Just now',
        streak: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      return { ...state, notebooks: [newNb, ...state.notebooks], activeNotebookId: newNb.id };
    }

    case 'TOGGLE_TOPIC': {
      const updated = state.topics.map((t) =>
        t.id === action.payload ? { ...t, completed: !t.completed } : t
      );
      return { ...state, topics: updated };
    }

    case 'ADD_MARGINALIA': {
      const note = {
        id: Date.now(),
        notebookId: state.activeNotebookId,
        ...action.payload,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      return { ...state, marginalia: [...state.marginalia, note] };
    }

    default:
      return state;
  }
}

const initialState = {
  notebooks: notebookData,
  topics: topicData,
  messages: messageData,
  marginalia: marginaliaData,
  activeNotebookId: 1,
};

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}
