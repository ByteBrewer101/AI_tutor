let notebooks = [
  {
    id: 'nb_1',
    title: 'Thermodynamics',
    description: 'Heat, work, and entropy — the laws that govern energy transfer',
    createdAt: '2025-04-10T08:00:00Z',
    accessedAt: '2025-07-14T10:30:00Z',
    accessCount: 8,
    topics: [
      {
        id: 't_1',
        notebookId: 'nb_1',
        title: 'The First Law',
        content: `# The First Law of Thermodynamics\n\nEnergy cannot be created or destroyed in an isolated system. The total energy of an isolated system remains constant.\n\n## Key Concepts\n\n**Internal Energy (U)** — The total kinetic and potential energy of all molecules in a system.\n\n**Heat (Q)** — Energy transferred due to temperature difference.\n\n**Work (W)** — Energy transferred through mechanical means.\n\nThe mathematical expression:\n\n$$\\Delta U = Q - W$$\n\n## Implications\n\nThis law tells us that perpetual motion machines of the first kind are impossible. Every process must account for where the energy comes from and where it goes.\n\n> "You can't get something for nothing." — Common phrasing`,
        questions: [
          { id: 'q_1', type: 'mcq', question: 'What does the First Law of Thermodynamics state?', options: ['Energy can be created', 'Energy cannot be created or destroyed', 'Entropy always increases', 'Heat always flows cold to hot'], answer: 1 },
          { id: 'q_2', type: 'open', question: 'Explain the difference between heat and work in the context of the First Law.', answer: 'Heat is energy transferred due to temperature difference, while work is energy transferred through mechanical means. Both change the internal energy of a system, but they are fundamentally different transfer mechanisms.' },
          { id: 'q_3', type: 'mcq', question: 'In the equation ΔU = Q - W, what does W represent?', options: ['Weight', 'Work done by the system', 'Total energy', 'Temperature'], answer: 1 },
        ],
        userNotes: [
          { id: 'n_1', text: 'Review with Prof. Martinez on Tuesday', timestamp: '2025-07-10T14:00:00Z' },
          { id: 'n_2', text: 'Connect to Carnot cycle in Ch. 5', timestamp: '2025-07-12T09:15:00Z' },
        ],
        progress: { read: true, quizzed: true, score: 2 },
      },
      {
        id: 't_2',
        notebookId: 'nb_1',
        title: 'The Second Law',
        content: `# The Second Law of Thermodynamics\n\nThe entropy of an isolated system never decreases. Heat spontaneously flows from hot to cold, never the reverse.\n\n## Entropy\n\nEntropy (S) is a measure of disorder or randomness. The Second Law tells us that natural processes tend toward greater entropy.\n\n$$\\Delta S_{universe} \\geq 0$$\n\n## Heat Engines\n\nA heat engine converts thermal energy to work. No engine can be 100% efficient — some energy must be wasted as heat to a cold reservoir.\n\n**Carnot Efficiency:**\n$$\\eta = 1 - \\frac{T_{cold}}{T_{hot}}$$\n\n## The Arrow of Time\n\nThe Second Law gives time its direction. We remember the past (lower entropy) and move toward the future (higher entropy).`,
        questions: [
          { id: 'q_4', type: 'mcq', question: 'What does the Second Law say about entropy?', options: ['It always decreases', 'It stays constant', 'It never decreases in an isolated system', 'It only increases in open systems'], answer: 2 },
          { id: 'q_5', type: 'open', question: 'Why can no heat engine be 100% efficient?', answer: 'The Second Law requires that some energy must be rejected to a cold reservoir. A 100% efficient engine would violate the Second Law by converting all heat to work without any entropy increase.' },
        ],
        userNotes: [
          { id: 'n_3', text: 'The arrow of time connection is fascinating', timestamp: '2025-07-14T11:00:00Z' },
        ],
        progress: { read: true, quizzed: false, score: 0 },
      },
      {
        id: 't_3',
        notebookId: 'nb_1',
        title: 'The Third Law',
        content: `# The Third Law of Thermodynamics\n\nAs temperature approaches absolute zero, the entropy of a perfect crystal approaches zero.\n\n## Implications\n\n- Absolute zero (0 K) is theoretically unreachable\n- Perfect order is achievable only at absolute zero\n- Provides a reference point for entropy calculations`,
        questions: [
          { id: 'q_6', type: 'mcq', question: 'What happens to entropy as temperature approaches absolute zero?', options: ['It increases', 'It approaches zero for a perfect crystal', 'It becomes infinite', 'It oscillates'], answer: 1 },
        ],
        userNotes: [],
        progress: { read: false, quizzed: false, score: 0 },
      },
    ],
  },
  {
    id: 'nb_2',
    title: 'Organic Chemistry',
    description: 'Carbon compounds, reaction mechanisms, and functional groups',
    createdAt: '2025-05-20T10:00:00Z',
    accessedAt: '2025-07-13T16:45:00Z',
    accessCount: 6,
    topics: [
      {
        id: 't_4',
        notebookId: 'nb_2',
        title: 'Functional Groups',
        content: `# Functional Groups\n\nFunctional groups are specific groups of atoms within molecules that are responsible for the characteristic chemical reactions of those molecules.\n\n## Common Functional Groups\n\n- **Hydroxyl (-OH)** — Alcohols\n- **Carbonyl (C=O)** — Aldehydes, Ketones\n- **Carboxyl (-COOH)** — Carboxylic Acids\n- **Amine (-NH₂)** — Amines\n- **Ester (-COO-)** — Esters`,
        questions: [
          { id: 'q_7', type: 'mcq', question: 'Which functional group characterizes alcohols?', options: ['Carbonyl', 'Hydroxyl', 'Carboxyl', 'Amine'], answer: 1 },
        ],
        userNotes: [
          { id: 'n_4', text: 'Make flashcards for all functional groups', timestamp: '2025-07-13T17:00:00Z' },
        ],
        progress: { read: true, quizzed: true, score: 1 },
      },
      {
        id: 't_5',
        notebookId: 'nb_2',
        title: 'Reaction Mechanisms',
        content: `# Reaction Mechanisms\n\nOrganic reactions proceed through step-by-step mechanisms involving the movement of electron pairs.\n\n## Types of Mechanisms\n\n- **Nucleophilic substitution (SN1, SN2)**\n- **Elimination (E1, E2)**\n- **Addition reactions**\n- **Radical reactions**`,
        questions: [],
        userNotes: [],
        progress: { read: false, quizzed: false, score: 0 },
      },
    ],
  },
  {
    id: 'nb_3',
    title: 'Modern History',
    description: 'World wars, cold war, and the making of the modern world',
    createdAt: '2025-06-01T09:00:00Z',
    accessedAt: '2025-07-11T14:20:00Z',
    accessCount: 3,
    topics: [
      {
        id: 't_6',
        notebookId: 'nb_3',
        title: 'The Cold War',
        content: `# The Cold War (1947–1991)\n\nA state of geopolitical tension between the United States and the Soviet Union and their respective allies.\n\n## Key Events\n\n- Berlin Blockade (1948-49)\n- Korean War (1950-53)\n- Cuban Missile Crisis (1962)\n- Vietnam War (1955-75)\n- Fall of the Berlin Wall (1989)\n\n## Ideologies\n\n**Capitalism vs. Communism** — Two fundamentally different visions of economics, governance, and individual rights.`,
        questions: [
          { id: 'q_8', type: 'mcq', question: 'When did the Cold War end?', options: ['1989', '1991', '1975', '1962'], answer: 1 },
        ],
        userNotes: [],
        progress: { read: true, quizzed: true, score: 1 },
      },
    ],
  },
]

