import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Download, Clock } from 'lucide-react'
import { useAppStore } from '@/store'
import { getVerdictColor, formatDate } from '@/lib/utils'
import type { Verdict } from '@/types'

const filters: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'malicious', label: 'Malicious' },
  { value: 'suspicious', label: 'Suspicious' },
  { value: 'likely_benign', label: 'Likely Benign' },
  { value: 'benign', label: 'Benign' },
]

export default function ReportsPage() {
  const { investigations } = useAppStore()
  const [filter, setFilter] = useState('all')

  const filtered = investigations.filter(inv =>
    filter === 'all' || inv.verdict === filter
  )

  const handleExport = (id: string) => {
    // Simulate export — in production this would generate a PDF
    const inv = investigations.find(i => i.id === id)
    if (!inv) return
    const content = JSON.stringify(inv, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${inv.id}-report.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Investigation Reports</h1>
          <p className="text-sm text-cyber-muted mt-1">
            Generate and export professional investigation reports
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '6px 12px', borderRadius: 8, border: '1px solid',
                fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 150ms',
                ...(filter === f.value
                  ? { background: 'rgba(56,189,248,0.1)', color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)' }
                  : { background: 'var(--color-panel)', color: '#64748b', borderColor: 'rgba(56,189,248,0.1)' }
                ),
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((inv, i) => (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-panel p-5"
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(56,189,248,0.08)',
                  border: '1px solid rgba(56,189,248,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FileText size={18} color="#38bdf8" />
                </div>
                <div>
                  <Link
                    to={`/investigation/${inv.id}`}
                    style={{
                      fontSize: '0.9375rem', fontWeight: 500, color: '#e2e8f0',
                      textDecoration: 'none', display: 'block', marginBottom: 8,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#38bdf8')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#e2e8f0')}
                  >
                    {inv.title}
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span className={`badge ${getVerdictColor(inv.verdict)}`}>
                      {inv.verdict.replace('_', ' ')}
                    </span>
                    <span style={{
                      fontSize: '0.75rem', color: '#64748b',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <Clock size={11} />
                      {formatDate(inv.createdAt)}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {inv.mitreTechniques.length} techniques
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {inv.iocs.length} IOCs
                    </span>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 700,
                      color: inv.riskScore >= 80 ? '#f87171' : inv.riskScore >= 60 ? '#fb923c' :
                        inv.riskScore >= 40 ? '#fbbf24' : '#34d399',
                    }}>
                      Risk: {inv.riskScore}/100
                    </span>
                  </div>

                  {/* Tags */}
                  {inv.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
                      {inv.tags.map(tag => (
                        <span key={tag} style={{
                          fontSize: '0.65rem', padding: '2px 6px', borderRadius: 99,
                          background: 'rgba(100,116,139,0.12)', color: '#64748b',
                        }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => handleExport(inv.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: 'rgba(56,189,248,0.08)',
                    border: '1px solid rgba(56,189,248,0.15)' as string,
                    color: '#38bdf8', fontSize: '0.8rem', fontFamily: 'inherit',
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(56,189,248,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(56,189,248,0.08)')}
                >
                  <Download size={14} />
                  Export JSON
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <FileText size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p>No reports match this filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}
