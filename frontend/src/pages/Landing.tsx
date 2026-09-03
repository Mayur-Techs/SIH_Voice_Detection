import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen scanline-bg flex flex-col items-center justify-center px-4 pt-16">
      {/* Hero */}
      <div className="max-w-3xl w-full text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/5 text-accent text-xs font-data tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          MARATHI-FIRST · MVP BASELINE MODEL
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-7xl md:text-8xl font-data font-bold text-accent tracking-tight glow-accent">
            SHRAV
          </h1>
          <p className="font-marathi text-3xl md:text-4xl text-text-primary">
            श्रव
          </p>
          <p className="text-text-secondary text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            Marathi-first voice impersonation risk detector.
            Real model inference — every result you see is genuine.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/input')}
            className="btn-primary text-lg px-10 py-4"
          >
            <span className="font-marathi mr-2">शोध सुरू करा</span>
            Start Detection →
          </button>
          <button
            onClick={() => navigate('/history')}
            className="btn-ghost"
          >
            View History
          </button>
        </div>

        {/* Pipeline preview */}
        <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap pt-4">
          {['VOICE', 'ANALYZE', 'SCORE', 'VERIFY', 'PROTECT'].map((stage, i, arr) => (
            <div key={stage} className="flex items-center gap-2 md:gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl border border-border bg-surface flex items-center justify-center text-lg">
                  {['🎙️', '📊', '⚠️', '🔍', '🛡️'][i]}
                </div>
                <span className="text-text-secondary text-[10px] font-data tracking-widest">{stage}</span>
              </div>
              {i < arr.length - 1 && (
                <span className="text-border text-xl mb-4">→</span>
              )}
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 px-6 py-4 border border-risk-suspicious/20 rounded-xl bg-risk-suspicious/5 text-left max-w-2xl mx-auto">
          <p className="text-risk-suspicious text-xs font-data tracking-wider mb-1">⚠ MODEL NOTICE</p>
          <p className="text-text-secondary text-xs leading-relaxed">
            This demo uses a baseline anti-spoofing model not yet validated on Marathi speech.
            Results are indicative only. The Marathi-specific model is under development and will
            be a drop-in replacement when ready.
          </p>
        </div>
      </div>
    </div>
  )
}
