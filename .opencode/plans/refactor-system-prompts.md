# Plan: Refactor System Prompts & Add Follow-Up Question Buttons

## Goal
Refactor all chat system prompts to remove length constraints, format responses in markdown, and add suggested follow-up questions as clickable buttons after each AI reply.

**Key decisions:**
- Remove hint system entirely (no more deep_dive, clarify, etc.)
- AI responds based purely on the follow-up question text
- Pill-shaped buttons with "Suggested questions" label above

---

## Changes Overview

### 1. Backend - System Prompts (`backend/app/services/chat.py`)

**Remove TEACHING_MODES dict (lines 18-26):**
Delete the entire dict. The hint system is removed.

**Remove `chosen_suggestion_hint` parameter:**
- Remove from `chat_with_topic()` method signature
- Remove mode_line logic (lines 110-115)
- The AI now responds based purely on the follow-up question text

**Update Prompt B (First Message, lines 104-108):**
```python
system_prompt = (
    f"You are a knowledgeable tutor helping a student learn about: {topic_title}.{content_context}\n\n"
    "Welcome the student warmly. Briefly introduce what this topic covers. "
    "Use markdown formatting for clarity (headers, bold, bullet points as appropriate). "
    "End with 2-4 natural follow-up questions the student might want to explore next."
)
```

**Update Prompt C (Ongoing Conversation, lines 117-124):**
```python
system_prompt = (
    f"You are a knowledgeable tutor guiding a student through: {topic_title}.{content_context}\n\n"
    "- Respond thoroughly and in depth. Use markdown formatting naturally.\n"
    "- Generate 2-4 natural follow-up questions the student might want to ask next.\n"
    "- Questions should cover different aspects: deeper exploration, real-world examples, clarifications, connections.\n"
    "- Never repeat topics already covered in the conversation.\n"
    "- If study notes exist, reference them naturally."
)
```

**Update Hint Deduplication (lines 129-133):**
```python
messages.append({
    "role": "system",
    "content": f"[Follow-up questions already offered: {', '.join(msg.suggestion_hints)}. Offer different questions.]",
})
```

**Update Fallback Suggestions (lines 138-143):**
```python
if not result.suggestions:
    result.suggestions = [
        SuggestionItem(text="Can you explain this in more detail?"),
        SuggestionItem(text="How is this used in practice?"),
        SuggestionItem(text="Can you clarify that?"),
    ]
```

### 2. Backend - Schema Updates (`backend/app/schemas/chat.py`)

**SuggestionItem (lines 25-29):**
Remove `hint` field entirely:
```python
class SuggestionItem(BaseModel):
    text: str = Field(description="Natural follow-up question the student might ask next.")
```

**ChatRequest (lines 15-22):**
Remove `chosen_suggestion_hint` field:
```python
class ChatRequest(BaseModel):
    topic_id: uuid.UUID
    message: str
    chat_history: list[ChatMessage] = []
```

**ChatReply (lines 32-45):**
Update suggestions description:
```python
suggestions: list[SuggestionItem] = Field(
    default_factory=list,
    description="2-4 natural follow-up questions.",
)
```

**SuggestionItemResponse (lines 48-50):**
Remove `hint` field:
```python
class SuggestionItemResponse(BaseModel):
    text: str
```

### 3. Backend - API Route (`backend/app/api/v1/chat.py`)

**Remove `chosen_suggestion_hint` from call (line 37):**
```python
result = await ai_service.chat_with_topic(
    topic_title=topic.title,
    topic_id=body.topic_id,
    user_message=body.message,
    chat_history=body.chat_history,
)
```

**Update response mapping (line 46):**
```python
suggestions=[{"text": s.text} for s in result.suggestions],
```

### 4. Frontend - `TopicSession.jsx`

**Update initial greeting (lines 48-61):**
```javascript
setChatMessages([
  {
    id: '1',
    role: 'assistant',
    content: `Welcome! Let's explore **${nb?.title || 'this topic'}** together. I'll help you understand it step by step.\n\nWhat aspect would you like to dive into first?`,
    responseType: 'conversational',
    suggestions: [
      { text: 'Give me an overview of this topic' },
      { text: 'What are the key concepts?' },
      { text: 'Explain the basics to me' },
    ],
    keyTakeaways: [],
  },
])
```

**Update sendMessage (lines 323-365):**
Remove `suggestionHint` parameter and `chosen_suggestion_hint` from API call:
```javascript
const sendMessage = async (text) => {
  // ... existing code ...
  const result = await api.sendChatMessage(topic.id, text, historyForApi)
  // ...
}
```

**Update suggestion buttons (lines 416-428):**
Pill-shaped buttons with label:
```jsx
{showSuggestions && (
  <div className="mb-3">
    <p className="text-xs font-mono text-walnut/40 mb-2">Suggested questions</p>
    <div className="flex flex-wrap gap-2">
      {latestSuggestions.suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => sendMessage(s.text)}
          className="px-3 py-1.5 text-sm font-body bg-paper-dark/50 border border-walnut/15 rounded-full text-walnut hover:text-ink hover:bg-paper-dark transition-colors cursor-pointer"
        >
          {s.text}
        </button>
      ))}
    </div>
  </div>
)}
```

**Update handleSuggestionSelect (lines 370-372):**
Remove since we now call `sendMessage(s.text)` directly:
```javascript
// Remove this function entirely
```

### 5. Frontend - API Client (`FEv2/src/lib/api.js`)

**Update sendChatMessage:**
Remove `chosen_suggestion_hint` parameter.

---

## Files Modified

1. `backend/app/services/chat.py` - System prompts, remove TEACHING_MODES
2. `backend/app/schemas/chat.py` - Remove hint field from SuggestionItem
3. `backend/app/api/v1/chat.py` - Remove hint from request/response
4. `FEv2/src/features/session/TopicSession.jsx` - Update greeting, suggestion buttons
5. `FEv2/src/lib/api.js` - Remove hint parameter

---

## Summary

| Component | Change |
|-----------|--------|
| System prompts | Remove length limits, allow markdown, frame suggestions as follow-up questions |
| TEACHING_MODES | Removed entirely |
| Hint system | Removed - AI responds based on question text only |
| Schema | Remove hint field from SuggestionItem |
| Frontend greeting | Update to match new style |
| Suggestion buttons | Pill-shaped, "Suggested questions" label above |
| Markdown rendering | Already working, no changes needed |
