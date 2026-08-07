import * as mock from './mockData'
import { toApiConfig, withModelConfig } from './modelConfig'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const AUTH_TOKEN_KEY = 'nuro-token'
export const AUTH_EXPIRED_EVENT = 'auth:expired'

export function getAuthToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAuthToken(token) {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  } catch { /* ignore */ }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  } catch { /* ignore */ }
}

function isAuthPath(path) {
  return path.startsWith('/auth/')
}

function onUnauthorized() {
  clearAuthToken()
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
  }
}

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
  const token = getAuthToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    if (res.status === 401 && !isAuthPath(path)) {
      onUnauthorized()
    }
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

export async function fetchFeedNotebooks({ offset = 0, limit = 6 } = {}) {
  try {
    const raw = await apiFetch(`/feed/notebooks?offset=${offset}&limit=${limit}`)
    const page = toCamel(raw)
    return {
      items: (page.items || []).map((nb) => ({ ...nb, title: nb.name || nb.title })),
      hasMore: !!page.hasMore,
    }
  } catch {
    const all = mock.getFeedNotebooks()
    return {
      items: all.slice(offset, offset + limit).map((nb) => ({ ...nb, title: nb.name || nb.title })),
      hasMore: offset + limit < all.length,
    }
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

export async function updateNotebook(id, patch) {
  try {
    const raw = await apiFetch(`/notebooks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    const nb = toCamel(raw)
    nb.title = nb.name || nb.title
    return nb
  } catch (err) {
    console.warn('[api] updateNotebook failed, mutating mock data:', err.message)
    const mockNb = mock.getNotebook(id)
    if (mockNb) Object.assign(mockNb, patch)
    return mockNb
  }
}

export async function setNotebookVisibility(id, isPublic) {
  try {
    const raw = await apiFetch(`/notebooks/${id}/visibility`, {
      method: 'PUT',
      body: JSON.stringify({ is_public: isPublic }),
    })
    const nb = toCamel(raw)
    nb.title = nb.name || nb.title
    return nb
  } catch (err) {
    console.warn('[api] setNotebookVisibility failed, mutating mock data:', err.message)
    const mockNb = mock.getNotebook(id)
    if (mockNb) mockNb.isPublic = isPublic
    return mockNb
  }
}

export async function deleteNotebook(id) {
  try {
    await apiFetch(`/notebooks/${id}`, { method: 'DELETE' })
    return true
  } catch (err) {
    console.warn('[api] deleteNotebook failed:', err.message)
    return false
  }
}

export async function createTopic(notebookId, title, content = '') {
  try {
    const raw = await apiFetch(`/notebooks/${notebookId}/topics/generate`, {
      method: 'POST',
      body: JSON.stringify(withModelConfig({ prompt: title })),
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
      body: JSON.stringify(withModelConfig({ prompt })),
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
  try {
    const data = await apiFetch(`/topics/${topicId}/content`, {
      method: 'PUT',
      body: JSON.stringify({ id: topicId, title: '', content }),
    })
    return toCamel(data)
  } catch (err) {
    return mockFallback('updateTopicContent', err, () => mock.updateTopicContent(notebookId, topicId, content))
  }
}

export async function sendChatMessage(topicId, message, chatHistory = []) {
  try {
    const body = withModelConfig({
      topic_id: topicId,
      message,
      chat_history: chatHistory.map((m) => ({ role: m.role, content: m.content })),
    })

    const data = await apiFetch('/chat', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return {
      reply: data.reply,
      responseType: data.response_type || 'conversational',
      suggestions: data.suggestions || [],
      keyTakeaways: data.key_takeaways || [],
    }
  } catch (err) {
    return mockFallback('sendChatMessage', err, () => ({
      reply: `Echo: ${message}`,
      responseType: 'conversational',
      suggestions: [
        { text: 'Tell me more about this topic' },
        { text: 'Can you explain that differently?' },
      ],
      keyTakeaways: [],
    }))
  }
}

function parseSseFrame(frame) {
  const data = frame
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())
    .join('\n')
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

export function simulateChatStream(message, { onChunk, onDone, cause } = {}) {
  console.warn('[api] sendChatMessageStream failed, using simulated stream:', cause?.message)
  const text = `Echo: ${message}`
  const suggestions = [
    { text: 'Tell me more about this topic' },
    { text: 'Can you explain that differently?' },
  ]
  let cursor = 0
  return new Promise((resolve) => {
    const timer = setInterval(() => {
      const next = Math.min(text.length, cursor + 4)
      onChunk?.(text.slice(cursor, next))
      cursor = next
      if (cursor >= text.length) {
        clearInterval(timer)
        const meta = {
          reply: text,
          responseType: 'conversational',
          suggestions,
          keyTakeaways: [],
        }
        onDone?.(meta)
        resolve(meta)
      }
    }, 30)
  })
}

export async function sendChatMessageStream(topicId, message, chatHistory = [], { onChunk, onDone } = {}) {
  let started = false
  try {
    const body = withModelConfig({
      topic_id: topicId,
      message,
      chat_history: chatHistory.map((m) => ({ role: m.role, content: m.content })),
    })

    const res = await fetch(`${API_BASE}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
      },
      body: JSON.stringify(body),
    })

    if (!res.ok || !res.body) {
      if (res.status === 401) {
        onUnauthorized()
      }
      const errBody = await res.json().catch(() => ({}))
      throw new Error(errBody.detail || `API error ${res.status}`)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    const readChunks = async () => {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const frames = buffer.split('\n\n')
        buffer = frames.pop()
        for (const frame of frames) {
          const event = parseSseFrame(frame)
          if (!event) continue
          if (event.type === 'chunk') {
            started = true
            onChunk?.(event.content)
          } else if (event.type === 'done') {
            const meta = {
              reply: event.reply,
              responseType: event.response_type || 'conversational',
              suggestions: event.suggestions || [],
              keyTakeaways: event.key_takeaways || [],
            }
            onDone?.(meta)
            return meta
          } else if (event.type === 'error') {
            throw new Error(event.detail || 'Stream error')
          }
        }
      }
      throw new Error('Stream ended without a done event')
    }

    return await readChunks()
  } catch (err) {
    if (started) throw err
    return simulateChatStream(message, { onChunk, onDone, cause: err })
  }
}

