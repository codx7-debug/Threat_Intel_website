import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  ShieldAlert, ShieldCheck, Activity, TrendingUp,
  AlertTriangle, ChevronRight, Zap, Server, Globe, FileWarning
} from 'lucide-react'
import { useAppStore } from '@/store'
import { mockTrendData } from '@/lib/mockData'
import { getVerdictColor, getRiskColor, formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const { investigations } = useAppStore()

  const maliciousCount = investigations.filter(i => i.verdict === 'malicious').length
  const suspiciousCount = investigations.filter(i => i.verdict === 'suspicious').length
  const analyzingCount = investigations.filter(i => i.status === 'analyzing').length
  const totalIOCs = investigations.reduce((acc, i) => acc + i.iocs.length, 0)

  const recentInvs = [...investigations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // Top MITRE techniques
  const techMap: Record<string, { name: string; tactic: string; count: number }> = {}
  investigations.forEach(inv => {
    inv.mitreTechniques.forEach(t => {
      if (!techMap[t.id]) techMap[t.id] = { name: t.name, tactic: t.tactic, count: 0 }
      techMap[t.id].count++
    })
  })
  const topTechniques = Object.entries(techMap)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)

  const metrics = [
    {
      label: 'Active Threats',
      value: maliciousCount,
      icon: ShieldAlert,
      color: '#f87171',
      bg: 'rgba(248,113,113,0.1)',
      change: '+12%',
      changeColor: '#f87171',
    },
    {
      label: 'Suspicious',
      value: suspiciousCount,
      icon: AlertTriangle,
      color: '#fbbf24',
      bg: 'rgba(251,191,36,0.1)',
      change: '+4%',
      changeColor: '#fbbf24',
    },
    {
      label: 'Analyzing',
      value: analyzingCount,
      icon: Activity,
      color: '#38bdf8',
      bg: 'rgba(56,189,248,0.1)',
      change: 'live',
      changeColor: '#34d399',
    },
    {
      label: 'Total IOCs',
      value: totalIOCs,
      icon: TrendingUp,
      color: '#34d399',
      bg: 'rgba(52,211,153,0.1)',
      change: '+28 today',
      changeColor: '#34d399',
    },
  ]

  const feed = [
    { icon: FileWarning, color: '#f87171', text: 'Emotet sample detected on endpoint', time: '2m ago' },
    { icon: Server, color: '#fbbf24', text: 'Suspicious PowerShell execution blocked', time: '14m ago' },
    { icon: Globe, color: '#f87171', text: 'C2 beacon to 185.220.101.47 blocked', time: '31m ago' },
    { icon: AlertTriangle, color: '#fbbf24', text: 'Phishing URL submitted for analysis', time: '1h ago' },
    { icon: Zap, color: '#38bdf8', text: 'LockBit hash matched in threat feed', time: '2h ago' },
    { icon: ShieldAlert, color: '#f87171', text: 'Ransomware binary quarantined on host-09', time: '3h ago' },
    { icon: Globe, color: '#fbbf24', text: 'DNS tunneling detected from 10.0.4.22', time: '4h ago' },
    { icon: Server, color: '#34d399', text: 'EDR signature update pushed to all agents', time: '5h ago' },
  ]

  const systemHealth = [
    { label: 'Threat Intel Feed', status: 'Operational', color: '#34d399' },
    { label: 'Sandbox Engine', status: 'Operational', color: '#34d399' },
    { label: 'YARA Scanner', status: 'Degraded', color: '#fbbf24' },
    { label: 'IOC Enrichment', status: 'Operational', color: '#34d399' },
    { label: 'MITRE Mapper', status: 'Operational', color: '#34d399' },
  ]

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }} className="space-y-6">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Security Overview</h1>
          <p className="text-sm text-cyber-muted" style={{ marginTop: 4 }}>
            Real-time threat intelligence dashboard
          </p>
        </div>
        <Link
          to="/submit"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 8,
            background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
            color: '#080d12', fontWeight: 600, fontSize: '0.875rem',
            textDecoration: 'none', boxShadow: '0 0 20px rgba(56,189,248,0.3)',
            transition: 'box-shadow 150ms',
          }}
        >
          <Zap size={16} />
          Submit Artifact
        </Link>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="metric-card"
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p className="text-xs text-cyber-muted">{m.label}</p>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2, marginTop: 4 }}>
                  {m.value}
                </p>
                <p style={{ fontSize: '0.75rem', color: m.changeColor, marginTop: 6 }}>
                  {m.change}
                </p>
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: m.bg, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <m.icon size={20} color={m.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts + Feed row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 className="text-sm font-semibold text-gray-200">Threat Trend — Last 7 Days</h2>
            <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem' }}>
              {[
                { label: 'Malicious', color: '#f87171' },
                { label: 'Suspicious', color: '#fbbf24' },
                { label: 'Benign', color: '#34d399' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                  <span style={{ color: '#64748b' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockTrendData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="malGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="susGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="benGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(56,189,248,0.06)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#111c2a', border: '1px solid rgba(56,189,248,0.2)',
                  borderRadius: 8, fontSize: '0.8rem', color: '#e2e8f0',
                }}
              />
              <Area type="monotone" dataKey="malicious" stroke="#f87171" strokeWidth={2} fill="url(#malGrad)" />
              <Area type="monotone" dataKey="suspicious" stroke="#fbbf24" strokeWidth={2} fill="url(#susGrad)" />
              <Area type="monotone" dataKey="benign" stroke="#34d399" strokeWidth={2} fill="url(#benGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Right column: Feed + Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Live Feed */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-panel p-5"
            style={{ flex: 1 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 className="text-sm font-semibold text-gray-200">Live Threat Feed</h2>
              <span style={{
                fontSize: '0.65rem', padding: '2px 8px', borderRadius: 99,
                background: 'rgba(248,113,113,0.1)', color: '#f87171',
                border: '1px solid rgba(248,113,113,0.2)', fontWeight: 600,
                animation: 'pulse 2s infinite',
              }}>● LIVE</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
              {feed.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '8px 10px', borderRadius: 8,
                    background: 'rgba(17,28,42,0.6)',
                    border: '1px solid rgba(56,189,248,0.06)',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                    background: `${item.color}15`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <item.icon size={14} color={item.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4 }}>{item.text}</p>
                    <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>{item.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* System Health */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel p-5"
          >
            <h2 className="text-sm font-semibold text-gray-200" style={{ marginBottom: 14 }}>System Health</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {systemHealth.map((s) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{s.label}</p>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600, color: s.color,
                    background: `${s.color}15`, padding: '2px 10px',
                    borderRadius: 99, border: `1px solid ${s.color}30`,
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom row: Recent + Top Techniques */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
        {/* Recent Investigations */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-panel p-5"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 className="text-sm font-semibold text-gray-200">Recent Investigations</h2>
            <Link to="/investigations" style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: '0.75rem', color: '#38bdf8', textDecoration: 'none',
            }}>
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentInvs.map((inv) => (
              <Link
                key={inv.id}
                to={`/investigation/${inv.id}`}
                style={{ textDecoration: 'none' }}
                className="glass-panel-hover"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}
                         className="truncate">
                        {inv.title}
                      </p>
                      <span className={`badge ${getVerdictColor(inv.verdict)}`}>
                        {inv.verdict}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                      <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#64748b' }}
                         className="truncate">
                        {inv.artifactValue}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{
                      fontSize: '1rem', fontWeight: 700,
                      color: getRiskColor(inv.riskScore),
                    }}>
                      {inv.riskScore}
                    </p>
                    <p style={{ fontSize: '0.65rem', color: '#64748b' }}>risk</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Top Techniques */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-5"
        >
          <h2 className="text-sm font-semibold text-gray-200 mb-4">Top MITRE Techniques</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topTechniques.map(([id, { name, tactic, count }]) => (
              <div key={id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div>
                    <p style={{ fontSize: '0.8125rem', color: '#e2e8f0', fontWeight: 500 }}>{name}</p>
                    <p style={{ fontSize: '0.7rem', color: '#64748b' }}>{id} · {tactic}</p>
                  </div>
                  <span style={{
                    fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8',
                    background: 'rgba(56,189,248,0.1)', padding: '2px 8px',
                    borderRadius: 6, border: '1px solid rgba(56,189,248,0.2)',
                    alignSelf: 'center',
                  }}>
                    {count}×
                  </span>
                </div>
                <div style={{ height: 3, background: 'rgba(56,189,248,0.1)', borderRadius: 99 }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, (count / (topTechniques[0]?.[1]?.count || 1)) * 100)}%`,
                    background: 'linear-gradient(to right, #38bdf8, #0ea5e9)',
                    borderRadius: 99,
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
