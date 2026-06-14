import { Loader2Icon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface LoaderProps {
  message?: string
  className?: string
  fullScreen?: boolean
}

function Loader({ message, className, fullScreen = true }: LoaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        fullScreen && 'min-h-screen',
        className
      )}
    >
      <div className="relative size-14">
        <div className="absolute inset-0 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        <div className="absolute inset-2 rounded-full bg-primary/5 animate-pulse" />
      </div>
      {message && (
        <p className="text-sm text-muted-foreground animate-in fade-in duration-700">
          {message}
        </p>
      )}
    </div>
  )
}

function InlineLoader({ message, className }: { message?: string; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-3 py-12', className)}>
      <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}

export { Loader, InlineLoader }
