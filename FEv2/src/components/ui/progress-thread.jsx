import { cn } from '@/lib/utils'

function ProgressThread({ value = 0, className, ...props }) {
  return (
    <div
      className={cn('relative h-px bg-walnut/20 w-full overflow-hidden', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      <div
        className="absolute inset-y-0 left-0 bg-pine"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          animation: value > 0 ? 'ink-fill 0.8s ease-out' : undefined,
        }}
      />
    </div>
  )
}

export { ProgressThread }
