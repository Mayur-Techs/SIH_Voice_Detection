import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchReport, reportPdfUrl } from '../lib/api'
import { useSessionStore } from '../store/session'
import RiskBadge from '../components/ui/RiskBadge'
import GlassPanel from '../components/ui/GlassPanel'
import TimelineChart from '../components/ui/TimelineChart'
import type { ReportData } from '../types/api'

export default function Report() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { report: storeReport, setReport } = useSessionStore()

  const [report, setLocalReport] = useState<ReportData | null>(storeReport)
  const [loading, setLoading] = useState(!storeReport)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) { navigate('/'); return }
    if (storeReport) { setLocalReport(storeReport); return }
    fetchReport(sessionId)
      .then((r) => { setLocalReport(r); setReport(r) })
      .catch(() => setErr('Could not load report. The session may have expired.'))
      .finally(() => setLoading(false))
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (err || !report) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-4">
        <p className="text-risk-high">{err ?? 'Report not available.'}</p>
        <button onClick={() => navigate('/input')} className="btn-ghost">← New Analysis</button>
      </div>
    )
  }

  const scorePct = Math.round(report.final_score * 100)
  const confPct  = Math.round(report.confidence * 100)

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 scanline-bg">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Risk state */}
        <div className="text-center space-y-4">
          <RiskBadge state={report.final_state} large />
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-4">
          <GlassPanel className="text-center">
            <p className="text-text-secondary text-xs font-data tracking-widest mb-2">RISK SCORE</p>
            <p className="text-5xl font-data font-bold text-accent">{scorePct}<span className="text-2xl">%</span></p>
          </GlassPanel>
          <GlassPanel className="text-center">
            <p className="text-text-secondary text-xs font-data tracking-widest mb-2">CONFIDENCE</p>
            <p className="text-5xl font-data font-bold text-text-primary">{confPct}<span className="text-2xl">%</span></p>
          </GlassPanel>
        </div>

        {/* Timeline */}
        <GlassPanel>
          <p className="text-text-secondary text-xs font-data tracking-widest mb-4">RISK TIMELINE</p>
          <TimelineChart data={report.timeline} />
        </GlassPanel>

        {/* Model info */}
        <GlassPanel>
          <p className="text-text-secondary text-xs font-data tracking-widest mb-2">MODEL USED</p>
          <p className="font-data text-sm text-text-primary">{report.model_used}</p>
          <p className="text-text-secondary text-xs mt-1">
            Baseline anti-spoofing model — not yet validated on Marathi speech.
          </p>
        </GlassPanel>

        {/* Safety line — always visible, never removable */}
        <div className="border border-risk-high/30 bg-risk-high/5 rounded-xl px-6 py-4">
          <p className="text-risk-high text-xs font-data tracking-widest mb-1">⚠ IMPORTANT</p>
          <p className="text-text-primary text-sm leading-relaxed">{report.recommendation}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {sessionId && (
            <a
              href={reportPdfUrl(sessionId)}
              download
              className="btn-primary text-center flex-1"
            >
              ⬇ Download Report (PDF)
            </a>
          )}
          <button onClick={() => navigate('/input')} className="btn-ghost flex-1">
            ← New Analysis
          </button>
          <button onClick={() => navigate('/history')} className="btn-ghost">
            History
          </button>
        </div>
      </div>
    </div>
  )
}
