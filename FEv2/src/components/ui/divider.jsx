import { cn } from '@/lib/utils'

function Divider({ className, variant = 'default', ...props }) {
  if (variant === 'dinkus') {
    return (
      <div className={cn('flex items-center justify-center gap-3 py-8 text-walnut/40', className)} {...props}>
        <span className="block h-px w-12 bg-walnut/25" />
        <span className="font-display text-lg tracking-widest">⁂</span>
        <span className="block h-px w-12 bg-walnut/25" />
      </div>
    )
  }

  return (
    <div
      className={cn('h-px bg-walnut/25 my-4', className)}
      role="separator"
      {...props}
    />
  )
}

export { Divider }
