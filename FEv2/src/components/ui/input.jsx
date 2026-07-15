import { cn } from '@/lib/utils'

function InkInput({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full bg-transparent border-b border-walnut/40 focus:border-pine',
        'font-body text-base py-1.5 outline-none placeholder:text-ink/40',
        'transition-colors duration-150',
        className
      )}
      {...props}
    />
  )
}

function InkTextarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full bg-transparent border-b border-walnut/40 focus:border-pine',
        'font-body text-base py-1.5 outline-none placeholder:text-ink/40',
        'transition-colors duration-150 resize-none',
        className
      )}
      {...props}
    />
  )
}

export { InkInput, InkTextarea }
