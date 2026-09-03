import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/input', label: 'Detect' },
  { to: '/history', label: 'History' },
]

export default function NavBar() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 border-b border-border bg-canvas/80 backdrop-blur-md">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center group-hover:border-accent/60 transition-colors">
          <span className="text-accent font-data font-bold text-sm">S</span>
        </div>
        <span className="font-data font-bold text-accent tracking-widest text-sm">SHRAV</span>
        <span className="font-marathi text-text-secondary text-xs hidden sm:block">श्रव</span>
      </Link>

      <div className="flex items-center gap-1">
        {NAV_LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              pathname === to
                ? 'bg-accent/10 text-accent border border-accent/30'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-risk-low animate-pulse-slow" />
        <span className="text-xs text-text-secondary font-data">LIVE</span>
      </div>
    </nav>
  )
}
