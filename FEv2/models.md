# Frontend Data Models — The Marginalia (FEv2)

> Extracted from `src/lib/mockData.js`, `src/lib/api.js`, `src/components/`, and `src/features/`.

---

## Core Domain Models

### Notebook

**Source:** `src/lib/mockData.js`

| Field         | Type       | Description                          |
|---------------|------------|--------------------------------------|
| `id`          | `string`   | Unique ID, prefixed `nb_`            |
| `title`       | `string`   | Notebook title                       |
| `description` | `string`   | Short description                    |
| `createdAt`   | `string`   | ISO 8601 timestamp                   |
| `accessedAt`  | `string`   | ISO 8601 timestamp (last access)     |
| `accessCount` | `number`   | How many times the notebook was opened |
| `topics`      | `Topic[]`  | Child topics                         |

```js
{
  id: 'nb_1',
  title: 'Thermodynamics',
  description: 'Heat, work, and entropy — the laws that govern energy transfer',
  createdAt: '2025-04-10T08:00:00Z',
  accessedAt: '2025-07-14T10:30:00Z',
  accessCount: 8,
  topics: [ /* Topic[] */ ]
}
```

---

### Topic

**Source:** `src/lib/mockData.js`

| Field         | Type            | Description                          |
|---------------|-----------------|--------------------------------------|
| `id`          | `string`        | Unique ID, prefixed `t_`             |
| `notebookId`  | `string`        | Parent notebook ID                   |
| `title`       | `string`        | Topic title                          |
| `content`     | `string`        | Markdown content (parsed manually in `ReadMode`) |
| `questions`   | `Question[]`    | Quiz questions                       |
| `userNotes`   | `MarginNote[]`  | Margin annotations                   |
| `progress`    | `Progress`      | Reading/quiz progress                |

```js
{
  id: 't_1',
  notebookId: 'nb_1',
  title: 'The First Law',
  content: '# The First Law of Thermodynamics\n\nEnergy cannot be created...',
  questions: [ /* Question[] */ ],
  userNotes: [ /* MarginNote[] */ ],
  progress: { read: true, quizzed: true, score: 2 }
}
```

---

### Question

**Source:** `src/lib/mockData.js`

Union type — two variants:

#### MCQ Variant

| Field     | Type       | Description                          |
|-----------|------------|--------------------------------------|
| `id`      | `string`   | Unique ID, prefixed `q_`             |
| `type`    | `'mcq'`    | Discriminant literal                 |
| `question`| `string`   | Question text                        |
| `options` | `string[]` | 4 answer choices                     |
| `answer`  | `number`   | Index into `options` (0-based)       |

```js
{
  id: 'q_1',
  type: 'mcq',
  question: 'What does the First Law of Thermodynamics state?',
  options: ['Energy can be created', 'Energy cannot be created or destroyed', 'Entropy always increases', 'Heat always flows cold to hot'],
  answer: 1
}
```

#### Open Variant

| Field     | Type       | Description                          |
|-----------|------------|--------------------------------------|
| `id`      | `string`   | Unique ID, prefixed `q_`             |
| `type`    | `'open'`   | Discriminant literal                 |
| `question`| `string`   | Question text                        |
| `answer`  | `string`   | Model answer text                    |

```js
{
  id: 'q_2',
  type: 'open',
  question: 'Explain the difference between heat and work...',
  answer: 'Heat is energy transferred due to temperature difference...'
}
```

---

### MarginNote

**Source:** `src/lib/mockData.js` (API-backed) and `src/components/marginalia/useMarginalia.js` (localStorage-backed)

Two variants exist depending on storage:

#### API-Backed (mockData.js)

| Field       | Type     | Description                          |
|-------------|----------|--------------------------------------|
| `id`        | `string` | Unique ID, prefixed `n_`             |
| `text`      | `string` | Note content                         |
| `timestamp` | `string` | ISO 8601 timestamp                   |

#### localStorage-Backed (useMarginalia.js)

