# Backend API Reference

> Base URL: `http://localhost:8000`  
> All request/response bodies are JSON unless noted. UUIDs are v4.

---

## Notebooks

### `POST /notebooks`

Create a new notebook.

**Request:**
```json
{
  "name": "Thermodynamics",
  "description": "Heat, work, and entropy — the laws that govern energy transfer"
}
```

**Response — 201:**
```json
{
  "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "name": "Thermodynamics",
  "description": "Heat, work, and entropy — the laws that govern energy transfer",
  "created_at": "2026-07-20T12:00:00Z",
  "accessed_at": "2026-07-20T12:00:00Z",
  "access_count": 0
}
```

---

### `GET /notebooks`

List all notebooks, newest first.

**Response — 200:**
```json
[
  {
    "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "name": "Thermodynamics",
    "description": "Heat, work, and entropy — the laws that govern energy transfer",
    "created_at": "2026-07-20T12:00:00Z",
    "accessed_at": "2026-07-20T12:00:00Z",
    "access_count": 0
  }
]
```

---

### `GET /notebooks/{notebook_id}`

Get a single notebook. Increments `access_count` and updates `accessed_at` on each call.

**Response — 200:**
```json
{
  "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "name": "Thermodynamics",
  "description": "Heat, work, and entropy — the laws that govern energy transfer",
  "created_at": "2026-07-20T12:00:00Z",
  "accessed_at": "2026-07-20T14:30:00Z",
  "access_count": 1
}
```

**Error — 404:**
```json
{
  "detail": "Notebook not found"
}
```

---

### `DELETE /notebooks/{notebook_id}`

Delete a notebook and all its topics, questions, notes, progress, messages, and documents (cascade).

**Response — 204:** (no body)

**Error — 404:**
```json
{
  "detail": "Notebook not found"
}
```

---

## Topics

### `POST /notebooks/{notebook_id}/topics/generate`

Generate subtopics for a notebook using the LLM. Sends `prompt` to the AI and creates Topic rows.

**Request:**
```json
{
  "prompt": "Thermodynamics"
}
```

**Response — 201:**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "notebook_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "title": "The First Law",
    "content": null,
    "created_at": "2026-07-20T12:00:05Z"
  },
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "notebook_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "title": "The Second Law",
    "content": null,
    "created_at": "2026-07-20T12:00:05Z"
  }
]
```

**Error — 404:**
```json
{
  "detail": "Notebook d290f1ee-6c54-4b01-90e6-d701748f0851 not found"
}
```

---

### `GET /notebooks/{notebook_id}/topics`

List all topics in a notebook, oldest first.

**Response — 200:**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "notebook_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "title": "The First Law",
    "content": null,
    "created_at": "2026-07-20T12:00:05Z"
  }
]
```

---

## Questions

### `POST /topics/{topic_id}/questions`

Create a question for a topic.

**Request (Open):**
```json
{
  "type": "open",
  "question": "Explain the difference between heat and work.",
  "answer": "Heat is energy transferred due to temperature difference, while work is energy transferred via force acting over a distance."
}
```

**Request (MCQ):**
```json
{
  "type": "mcq",
  "question": "What does the First Law of Thermodynamics state?",
  "options": [
    "Energy can be created",
    "Energy cannot be created or destroyed",
    "Entropy always increases",
    "Heat always flows cold to hot"
  ],
  "answer": "Energy cannot be created or destroyed"
}
```

**Response — 201:**
```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "topic_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "mcq",
  "question": "What does the First Law of Thermodynamics state?",
  "answer": "Energy cannot be created or destroyed",
  "options": [
    "Energy can be created",
    "Energy cannot be created or destroyed",
    "Entropy always increases",
    "Heat always flows cold to hot"
  ],
  "created_at": "2026-07-20T12:01:00Z"
}
```

**Error — 404:**
```json
{
  "detail": "Topic not found"
}
```

---

### `GET /topics/{topic_id}/questions`

List all questions for a topic, oldest first.

