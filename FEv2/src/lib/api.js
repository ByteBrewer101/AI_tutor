import * as mock from './mockData'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

function toCamel(obj) {
  if (Array.isArray(obj)) return obj.map(toCamel)
  if (obj === null || typeof obj !== 'object') return obj
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    out[toCamelCase(k)] = toCamel(v)
  }
  return out
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `API error ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

function mockFallback(fnName, err, mockFn) {
  console.warn(`[api] ${fnName} failed, using mock data:`, err.message)
  return mockFn()
}

function flattenTopic(raw, questions, progress, notes) {
  const topic = toCamel(raw)
  topic.notebookId = topic.notebookId || raw.notebook_id
  topic.questions = (questions || []).map((q) => {
    const cq = toCamel(q)
    if (cq.type === 'mcq' && cq.options && typeof cq.answer === 'string') {
      const idx = cq.options.indexOf(cq.answer)
      cq.answer = idx >= 0 ? idx : 0
    }
    return cq
  })
  topic.userNotes = (notes || []).map((n) => {
    const cn = toCamel(n)
    cn.timestamp = cn.createdAt || cn.timestamp
    return cn
  })
  topic.progress = progress || { read: false, quizzed: false, score: 0 }
  return topic
}

export async function fetchNotebooks() {
  try {
    const raw = await apiFetch('/notebooks')
    const notebooks = toCamel(raw)

    const enriched = await Promise.all(
      notebooks.map(async (nb) => {
        const topicsRaw = await apiFetch(`/notebooks/${nb.id}/topics`)
        const topics = await Promise.all(
          topicsRaw.map(async (t) => {
            let progress = null
            let questions = []
            try {
              progress = await apiFetch(`/topics/${t.id}/progress`)
            } catch (e) {
              console.warn('[api] progress fetch failed for topic', t.id, e.message)
            }
            try {
              questions = await apiFetch(`/topics/${t.id}/questions`)
            } catch (e) {
              console.warn('[api] questions fetch failed for topic', t.id, e.message)
            }
            return flattenTopic(t, questions, progress, [])
          })
        )
        return { ...nb, title: nb.name || nb.title, topics }
      })
    )

    return enriched
  } catch (err) {
    return mockFallback('fetchNotebooks', err, mock.getNotebooks)
  }
}

export async function fetchNotebooksList() {
  try {
    const raw = await apiFetch('/notebooks')
    const notebooks = toCamel(raw)

    const enriched = await Promise.all(
      notebooks.map(async (nb) => {
        const topicsRaw = await apiFetch(`/notebooks/${nb.id}/topics`)
        const topics = await Promise.all(
          topicsRaw.map(async (t) => {
            let progress = null
            try {
              progress = await apiFetch(`/topics/${t.id}/progress`)
            } catch (e) {
              console.warn('[api] progress fetch failed for topic', t.id, e.message)
            }
            const topic = toCamel(t)
            topic.notebookId = topic.notebookId || t.notebook_id
            topic.progress = progress || { read: false, quizzed: false, score: 0 }
            return topic
          })
        )
        return { ...nb, title: nb.name || nb.title, topics }
      })
    )

    return enriched
  } catch (err) {
    return mockFallback('fetchNotebooksList', err, mock.getNotebooks)
  }
}

export async function fetchNotebook(id) {
  try {
    const raw = await apiFetch(`/notebooks/${id}`)
    const nb = toCamel(raw)
    nb.title = nb.name || nb.title

    const topicsRaw = await apiFetch(`/notebooks/${id}/topics`)
    const topics = await Promise.all(
      topicsRaw.map(async (t) => {
        let progress = null
        let questions = []
        try {
          progress = await apiFetch(`/topics/${t.id}/progress`)
        } catch (e) {
          console.warn('[api] progress fetch failed for topic', t.id, e.message)
        }
        try {
          questions = await apiFetch(`/topics/${t.id}/questions`)
        } catch (e) {
          console.warn('[api] questions fetch failed for topic', t.id, e.message)
        }
        return flattenTopic(t, questions, progress, [])
      })
    )

    return { ...nb, topics }
  } catch (err) {
    return mockFallback('fetchNotebook', err, () => mock.getNotebook(id))
  }
}

export async function fetchTopic(notebookId, topicId) {
  try {
    const topicsRaw = await apiFetch(`/notebooks/${notebookId}/topics`)
    const raw = topicsRaw.find((t) => t.id === topicId)
    if (!raw) throw new Error('Topic not found')

    let progress = null
    let questions = []
    let notes = []
    try {
      progress = await apiFetch(`/topics/${topicId}/progress`)
    } catch (e) {
      console.warn('[api] progress fetch failed for topic', topicId, e.message)
    }
    try {
      questions = await apiFetch(`/topics/${topicId}/questions`)
    } catch (e) {
      console.warn('[api] questions fetch failed for topic', topicId, e.message)
    }
    try {
      notes = await apiFetch(`/topics/${topicId}/notes`)
    } catch (e) {
      console.warn('[api] notes fetch failed for topic', topicId, e.message)
    }

    return flattenTopic(raw, questions, progress, notes)
  } catch (err) {
    return mockFallback('fetchTopic', err, () => mock.getTopic(notebookId, topicId))
  }
}

export async function createNotebook(title, description = '') {
  try {
    const raw = await apiFetch('/notebooks', {
      method: 'POST',
      body: JSON.stringify({ name: title, description }),
    })
    const nb = toCamel(raw)
    nb.title = nb.name || nb.title
    nb.topics = []
    return nb
  } catch (err) {
    return mockFallback('createNotebook', err, () => mock.createNotebook(title, description))
  }
}

export async function createTopic(notebookId, title, content = '') {
  try {
    const raw = await apiFetch(`/notebooks/${notebookId}/topics/generate`, {
      method: 'POST',
      body: JSON.stringify({ prompt: title }),
    })
    const topics = toCamel(Array.isArray(raw) ? raw : [raw])
    return topics[0] || { id: 'fallback', title, content, notebookId }
  } catch (err) {
    return mockFallback('createTopic', err, () => mock.createTopic(notebookId, title, content))
  }
}

export async function generateTopics(notebookId, prompt) {
  try {
    const raw = await apiFetch(`/notebooks/${notebookId}/topics/generate`, {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    })
    const topicsRaw = Array.isArray(raw) ? raw : [raw]
    const topics = await Promise.all(
      topicsRaw.map(async (t) => {
        const topic = toCamel(t)
        let progress = null
        try {
          progress = await apiFetch(`/topics/${topic.id}/progress`)
        } catch (e) {
          console.warn('[api] progress fetch failed for new topic', topic.id, e.message)
        }
        return flattenTopic(t, [], progress, [])
      })
    )
    return topics
  } catch (err) {
    return mockFallback('generateTopics', err, () => mock.generateTopics(notebookId, prompt))
  }
}

export async function addMarginNote(topicId, text) {
  try {
    const raw = await apiFetch(`/topics/${topicId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    })
    const note = toCamel(raw)
    note.timestamp = note.createdAt || note.timestamp
    return note
  } catch (err) {
    return mockFallback('addMarginNote', err, () => mock.addMarginNote(null, topicId, text))
  }
}

export async function deleteNote(noteId) {
  try {
    await apiFetch(`/notes/${noteId}`, { method: 'DELETE' })
    return true
  } catch (err) {
    console.warn('[api] deleteNote failed:', err.message)
    return false
  }
}

export async function updateTopicContent(notebookId, topicId, content) {
  console.warn('[api] updateTopicContent has no backend endpoint, using mock')
  return mock.updateTopicContent(notebookId, topicId, content)
}

export async function sendChatMessage(topicId, message) {
  try {
    const data = await apiFetch('/chat', {
      method: 'POST',
      body: JSON.stringify({ topic_id: topicId, message }),
    })
    return data.reply
  } catch (err) {
    return mockFallback('sendChatMessage', err, () => `Echo: ${message}`)
  }
}
