import { useApp } from '../../hooks/useApp';

export function useMarginalia(notebookId) {
  const { state, dispatch } = useApp();

  const notes = state.marginalia
    .filter((m) => m.notebookId === notebookId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  function addNote(text, topicId = null) {
    dispatch({
      type: 'ADD_MARGINALIA',
      payload: {
        text,
        topicId,
        rotation: (Math.random() * 6 - 3).toFixed(1),
        x: Math.floor(Math.random() * 20) + 5,
        y: 0,
      },
    });
  }

  return { notes, addNote };
}
