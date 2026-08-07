import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/useAuth'
import { PaperTexture } from '@/design/textures'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InkInput } from '@/components/ui/input'

function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signup(email, password, displayName)
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not create account')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper relative flex items-center justify-center px-6 py-12">
      <PaperTexture />
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <span className="font-display text-3xl font-semibold text-pine">
            Nuro
          </span>
          <p className="font-body text-walnut mt-2">
            Open a fresh notebook and start studying.
          </p>
        </div>

        <Card seed={11}>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm text-walnut font-body block mb-1">
                  Display name
                </label>
                <InkInput
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Jane Scholar"
                  autoComplete="name"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-walnut font-body block mb-1">
                  Email
                </label>
                <InkInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.edu"
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-walnut font-body block mb-1">
                  Password
                </label>
                <InkInput
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-claret font-body">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Creating account…' : 'Create account'}
              </Button>
            </form>

            <p className="mt-5 text-center font-body text-sm text-walnut">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-pine underline underline-offset-4 decoration-pine/40 no-underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { SignupPage }
