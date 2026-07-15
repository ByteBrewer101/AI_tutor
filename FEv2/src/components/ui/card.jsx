import { cn } from '@/lib/utils'
import { deterministicRotation } from '@/lib/utils'

function Card({ className, seed = 0, children, ...props }) {
  const rotation = deterministicRotation(seed)
  return (
    <div
      style={{ transform: `rotate(${rotation}deg)` }}
      className={cn(
        'bg-paper border border-walnut/20 shadow-hard p-6 rounded-[2px]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col gap-1 pb-2', className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn('font-display text-lg font-medium text-ink', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }) {
  return (
    <p
      className={cn('text-sm text-walnut font-body', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }) {
  return (
    <div className={cn('', className)} {...props} />
  )
}

function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn('flex items-center pt-2 border-t border-walnut/10', className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
