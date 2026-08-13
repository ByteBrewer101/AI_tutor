const STORAGE_KEY = 'ai_tutor_model_config'

export const PROVIDERS = {
  ollama: {
    id: 'ollama',
    label: 'Ollama (local)',
    defaultModel: 'llama3.2',
    defaultBaseUrl: 'http://localhost:11434',
    needsApiKey: false,
  },
  gemini: {
    id: 'gemini',
    label: 'Google Gemini',
    defaultModel: 'gemini-2.5-flash',
    defaultBaseUrl: '',
    needsApiKey: true,
  },
}

export function isModelConfigured() {
  let raw
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return false
  }
  if (!raw) return false
  try {
    const parsed = JSON.parse(raw)
    if (parsed.provider === 'gemini') return !!parsed.apiKey
    return true
  } catch {
    return false
  }
}

export function getDefaultModelConfig() {
  return {
    provider: 'ollama',
    model: PROVIDERS.ollama.defaultModel,
    baseUrl: PROVIDERS.ollama.defaultBaseUrl,
    apiKey: '',
  }
}

export function loadModelConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultModelConfig()
    const parsed = JSON.parse(raw)
    const provider = PROVIDERS[parsed.provider] ? parsed.provider : 'ollama'
    const defaults = PROVIDERS[provider]
    return {
      provider,
      model: parsed.model || defaults.defaultModel,
      baseUrl: parsed.baseUrl || defaults.defaultBaseUrl,
      apiKey: parsed.apiKey || '',
    }
  } catch {
    return getDefaultModelConfig()
  }
}

export function saveModelConfig(config) {
  const provider = PROVIDERS[config.provider] ? config.provider : 'ollama'
  const defaults = PROVIDERS[provider]
  const toStore = {
    provider,
    model: config.model || defaults.defaultModel,
    baseUrl: config.baseUrl || defaults.defaultBaseUrl,
    apiKey: config.apiKey || '',
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
  return toStore
}

export function toApiConfig(config) {
  const cfg = config || loadModelConfig()
  const out = {
    provider: cfg.provider,
    model: cfg.model,
  }
  if (cfg.provider === 'gemini' && cfg.apiKey) out.api_key = cfg.apiKey
  if (cfg.provider === 'ollama' && cfg.baseUrl) out.base_url = cfg.baseUrl
  return out
}

export function withModelConfig(body) {
  return { ...body, llm_config: toApiConfig() }
}
