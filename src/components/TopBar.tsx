import { useNavigate, useLocation } from 'react-router-dom'
import { Search, Bell, User, Shield } from 'lucide-react'
import { useAppStore } from '@/store'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/investigations': 'Investigations',
  '/threat-universe': 'Threat Universe',
  '/submit': 'Submit Artifact',
  '/search': 'Global Search',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

export default function TopBar() {
  const { searchQuery, setSearchQuery, investigations } = useAppStore()
  const navigate = useNavigate()
  const location = useLocation()

  const title = Object.entries(pageTitles).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] ?? 'CyberThreat OS'

  const criticalCount = investigations.filter(
    i => i.verdict === 'malicious' && i.status === 'complete'
  ).length

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) navigate('/search')
  }

  return (
    <div className="topbar">
      {/* Page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <Shield size={16} color="#38bdf8" />
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>
          {title}
        </span>
      </div>

      {/* Search */}
      <form className="search-input" onSubmit={handleSearch}>
        <Search className="icon" />
        <input
          type="text"
          placeholder="Search investigations, IOCs, hashes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          id="global-search"
        />
      </form>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Alert bell */}
        <button
          style={{
            position: 'relative', background: 'none', border: 'none',
            cursor: 'pointer', color: '#64748b', padding: 6, borderRadius: 8,
            transition: 'color 150ms',
          }}
          onClick={() => navigate('/investigations')}
          title="View active threats"
        >
          <Bell size={18} />
          {criticalCount > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              width: 16, height: 16, borderRadius: '50%',
              background: '#f87171', color: '#080d12',
              fontSize: '0.6rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {criticalCount > 9 ? '9+' : criticalCount}
            </span>
          )}
        </button>

        {/* User avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(14,165,233,0.1))',
          border: '1px solid rgba(56,189,248,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <User size={16} color="#38bdf8" />
        </div>
      </div>
    </div>
  )
}