**Response — 200:**
```json
[
  {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "topic_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "type": "mcq",
    "question": "What does the First Law of Thermodynamics state?",
    "answer": "Energy cannot be created or destroyed",
    "options": [
      "Energy can be created",
      "Energy cannot be created or destroyed",
      "Entropy always increases",
      "Heat always flows cold to hot"
    ],
    "created_at": "2026-07-20T12:01:00Z"
  }
]
```

---

## Margin Notes

### `POST /topics/{topic_id}/notes`

Create a margin note on a topic.

**Request:**
```json
{
  "text": "Review with Prof. Martinez on Tuesday"
}
```

**Response — 201:**
```json
{
  "id": "d4e5f6a7-b8c9-0123-defa-234567890123",
  "topic_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "text": "Review with Prof. Martinez on Tuesday",
  "created_at": "2026-07-20T14:00:00Z"
}
```

**Error — 404:**
```json
{
  "detail": "Topic not found"
}
```

---

### `GET /topics/{topic_id}/notes`

List all margin notes for a topic, oldest first.

**Response — 200:**
```json
[
  {
    "id": "d4e5f6a7-b8c9-0123-defa-234567890123",
    "topic_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "text": "Review with Prof. Martinez on Tuesday",
    "created_at": "2026-07-20T14:00:00Z"
  }
]
```

---

### `DELETE /notes/{note_id}`

Delete a margin note.

**Response — 204:** (no body)

**Error — 404:**
```json
{
  "detail": "Note not found"
}
```

---

## Progress

### `GET /topics/{topic_id}/progress`

Get progress for a topic. Auto-creates with defaults if none exists.

**Response — 200:**
```json
{
  "id": "e5f6a7b8-c9d0-1234-efab-345678901234",
  "topic_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "read": false,
  "quizzed": false,
  "score": 0,
  "created_at": "2026-07-20T12:00:05Z",
  "updated_at": "2026-07-20T12:00:05Z"
}
```

---

### `PATCH /topics/{topic_id}/progress`

Update progress fields. Only sent fields are updated; omitted fields stay unchanged.

**Request:**
```json
{
  "read": true,
  "score": 3
}
```

**Response — 200:**
```json
{
  "id": "e5f6a7b8-c9d0-1234-efab-345678901234",
  "topic_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "read": true,
  "quizzed": false,
  "score": 3,
  "created_at": "2026-07-20T12:00:05Z",
  "updated_at": "2026-07-20T15:00:00Z"
}
```

---

## Documents

### `POST /notebooks/{notebook_id}/documents`

Upload a file to a notebook. Send as `multipart/form-data`.

**Request:**
```
Content-Type: multipart/form-data
Body: file=<binary>
```

**Response — 201:**
```json
{
  "id": "f6a7b8c9-d0e1-2345-fabc-456789012345",
  "notebook_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "filename": "thermodynamics_notes.pdf",
  "content_type": "application/pdf",
  "size_bytes": 245760,
  "created_at": "2026-07-20T12:05:00Z"
}
```

**Error — 404:**
```json
{
  "detail": "Notebook not found"
}
```

---

### `GET /notebooks/{notebook_id}/documents`

List all documents in a notebook, newest first.

**Response — 200:**
```json
[
  {
    "id": "f6a7b8c9-d0e1-2345-fabc-456789012345",
    "notebook_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "filename": "thermodynamics_notes.pdf",
    "content_type": "application/pdf",
    "size_bytes": 245760,
    "created_at": "2026-07-20T12:05:00Z"
  }
]
```

---

### `DELETE /documents/{document_id}`

Delete a document.

**Response — 204:** (no body)

**Error — 404:**
```json
{
  "detail": "Document not found"
}
```

---

## Chat

### `POST /chat`

Send a message in a topic's chat. Currently returns an echo (LLM integration pending).

**Request:**
```json
{
  "topic_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "message": "What is internal energy?"
}
```

**Response — 200:**
```json
{
  "reply": "Echo: What is internal energy?"
}
```

---

## Error Format

All errors follow this shape:

```json
{
  "detail": "<message>"
}
```

| Status | Meaning |
|--------|---------|
| `404`  | Resource not found |
| `422`  | Validation error (missing/invalid fields) |
| `500`  | Internal server error |
