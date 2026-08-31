import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Hash, Globe, Server, File, FileCode, Bug } from 'lucide-react'
import { useAppStore } from '@/store'
import { getVerdictColor, formatDate } from '@/lib/utils'

const searchCategories = [
  { id: 'all', label: 'All', icon: Search },
  { id: 'hash', label: 'Hashes', icon: Hash },
  { id: 'ip', label: 'IPs', icon: Server },
  { id: 'domain', label: 'Domains', icon: Globe },
  { id: 'file', label: 'Files', icon: File },
  { id: 'script', label: 'Scripts', icon: FileCode },
]

export default function SearchPage() {
  const { investigations, searchQuery, setSearchQuery } = useAppStore()
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = investigations.filter(inv => {
    const matchesSearch = !searchQuery ||
      inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.artifactValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = activeCategory === 'all' || inv.artifactType === activeCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Global Search</h1>
        <p className="text-sm text-cyber-muted mt-1">
          Search across all investigations, IOCs, and threat intelligence
        </p>
      </div>

      {/* Search Box */}
      <div style={{ position: 'relative' }}>
        <Search size={18} style={{
          position: 'absolute', left: 16, top: '50%',
          transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none',
        }} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search investigations, hashes, IPs, domains, tags..."
          style={{
            width: '100%', padding: '14px 16px 14px 48px',
            background: 'var(--color-panel)',
            border: '1px solid rgba(56,189,248,0.15)',
            borderRadius: 12, fontSize: '1rem', color: '#f1f5f9',
            fontFamily: 'inherit', outline: 'none',
            transition: 'border-color 150ms, box-shadow 150ms',
            boxSizing: 'border-box',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'rgba(56,189,248,0.4)'
            e.target.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.08)'
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(56,189,248,0.15)'
            e.target.style.boxShadow = 'none'
          }}
          autoFocus
        />
        {searchQuery && (
          <span style={{
            position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
            fontSize: '0.75rem', color: '#64748b',
          }}>
            {filtered.length} results
          </span>
        )}
      </div>

      {/* Category Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {searchCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8, border: '1px solid',
              fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 150ms',
              ...(activeCategory === cat.id
                ? { background: 'rgba(56,189,248,0.12)', color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)' }
                : { background: 'var(--color-panel)', color: '#64748b', borderColor: 'rgba(56,189,248,0.1)' }
              ),
            }}
          >
            <cat.icon size={14} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-2">
        {filtered.map((inv) => (
          <Link
            key={inv.id}
            to={`/investigation/${inv.id}`}
            className="glass-panel-hover"
            style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 8, flexShrink: 0,
              background: 'rgba(56,189,248,0.08)',
              border: '1px solid rgba(56,189,248,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileCode size={18} color="#38bdf8" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>
                  {inv.title}
                </p>
                <span className={`badge ${getVerdictColor(inv.verdict)}`}>
                  {inv.verdict.replace('_', ' ')}
                </span>
              </div>
              <p style={{
                fontSize: '0.75rem', fontFamily: 'var(--font-mono)',
                color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {inv.artifactValue}
              </p>
              {inv.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                  {inv.tags.slice(0, 4).map(tag => (
                    <span key={tag} style={{
                      fontSize: '0.65rem', padding: '1px 6px', borderRadius: 99,
                      background: 'rgba(100,116,139,0.15)', color: '#64748b',
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatDate(inv.createdAt)}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                {inv.mitreTechniques.length} techniques · {inv.iocs.length} IOCs
              </p>
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <Search size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p>
              {searchQuery
                ? `No results for "${searchQuery}"`
                : 'Start typing to search'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
