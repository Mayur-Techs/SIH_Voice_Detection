import { clsx } from 'clsx'
import type { RiskState } from '../../types/api'

interface RiskBadgeProps {
  state: RiskState
  large?: boolean
}

const CONFIG: Record<RiskState, { label: string; labelMr: string; cls: string; glow: string; dot: string }> = {
  LOW_RISK: {
    label: 'LOW RISK',
    labelMr: 'कमी जोखीम',
    cls: 'text-risk-low border-risk-low/40 bg-risk-low/10',
    glow: 'glow-low',
    dot: 'bg-risk-low',
  },
  SUSPICIOUS: {
    label: 'SUSPICIOUS',
    labelMr: 'संशयास्पद',
    cls: 'text-risk-suspicious border-risk-suspicious/40 bg-risk-suspicious/10',
    glow: 'glow-susp',
    dot: 'bg-risk-suspicious',
  },
  HIGH_RISK: {
    label: 'HIGH RISK',
    labelMr: 'उच्च धोका',
    cls: 'text-risk-high border-risk-high/40 bg-risk-high/10',
    glow: 'glow-high',
    dot: 'bg-risk-high',
  },
}

export default function RiskBadge({ state, large }: RiskBadgeProps) {
  const c = CONFIG[state]
  return (
    <div
      className={clsx(
        'inline-flex items-center gap-3 border rounded-xl font-data font-bold tracking-widest uppercase',
        c.cls,
        c.glow,
        large ? 'px-8 py-4 text-2xl' : 'px-4 py-2 text-sm'
      )}
    >
      <span className={clsx('rounded-full animate-pulse', c.dot, large ? 'w-3 h-3' : 'w-2 h-2')} />
      <span>{c.label}</span>
      <span className={clsx('font-marathi font-normal opacity-70', large ? 'text-lg' : 'text-xs')}>
        {c.labelMr}
      </span>
    </div>
  )
}
