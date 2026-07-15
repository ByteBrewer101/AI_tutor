import { cn } from '@/lib/utils'

function Stamp({ children, className, variant = 'brass', ...props }) {
  const variants = {
    brass: 'text-brass border-brass/60',
    pine: 'text-pine border-pine/60',
    claret: 'text-claret border-claret/60',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-hand text-sm',
        'border px-2 py-0.5 rounded-[2px]',
        'rotate-[-3deg]',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { Stamp }