| Field       | Type     | Description                          |
|-------------|----------|--------------------------------------|
| `id`        | `string` | `note_{Date.now()}_{random5chars}`   |
| `text`      | `string` | Note content (trimmed)               |
| `timestamp` | `string` | ISO 8601 timestamp                   |

```js
// API-backed
{ id: 'n_1', text: 'Review with Prof. Martinez on Tuesday', timestamp: '2025-07-10T14:00:00Z' }

// localStorage-backed
{ id: 'note_1720000000000_abc12', text: 'Remember this concept', timestamp: '2025-07-14T11:00:00Z' }
```

---

### Progress

**Source:** `src/lib/mockData.js`

| Field     | Type      | Description                          |
|-----------|-----------|--------------------------------------|
| `read`    | `boolean` | Has the topic been read?             |
| `quizzed` | `boolean` | Has the topic been quizzed?          |
| `score`   | `number`  | Quiz score (correct answers count)   |

```js
{ read: true, quizzed: true, score: 2 }
```

---

## UI / State Models

### ChatMessage

**Source:** `src/features/session/TopicSession.jsx:204-208` (inline in `LearnMode`)

| Field     | Type                       | Description              |
|-----------|----------------------------|--------------------------|
| `id`      | `string`                   | `'1'`, `user_{ts}`, `ai_{ts}` |
| `role`    | `'user' \| 'assistant'`   | Message sender           |
| `content` | `string`                   | Message body             |

```js
{ id: '1', role: 'assistant', content: 'I can help you understand "The First Law". What would you like to know?' }
{ id: 'user_1720000000000', role: 'user', content: 'What is internal energy?' }
```

---

### DashboardStats

**Source:** `src/features/dashboard/DashboardPage.jsx:9-16` (hardcoded mock)

| Field              | Type       | Description                     |
|--------------------|------------|---------------------------------|
| `streak`           | `number`   | Consecutive day streak          |
| `totalPages`       | `number`   | Total pages read                |
| `totalHours`       | `number`   | Total hours studied             |
| `topicsCompleted`  | `number`   | Number of completed topics      |
| `topicsTotal`      | `number`   | Total number of topics          |
| `weeklyActivity`   | `number[]` | 7 values (Mon-Sun), hours each  |

```js
{
  streak: 12,
  totalPages: 147,
  totalHours: 34.5,
  topicsCompleted: 8,
  topicsTotal: 11,
  weeklyActivity: [3, 5, 2, 4, 6, 1, 3]
}
```

---

### ThemeOption

**Source:** `src/features/settings/SettingsPage.jsx:6-10`

| Field         | Type                 | Description                          |
|---------------|----------------------|--------------------------------------|
| `id`          | `string`             | Theme identifier                     |
| `label`       | `string`             | Display name                         |
| `description` | `string`             | Short description                    |
| `swatch`      | `[string, string]`   | `[background, foreground]` hex colors |

```js
[
  { id: 'light', label: 'Light', description: 'Warm parchment', swatch: ['#F1EAD9', '#2A241C'] },
  { id: 'dark',  label: 'Dark',  description: 'Ink blue',       swatch: ['#1A1C2A', '#E0DCC8'] },
  { id: 'nord',  label: 'Nord',  description: 'Cool blue-gray', swatch: ['#2E3440', '#ECEFF4'] }
]
```

---

## Design Token Models

### ThemePalette

**Source:** `src/design/tokens.js`

| Field       | Type     | Description                          |
|-------------|----------|--------------------------------------|
| `paper`     | `string` | Primary background                   |
| `paperDark` | `string` | Secondary/darker background          |
| `ink`       | `string` | Primary text color                   |
| `pine`      | `string` | Accent / success color               |
| `claret`    | `string` | Error / destructive color            |
| `walnut`    | `string` | Muted / secondary text               |
| `brass`     | `string` | Highlight / warning color            |

