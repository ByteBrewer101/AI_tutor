import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-body transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-pine text-paper border border-pine rounded-[3px] px-5 py-2.5 text-base hover:bg-pine/90',
        secondary:
          'bg-transparent text-ink border border-walnut/40 rounded-[3px] px-5 py-2.5 text-base hover:border-walnut',
        ghost:
          'text-pine underline underline-offset-4 decoration-pine/40 hover:decoration-pine bg-transparent border-transparent px-2 py-1',
        destructive:
          'bg-claret/10 text-claret border border-claret/30 rounded-[3px] px-5 py-2.5 text-base hover:bg-claret/20',
      },
      size: {
        default: 'h-10 px-5 py-2.5',
        sm: 'h-8 px-3 py-1.5 text-sm',
        lg: 'h-12 px-6 py-3 text-lg',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

function Button({ className, variant = 'primary', size = 'default', ...props }) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
