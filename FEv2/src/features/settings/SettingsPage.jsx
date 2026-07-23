import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/useTheme'

const themeOptions = [
  { id: 'light', label: 'Light', description: 'Warm parchment', swatch: ['#F1EAD9', '#2A241C'] },
  { id: 'dark', label: 'Dark', description: 'Ink blue', swatch: ['#1A1C2A', '#E0DCC8'] },
  { id: 'nord', label: 'Nord', description: 'Cool blue-gray', swatch: ['#2E3440', '#ECEFF4'] },
]

function SettingsPage() {
  const [fontSize, setFontSize] = useState(18)
  const [motionEnabled, setMotionEnabled] = useState(true)
  const { theme, isSystem, setTheme, setSystemPreference } = useTheme()

  return (
    <div>
      <h2 className="font-display text-2xl font-medium text-ink mb-8">
        Preferences
      </h2>

      <div className="space-y-6 max-w-lg">
        <Card seed={1}>
          <CardHeader>
            <CardTitle>Reading</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-walnut font-body block mb-2">
                Body text size: {fontSize}px
              </label>
              <input
                type="range"
                min="14"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-pine"
              />
              <div className="flex justify-between text-xs text-walnut/40 font-mono mt-1">
                <span>14px</span>
                <span>24px</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card seed={2}>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {themeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                  disabled={isSystem}
                  className={`flex items-center gap-2 px-3 py-2 rounded-[2px] border text-sm font-body transition-colors disabled:opacity-50 ${
                    theme === opt.id && !isSystem
                      ? 'border-pine bg-pine/5'
                      : 'border-walnut/20 hover:border-walnut/40'
                  }`}
                >
                  <div className="flex -space-x-1">
                    <div
                      className="w-4 h-4 rounded-full border border-walnut/20"
                      style={{ backgroundColor: opt.swatch[0] }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-walnut/20"
                      style={{ backgroundColor: opt.swatch[1] }}
                    />
                  </div>
                  {opt.label}
                </button>
              ))}
            </div>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-walnut font-body">
                Follow system preference
              </span>
              <button
                onClick={() => setSystemPreference(!isSystem)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  isSystem ? 'bg-pine' : 'bg-walnut/30'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-paper rounded-full transition-transform ${
                    isSystem ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </label>
            {isSystem && (
              <p className="text-xs text-walnut/50 font-mono">
                Currently using: {theme === 'dark' ? 'Dark' : 'Light'} (from OS)
              </p>
            )}
          </CardContent>
        </Card>

        <Card seed={3}>
          <CardHeader>
            <CardTitle>Motion</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-walnut font-body">
                Enable animations
              </span>
              <button
                onClick={() => setMotionEnabled(!motionEnabled)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  motionEnabled ? 'bg-pine' : 'bg-walnut/30'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-paper rounded-full transition-transform ${
                    motionEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </label>
          </CardContent>
        </Card>

        <Card seed={4}>
          <CardHeader>
            <CardTitle>Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="secondary" className="w-full justify-start">
              Export notes as Markdown
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              Export all data as JSON
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { SettingsPage }