let nextId = 100

export function getNotebooks() {
  return notebooks
}

export function getNotebook(id) {
  return notebooks.find((nb) => nb.id === id) || null
}

export function getTopic(notebookId, topicId) {
  const nb = getNotebook(notebookId)
  if (!nb) return null
  return nb.topics.find((t) => t.id === topicId) || null
}

export function createNotebook(title, description = '') {
  const newNotebook = {
    id: `nb_${nextId++}`,
    title,
    description,
    createdAt: new Date().toISOString(),
    accessedAt: new Date().toISOString(),
    accessCount: 0,
    topics: [],
  }
  notebooks = [newNotebook, ...notebooks]
  return newNotebook
}

export function createTopic(notebookId, title, content = '') {
  const nb = getNotebook(notebookId)
  if (!nb) return null
  const newTopic = {
    id: `t_${nextId++}`,
    notebookId,
    title,
    content,
    questions: [],
    userNotes: [],
    progress: { read: false, quizzed: false, score: 0 },
  }
  nb.topics.push(newTopic)
  nb.accessedAt = new Date().toISOString()
  return newTopic
}

export function addMarginNote(notebookId, topicId, text) {
  const topic = getTopic(notebookId, topicId)
  if (!topic) return null
  const note = {
    id: `n_${nextId++}`,
    text,
    timestamp: new Date().toISOString(),
  }
  topic.userNotes.push(note)
  return note
}

export function updateTopicContent(notebookId, topicId, content) {
  const topic = getTopic(notebookId, topicId)
  if (!topic) return null
  topic.content = content
  return topic
}

export function generateTopics(notebookId, prompt) {
  const nb = getNotebook(notebookId)
  if (!nb) return []

  const generated = [
    { title: `${prompt} — Fundamentals`, content: `# ${prompt} — Fundamentals\n\nThis is the foundational overview of ${prompt}. Content will be generated by the AI backend.\n\n## Key Concepts\n\n- Concept 1\n- Concept 2\n- Concept 3` },
    { title: `${prompt} — Advanced Topics`, content: `# ${prompt} — Advanced Topics\n\nDeeper exploration of ${prompt} for when you're ready to go beyond the basics.` },
    { title: `${prompt} — Practice & Review`, content: `# ${prompt} — Practice & Review\n\nKey problems and review questions to test your understanding.` },
  ]

  return generated.map((g) => createTopic(notebookId, g.title, g.content))
}