export async function fetchTopicContent(topicId) {
  try {
    const data = await apiFetch(`/topics/${topicId}/content`)
    return toCamel(data)
  } catch (err) {
    return mockFallback('fetchTopicContent', err, () => ({ content: '' }))
  }
}

export async function summarizeChat(topicId, chatHistory) {
  try {
    const data = await apiFetch(`/topics/${topicId}/summarize`, {
      method: 'POST',
      body: JSON.stringify(
        withModelConfig({
          topic_id: topicId,
          chat_history: chatHistory.map((m) => ({ role: m.role, content: m.content })),
        })
      ),
    })
    return toCamel(data)
  } catch (err) {
    console.warn('[api] summarizeChat failed:', err.message)
    throw err
  }
}

export async function generateNextQuestion(
  topicId,
  { difficulty = 1, askedQuestions = [], correctCount = 0, wrongCount = 0 } = {}
) {
  try {
    const data = await apiFetch(`/topics/${topicId}/quiz/next`, {
      method: 'POST',
      body: JSON.stringify(
        withModelConfig({
          difficulty,
          asked_questions: askedQuestions,
          correct_count: correctCount,
          wrong_count: wrongCount,
        })
      ),
    })
    const q = toCamel(data)
    if (q.type === 'mcq' && q.options && typeof q.answer === 'string') {
      const idx = q.options.indexOf(q.answer)
      q.answer = idx >= 0 ? idx : 0
    }
    return q
  } catch (err) {
    return mockFallback('generateNextQuestion', err, () => ({
      type: 'mcq',
      question: `Sample question ${difficulty} from the topic material.`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 0,
      difficulty: difficulty <= 2 ? 'easy' : difficulty <= 4 ? 'medium' : difficulty <= 7 ? 'hard' : 'expert',
    }))
  }
}

export async function testModelConnection(config) {
  return apiFetch('/models/test', {
    method: 'POST',
    body: JSON.stringify(toApiConfig(config)),
  })
}

export async function login(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return { token: data.token, user: toCamel(data.user) }
}

export async function signup(email, password, displayName) {
  const data = await apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, display_name: displayName }),
  })
  return { token: data.token, user: toCamel(data.user) }
}

export async function fetchMe() {
  const data = await apiFetch('/auth/me')
  return toCamel(data)
}

export async function updateMe(patch) {
  const data = await apiFetch('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
  return toCamel(data)
}

export function logout() {
  clearAuthToken()
}
