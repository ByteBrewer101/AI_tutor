import * as mock from './mockData'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

export async function fetchNotebooks() {
  await delay(200)
  return mock.getNotebooks()
}

export async function fetchNotebook(id) {
  await delay(150)
  return mock.getNotebook(id)
}

export async function fetchTopic(notebookId, topicId) {
  await delay(150)
  return mock.getTopic(notebookId, topicId)
}

export async function createNotebook(title, description) {
  await delay(300)
  return mock.createNotebook(title, description)
}

export async function createTopic(notebookId, title, content) {
  await delay(200)
  return mock.createTopic(notebookId, title, content)
}

export async function addMarginNote(notebookId, topicId, text) {
  await delay(100)
  return mock.addMarginNote(notebookId, topicId, text)
}

export async function updateTopicContent(notebookId, topicId, content) {
  await delay(150)
  return mock.updateTopicContent(notebookId, topicId, content)
}

export async function generateTopics(notebookId, prompt) {
  await delay(500)
  return mock.generateTopics(notebookId, prompt)
}
