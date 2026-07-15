import { PaperTexture } from '@/design/textures'

function PageShell({ children, className = '' }) {
  return (
    <div className="min-h-screen bg-paper relative">
      <PaperTexture />
      <div className={`mx-auto max-w-[1040px] px-6 py-8 ${className}`}>
        {children}
      </div>
    </div>
  )
}

export { PageShell }