```js
// light theme
{ paper: '#F1EAD9', paperDark: '#E8DFC8', ink: '#2A241C', pine: '#39493D', claret: '#6E2E2C', walnut: '#5A4331', brass: '#9C7A3C' }
```

Three palettes defined: `light`, `dark`, `nord`.

---

### DesignTokens

**Source:** `src/design/tokens.js`

| Field     | Type                        | Description                     |
|-----------|-----------------------------|---------------------------------|
| `colors`  | `ThemePalette`              | Active color palette            |
| `fonts`   | `{ display, body, hand, mono }` | Font stacks                  |
| `shadows` | `{ hard, lifted }`          | Box shadow strings              |
| `radii`   | `{ card, button }`          | Border radius values            |
| `spacing` | `{ readingMax, gridMax, marginRail }` | Layout constraints  |

```js
{
  colors: themePalettes.light,
  fonts: {
    display: "'Cormorant Garamond', Georgia, serif",
    body: "'EB Garamond', Georgia, serif",
    hand: "'Caveat', cursive",
    mono: "'Courier Prime', Consolas, monospace"
  },
  shadows: {
    hard: '2px 3px 0 rgba(42, 36, 28, 0.06)',
    lifted: '3px 5px 0 rgba(42, 36, 28, 0.09)'
  },
  radii: { card: '2px', button: '3px' },
  spacing: { readingMax: '680px', gridMax: '1040px', marginRail: '200px' }
}
```

---

## Derived / Computed Models

### PaperAge

**Source:** `src/lib/earnedDetails.js`

| Type   | Value         | Opacity |
|--------|---------------|---------|
| `'new'`         | `< 7 days`    | `0`     |
| `'fresh'`       | `7–29 days`   | `0.01`  |
| `'worn'`        | `30–89 days`  | `0.02`  |
| `'well-loved'`  | `>= 90 days`  | `0.04`  |

Computed from `Notebook.createdAt`. Controls paper texture opacity on cards.

---

### EarnedDetails

**Source:** `src/lib/earnedDetails.js`

| Field       | Type        | Condition                        |
|-------------|-------------|----------------------------------|
| `coffeeRing`| `boolean`   | `accessCount >= 5`               |
| `dogEar`    | `boolean`   | All topics have `progress.read === true` |
| `paperAge`  | `PaperAge`  | Derived from `createdAt`         |

These determine which decorative textures (coffee ring, dog-ear fold) appear on notebook cards in the library.

---

## API Layer

**Source:** `src/lib/api.js` (wraps `mockData.js` with simulated delay)

| Function                                    | Returns               | Delay  |
|---------------------------------------------|-----------------------|--------|
| `fetchNotebooks()`                          | `Notebook[]`          | 200ms  |
| `fetchNotebook(id)`                         | `Notebook \| null`    | 150ms  |
| `fetchTopic(notebookId, topicId)`           | `Topic \| null`       | 150ms  |
| `createNotebook(title, description)`        | `Notebook`            | 300ms  |
| `createTopic(notebookId, title, content)`   | `Topic`               | 200ms  |
| `addMarginNote(notebookId, topicId, text)`  | `MarginNote`          | 100ms  |
| `updateTopicContent(notebookId, topicId, content)` | `Topic`        | 150ms  |
| `generateTopics(notebookId, prompt)`        | `Topic[]`             | 500ms  |

All functions are `async`. Currently backed by in-memory mock data — ready to swap for real HTTP calls (axios is installed but unused).

---

## localStorage Keys

| Key                    | Value Shape                          | Source                    |
|------------------------|--------------------------------------|---------------------------|
| `marginalia-theme`     | `'light' \| 'dark' \| 'nord'`       | `src/lib/useTheme.js`     |
| `marginalia-notes`     | `{ [topicId: string]: MarginNote[] }` | `src/components/marginalia/useMarginalia.js` |

---

## Relationships

```
Notebook  1 ──── *  Topic
Topic     1 ──── *  Question
Topic     1 ──── *  MarginNote
Topic     1 ─────   Progress
```
