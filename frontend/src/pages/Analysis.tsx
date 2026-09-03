import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { connectStream } from '../lib/ws'
import { useSessionStore } from '../store/session'
import { fetchReport } from '../lib/api'
import type { Stage } from '../types/api'

const STAGE_CONFIG: { stage: Stage; label: string; labelMr: string; icon: string }[] = [
  { stage: 'preprocessing',   label: 'Preprocessing',    labelMr: 'पूर्व-प्रक्रिया',  icon: '⚙️' },
  { stage: 'representation',  label: 'Representation',   labelMr: 'प्रतिनिधित्व',    icon: '🧬' },
  { stage: 'anti_spoof_model',label: 'Anti-Spoof Model', labelMr: 'AI विश्लेषण',      icon: '🤖' },
  { stage: 'complete',        label: 'Complete',         labelMr: 'पूर्ण',            icon: '✅' },
]

const RISK_COLOR: Record<string, string> = {
  LOW_RISK:   'text-risk-low',
  SUSPICIOUS: 'text-risk-suspicious',
  HIGH_RISK:  'text-risk-high',
}

export default function Analysis() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const wsRef = useRef<WebSocket | null>(null)

  const {
    sessionId: storeId, currentStage, completedStages,
    currentRiskScore, currentRiskState, setReport, filename, durationSec
  } = useSessionStore()

  useEffect(() => {
    if (!sessionId) { navigate('/'); return }
    if (wsRef.current) return // already connected

    wsRef.current = connectStream(sessionId, async () => {
      // WebSocket fired "complete" — fetch full report then navigate
      try {
        const report = await fetchReport(sessionId)
        setReport(report)
        // Persist to history
        useSessionStore.getState().addHistory({
          session_id: sessionId,
          filename: useSessionStore.getState().filename ?? 'audio',
          timestamp: new Date().toISOString(),
          final_state: report.final_state,
          final_score: report.final_score,
        })
        navigate(`/report/${sessionId}`)
      } catch {
        navigate(`/report/${sessionId}`)
      }
    })

    return () => {
      wsRef.current?.close()
      wsRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  const riskPct = Math.round(currentRiskScore * 100)

  return (
    <div className="min-h-screen pt-16 flex flex-col items-center justify-center scanline-bg px-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* File info */}
        <div className="text-center">
          <p className="text-text-secondary text-sm font-data">
            Analyzing: <span className="text-text-primary">{filename ?? 'audio'}</span>
            {durationSec > 0 && <span className="ml-2 text-text-secondary">· {durationSec.toFixed(1)}s</span>}
          </p>
        </div>

        {/* Stage tracker */}
        <div className="glass p-6">
          <p className="text-xs font-data tracking-widest text-text-secondary mb-4">PIPELINE STAGES</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STAGE_CONFIG.map(({ stage, label, labelMr, icon }) => {
              const isDone = completedStages.includes(stage)
              const isActive = currentStage === stage
              return (
                <div
                  key={stage}
                  className={`rounded-xl border p-4 text-center transition-all duration-500 ${
                    isDone
                      ? 'border-accent bg-accent/10 glow-accent'
                      : isActive
                      ? 'border-accent/50 bg-accent/5 animate-pulse'
                      : 'border-border bg-surface opacity-40'
                  }`}
                >
                  <p className="text-2xl mb-1">{icon}</p>
                  <p className={`text-xs font-data font-bold ${ isDone ? 'text-accent' : 'text-text-secondary' }`}>{label}</p>
                  <p className="font-marathi text-[10px] text-text-secondary mt-0.5">{labelMr}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Live risk score */}
        <div className="glass p-8 text-center">
          <p className="text-xs font-data tracking-widest text-text-secondary mb-4">LIVE RISK SCORE</p>
          <p className={`text-8xl font-data font-bold transition-all duration-700 ${ RISK_COLOR[currentRiskState] ?? 'text-text-secondary' }`}>
            {riskPct}%
          </p>
          <p className={`text-lg font-data mt-2 ${ RISK_COLOR[currentRiskState] }`}>
            {currentRiskState.replace('_', ' ')}
          </p>
          {currentStage === 'idle' && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              <span className="text-text-secondary text-sm font-data">Connecting to analysis stream...</span>
            </div>
          )}
        </div>

        {/* Error state */}
        {currentStage === 'error' && (
          <div className="glass p-6 border-risk-high/30">
            <p className="text-risk-high text-sm font-data">Analysis failed. <button onClick={() => navigate('/input')} className="underline ml-2">Try again</button></p>
          </div>
        )}
      </div>
    </div>
  )
}
