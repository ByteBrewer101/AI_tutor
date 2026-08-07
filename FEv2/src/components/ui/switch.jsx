import { cn } from '@/lib/utils'

function Switch({ checked, onChange, disabled = false, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'inline-flex items-center gap-2 group/switch disabled:opacity-50 disabled:pointer-events-none',
        className
      )}
    >
      <span
        className={cn(
          'relative w-9 h-5 rounded-full border transition-colors duration-200 shrink-0',
          checked
            ? 'bg-pine border-pine'
            : 'bg-paper border-walnut/40 group-hover/switch:border-walnut/60'
        )}
      >
        <span
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-paper shadow-hard transition-all duration-200',
            checked ? 'left-[18px]' : 'left-[3px]'
          )}
        />
      </span>
    </button>
  )
}

export { Switch }
