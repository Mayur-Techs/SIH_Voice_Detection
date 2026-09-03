import { type ReactNode } from 'react'
import { clsx } from 'clsx'

interface GlassPanelProps {
  children: ReactNode
  className?: string
  glow?: boolean
}

export default function GlassPanel({ children, className, glow }: GlassPanelProps) {
  return (
    <div
      className={clsx(
        'glass p-6',
        glow && 'glow-accent',
        className
      )}
    >
      {children}
    </div>
  )
}
