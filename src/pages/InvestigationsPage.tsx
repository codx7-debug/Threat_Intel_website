import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield, Filter, SortDesc, ChevronRight, Hash, Globe, Server,
  File, FileCode, Mail, AlertTriangle, Activity,
} from 'lucide-react'
import { useAppStore } from '@/store'
import { getVerdictColor, getRiskColor, formatDate } from '@/lib/utils'
import type { ArtifactType, Verdict } from '@/types'

const artifactIcons: Record<ArtifactType, typeof File> = {
  file: File,
  url: Globe,
  domain: Globe,
  ip: Server,
  hash: Hash,
  email: Mail,
  script: FileCode,
}

const verdictFilters: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'malicious', label: 'Malicious' },
  { value: 'suspicious', label: 'Suspicious' },
  { value: 'likely_benign', label: 'Likely Benign' },
  { value: 'benign', label: 'Benign' },
  { value: 'analyzing', label: 'Analyzing' },
]

export default function InvestigationsPage() {
  const { investigations } = useAppStore()
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState<'newest' | 'risk'>('newest')

  const filtered = investigations
    .filter(inv => {
      if (filter === 'analyzing') return inv.status === 'analyzing'
      if (filter === 'all') return true
      return inv.verdict === filter
    })
    .sort((a, b) => {
      if (sort === 'risk') return b.riskScore - a.riskScore
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const counts = {
    all: investigations.length,
    malicious: investigations.filter(i => i.verdict === 'malicious').length,
    suspicious: investigations.filter(i => i.verdict === 'suspicious').length,
    likely_benign: investigations.filter(i => i.verdict === 'likely_benign').length,
    benign: investigations.filter(i => i.verdict === 'benign').length,
    analyzing: investigations.filter(i => i.status === 'analyzing').length,
  }

  return (
    <div className="space-y-6" style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Investigations</h1>
          <p className="text-sm text-cyber-muted" style={{ marginTop: 4 }}>
            {investigations.length} total · {counts.analyzing} active
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setSort(s => s === 'newest' ? 'risk' : 'newest')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              background: 'rgba(56,189,248,0.08)',
              border: '1px solid rgba(56,189,248,0.2)',
              color: '#38bdf8', fontSize: '0.8125rem', cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <SortDesc size={14} />
            {sort === 'newest' ? 'Newest' : 'Risk Score'}
          </button>
          <Link
            to="/submit"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8,
              background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
              color: '#080d12', fontSize: '0.8125rem', fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Shield size={14} />
            New Analysis
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {verdictFilters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8, border: '1px solid',
              fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 150ms',
              ...(filter === f.value
                ? { background: 'rgba(56,189,248,0.12)', color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)' }
                : { background: 'rgba(17,28,42,1)', color: '#64748b', borderColor: 'rgba(56,189,248,0.1)' }
              ),
            }}
          >
            {f.label}
            <span style={{
              padding: '1px 6px', borderRadius: 99,
              background: filter === f.value ? 'rgba(56,189,248,0.2)' : 'rgba(100,116,139,0.15)',
              fontSize: '0.7rem', fontWeight: 700,
              color: filter === f.value ? '#38bdf8' : '#64748b',
            }}>
              {counts[f.value as keyof typeof counts] ?? investigations.length}
            </span>
          </button>
        ))}
      </div>

      {/* Table Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 120px 100px 80px 40px',
        gap: 12, padding: '8px 16px',
        fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.06em', color: '#64748b',
      }}>
        <span>Investigation</span>
        <span>Artifact</span>
        <span>Verdict</span>
        <span>Risk Score</span>
        <span>Date</span>
        <span />
      </div>

      {/* Investigation Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map((inv, i) => {
          const Icon = artifactIcons[inv.artifactType] || File
          return (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to={`/investigation/${inv.id}`}
                className="glass-panel-hover"
                style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 120px 100px 80px 40px', gap: 12, padding: '14px 16px', alignItems: 'center' }}
              >
                {/* Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  {inv.status === 'analyzing' && (
                    <div style={{ flexShrink: 0 }}>
                      <Activity size={14} color="#fbbf24" style={{ animation: 'pulse-warning 2s infinite' }} />
                    </div>
                  )}
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }} className="truncate">
                    {inv.title}
                  </p>
                </div>

                {/* Artifact */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <Icon size={13} color="#64748b" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#94a3b8' }} className="truncate">
                    {inv.artifactValue}
                  </span>
                </div>

                {/* Verdict */}
                <span className={`badge ${getVerdictColor(inv.verdict)}`}>
                  {inv.verdict.replace('_', ' ')}
                </span>

                {/* Risk Score */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    flex: 1, height: 4, background: 'rgba(56,189,248,0.08)',
                    borderRadius: 99,
                  }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      width: `${inv.riskScore}%`,
                      background: inv.riskScore >= 80 ? '#f87171' :
                        inv.riskScore >= 60 ? '#fb923c' :
                        inv.riskScore >= 40 ? '#fbbf24' : '#34d399',
                    }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: getRiskColor(inv.riskScore), width: 24, textAlign: 'right' }}>
                    {inv.riskScore}
                  </span>
                </div>

                {/* Date */}
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {formatDate(inv.createdAt)}
                </span>

                <ChevronRight size={14} color="#64748b" />
              </Link>
            </motion.div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <AlertTriangle size={32} style={{ margin: '0 auto 12px' }} />
          <p>No investigations match this filter.</p>
        </div>
      )}
    </div>
  )
}
