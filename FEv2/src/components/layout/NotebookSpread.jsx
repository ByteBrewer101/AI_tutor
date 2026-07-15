import { ScrollArea } from '@/components/ui/scroll-area'

function NotebookSpread({ children, marginRail, className = '' }) {
  return (
    <div className={`flex gap-8 ${className}`}>
      <div className="flex-1 min-w-0 max-w-[680px] pl-4">
        {children}
      </div>

      {marginRail && (
        <aside className="hidden lg:block w-[200px] shrink-0 border-l border-walnut/15 pl-6">
          <ScrollArea className="h-[calc(100vh-120px)]">
            {marginRail}
          </ScrollArea>
        </aside>
      )}
    </div>
  )
}

export { NotebookSpread }
