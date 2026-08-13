import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { InkInput } from '@/components/ui/input'
import { PROVIDERS, getDefaultModelConfig, saveModelConfig } from '@/lib/modelConfig'

const REPO_URL = 'https://github.com/ByteBrewer101/AI_tutor'

function AiSetupDialog({ open, onClose }) {
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [error, setError] = useState(null)

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('Enter your Gemini API key to continue.')
      return
    }
    try {
      saveModelConfig({
        provider: 'gemini',
        model: PROVIDERS.gemini.defaultModel,
        baseUrl: '',
        apiKey: apiKey.trim(),
      })
      setError(null)
      setApiKey('')
      onClose()
    } catch {
      setError('Could not save your API key. Try again.')
    }
  }

  const handleSelfHost = () => {
    try {
      saveModelConfig(getDefaultModelConfig())
    } catch { /* ignore */ }
    window.open(REPO_URL, '_blank', 'noopener,noreferrer')
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set up AI</DialogTitle>
          <DialogDescription>
            AI features — chat, generating topics, and quizzes — need an AI provider. You can either add a Google Gemini API key or self-host with Ollama for offline use.
          </DialogDescription>
        </DialogHeader>

        <p className="text-xs text-walnut/50 font-body">
          You can still explore and read notebooks without setting this up. You'll just be skipping the AI-powered features.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-walnut font-body block mb-1.5">
              Google Gemini API key
            </label>
            <div className="flex items-center gap-2">
              <InkInput
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value)
                  setError(null)
                }}
                placeholder="AIza…"
                autoComplete="off"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-xs font-mono text-walnut/50 hover:text-pine whitespace-nowrap"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-walnut/50 font-mono mt-1">
              Stored only in your browser. Never sent to or saved on the server.
            </p>
          </div>

          <Button variant="secondary" className="w-full" onClick={handleSelfHost}>
            Self-host with Ollama (offline)
            <ExternalLink size={14} />
          </Button>
        </div>

        {error && <p className="text-sm text-claret font-body">{error}</p>}

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!apiKey.trim()}>
            Save API key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { AiSetupDialog }
