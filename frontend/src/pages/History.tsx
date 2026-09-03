import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../store/session'
import RiskBadge from '../components/ui/RiskBadge'
import GlassPanel from '../components/ui/GlassPanel'

export default function History() {
  const { history, clearHistory } = useSessionStore()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 scanline-bg">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              <span className="font-marathi">इतिहास</span>{' '}
              <span className="text-text-secondary font-normal text-lg">/ Session History</span>
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              Stored locally in your browser. Cleared on browser data wipe.
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="btn-ghost text-sm text-risk-high border-risk-high/30 hover:border-risk-high/60"
            >
              Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <GlassPanel className="text-center py-16">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-text-secondary">No sessions yet. Run an analysis to see history.</p>
            <button onClick={() => navigate('/input')} className="btn-primary mt-6">
              Start Detection
            </button>
          </GlassPanel>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <GlassPanel key={entry.session_id} className="glass-hover flex items-center justify-between gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary font-medium truncate">{entry.filename}</p>
                  <p className="text-text-secondary text-xs font-data mt-0.5">
                    {new Date(entry.timestamp).toLocaleString('mr-IN')}
                    <span className="ml-3">
                      Score: <span className="text-accent">{Math.round(entry.final_score * 100)}%</span>
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <RiskBadge state={entry.final_state} />
                  <button
                    onClick={() => navigate(`/report/${entry.session_id}`)}
                    className="text-accent text-xs font-data hover:underline"
                  >
                    View →
                  </button>
                </div>
              </GlassPanel>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
