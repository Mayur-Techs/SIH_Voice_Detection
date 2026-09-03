import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'
import type { TimelinePoint } from '../../types/api'

interface TimelineChartProps {
  data: TimelinePoint[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const score = (payload[0].value as number) * 100
  return (
    <div className="glass px-3 py-2 text-xs font-data">
      <p className="text-text-secondary">{`t = ${label}s`}</p>
      <p className="text-accent">{`Risk: ${score.toFixed(1)}%`}</p>
    </div>
  )
}

export default function TimelineChart({ data }: TimelineChartProps) {
  if (!data.length) return null

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1A1A2E" />
        <XAxis
          dataKey="t"
          tick={{ fill: '#6B7A99', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          tickFormatter={(v) => `${v}s`}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 1]}
          tick={{ fill: '#6B7A99', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          tickFormatter={(v) => `${Math.round(v * 100)}%`}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#00E5FF"
          strokeWidth={2}
          dot={{ fill: '#00E5FF', r: 3 }}
          activeDot={{ fill: '#00E5FF', r: 5, stroke: '#050509', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
