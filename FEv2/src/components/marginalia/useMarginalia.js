import { useState, useCallback } from 'react'

const STORAGE_KEY = 'marginalia-notes'

function loadNotes() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

function saveNotes(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  } catch {
    // localStorage full or unavailable
  }
}

export function useMarginalia(topicId) {
  const [notes, setNotes] = useState(() => {
    const all = loadNotes()
    return all[topicId] || []
  })

  const addNote = useCallback(
    (text) => {
      if (!text.trim()) return null
      const note = {
        id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        text: text.trim(),
        timestamp: new Date().toISOString(),
      }
      setNotes((prev) => {
        const next = [...prev, note]
        const all = loadNotes()
        all[topicId] = next
        saveNotes(all)
        return next
      })
      return note
    },
    [topicId]
  )

  const removeNote = useCallback(
    (noteId) => {
      setNotes((prev) => {
        const next = prev.filter((n) => n.id !== noteId)
        const all = loadNotes()
        all[topicId] = next
        saveNotes(all)
        return next
      })
    },
    [topicId]
  )

  return { notes, addNote, removeNote }
}
