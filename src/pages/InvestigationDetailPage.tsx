import { useState, useRef, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, Shield, Activity, Copy, Check, Send, Bot,
  Hash, Globe, Server, Layers, Network, Clock, List,
  FileSearch, MonitorPlay, Wifi, Target, AlertTriangle,
  Download, Tag, ExternalLink,
} from 'lucide-react'
import { useAppStore } from '@/store'
import {
  getVerdictColor, getSeverityBg, getRiskColor,
  formatDate, truncateHash,
} from '@/lib/utils'
import { mockAIResponses } from '@/lib/mockData'
import type { ChatMessage } from '@/types'

// ─── Tab config ───────────────────────────────────────────────
const tabs = [
  { id: 'overview', label: 'Overview', icon: Shield },
  { id: 'static', label: 'Static', icon: FileSearch },
  { id: 'dynamic', label: 'Dynamic', icon: MonitorPlay },
  { id: 'network', label: 'Network', icon: Wifi },
  { id: 'mitre', label: 'MITRE', icon: Target },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'iocs', label: 'IOCs', icon: List },
]

// ─── Copy Button ──────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4, borderRadius: 4 }}
    >
      {copied ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
    </button>
  )
}

// ─── IOC type color ───────────────────────────────────────────
const iocTypeColor: Record<string, string> = {
  ip: '#f87171', domain: '#fbbf24', url: '#fb923c',
  hash: '#a78bfa', email: '#38bdf8', registry: '#94a3b8', file_path: '#64748b',
}

export default function InvestigationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getInvestigation, chatMessages, addChatMessage } = useAppStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const inv = id ? getInvestigation(id) : undefined

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, id])

  if (!inv) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
        <AlertTriangle size={40} style={{ margin: '0 auto 12px' }} />
        <p>Investigation not found.</p>
        <button onClick={() => navigate('/investigations')} style={{ marginTop: 12, color: '#38bdf8', background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Back to Investigations
        </button>
      </div>
    )
  }

  const messages: ChatMessage[] = chatMessages[inv.id] || []

  // AI response simulation
  const handleSendChat = async () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput.trim()
    setChatInput('')

    addChatMessage(inv.id, { role: 'user', content: userMsg })
    setIsTyping(true)

    setTimeout(() => {
      const lower = userMsg.toLowerCase()
      let response = mockAIResponses.default
      if (lower.includes('ioc') || lower.includes('indicator')) response = mockAIResponses.ioc
      else if (lower.includes('technique') || lower.includes('mitre') || lower.includes('tactic')) response = mockAIResponses.technique
      else if (lower.includes('summary') || lower.includes('report') || lower.includes('executive')) response = mockAIResponses.summary
      else if (inv.verdict === 'malicious') response = mockAIResponses.malicious
      addChatMessage(inv.id, { role: 'assistant', content: response })
      setIsTyping(false)
    }, 1200)
  }

  const verdictGlow = inv.verdict === 'malicious' ? '0 0 30px rgba(248,113,113,0.2)' :
    inv.verdict === 'suspicious' ? '0 0 30px rgba(251,191,36,0.15)' :
    inv.verdict === 'benign' ? '0 0 30px rgba(52,211,153,0.15)' : undefined

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
      {/* ─── Left Column ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <div className="glass-panel p-5" style={{ boxShadow: verdictGlow }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            {/* Back */}
            <button
              onClick={() => navigate('/investigations')}
              style={{
                background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)',
                borderRadius: 8, padding: 8, cursor: 'pointer', color: '#38bdf8',
                flexShrink: 0,
              }}
            >
              <ChevronLeft size={18} />
            </button>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span className={`badge ${getVerdictColor(inv.verdict)}`}>
                  {inv.verdict.replace('_', ' ')}
                </span>
                {inv.status === 'analyzing' && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: '0.75rem', color: '#fbbf24',
                  }}>
                    <Activity size={12} style={{ animation: 'spin 2s linear infinite' }} />
                    Analyzing...
                  </span>
                )}
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: 'auto' }}>
                  {inv.id}
                </span>
              </div>

              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
                {inv.title}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                    color: '#94a3b8', background: 'rgba(17,28,42,0.8)',
                    padding: '3px 8px', borderRadius: 6,
                    border: '1px solid rgba(56,189,248,0.1)',
                  }}>
                    {truncateHash(inv.artifactValue, 20, 10)}
                  </span>
                  <CopyBtn text={inv.artifactValue} />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {formatDate(inv.createdAt)}
                </span>
              </div>

              {/* Tags */}
              {inv.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                  {inv.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99,
                      background: 'rgba(56,189,248,0.08)',
                      border: '1px solid rgba(56,189,248,0.15)', color: '#64748b',
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Risk Gauge */}
            <div style={{
              textAlign: 'center', flexShrink: 0, padding: '0 8px',
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: `conic-gradient(${getRiskColor(inv.riskScore).replace('text-', '')} ${inv.riskScore * 3.6}deg, rgba(56,189,248,0.08) 0deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <div style={{
                  width: 54, height: 54, borderRadius: '50%',
                  background: '#0d1520',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9' }}>
                    {inv.riskScore}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 4 }}>Risk Score</p>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="tab-bar" style={{ overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-item${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {/* ── Overview ─────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {inv.summary && (
                  <div className="glass-panel p-5">
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 12 }}>
                      AI Analysis Summary
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.7 }}>
                      {inv.summary}
                    </p>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    { label: 'Artifact Type', value: inv.artifactType.toUpperCase() },
                    { label: 'Confidence', value: `${inv.confidence}%` },
                    { label: 'Analyst', value: inv.analyst },
                    { label: 'MITRE Techniques', value: `${inv.mitreTechniques.length}` },
                    { label: 'IOC Count', value: `${inv.iocs.length}` },
                    { label: 'Status', value: inv.status },
                  ].map(item => (
                    <div key={item.label} style={{
                      background: 'rgba(17,28,42,0.7)',
                      border: '1px solid rgba(56,189,248,0.08)',
                      borderRadius: 10, padding: '12px 14px',
                    }}>
                      <p style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {item.label}
                      </p>
                      <p style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginTop: 4 }}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Quick IOCs */}
                {inv.iocs.length > 0 && (
                  <div className="glass-panel p-5">
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 12 }}>
                      Key Indicators
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {inv.iocs.slice(0, 4).map((ioc, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 12px', borderRadius: 8,
                          background: 'rgba(17,28,42,0.5)',
                          border: '1px solid rgba(56,189,248,0.06)',
                        }}>
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                            padding: '2px 6px', borderRadius: 4,
                            background: `${iocTypeColor[ioc.type]}20`,
                            color: iocTypeColor[ioc.type],
                            border: `1px solid ${iocTypeColor[ioc.type]}30`,
                            flexShrink: 0,
                          }}>
                            {ioc.type}
                          </span>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.8125rem',
                            color: '#94a3b8', flex: 1, overflow: 'hidden',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {ioc.value}
                          </span>
                          <span className={`badge ${getSeverityBg(ioc.severity)}`}>
                            {ioc.severity}
                          </span>
                          <CopyBtn text={ioc.value} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Static Analysis ───────────────────────────────── */}
            {activeTab === 'static' && inv.staticAnalysis && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="glass-panel p-5">
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 12 }}>
                    File Properties
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[
                      { label: 'File Type', value: inv.staticAnalysis.fileType },
                      { label: 'File Size', value: inv.staticAnalysis.fileSize ? `${(inv.staticAnalysis.fileSize / 1024).toFixed(1)} KB` : undefined },
                      { label: 'Entropy', value: inv.staticAnalysis.entropy?.toFixed(2) },
                      { label: 'MD5', value: inv.staticAnalysis.md5 },
                      { label: 'SHA1', value: inv.staticAnalysis.sha1 },
                      { label: 'SHA256', value: inv.staticAnalysis.sha256 },
                    ].filter(r => r.value).map(row => (
                      <div key={row.label}>
                        <p style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {row.label}
                        </p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94a3b8', marginTop: 3, wordBreak: 'break-all' }}>
                          {row.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {inv.staticAnalysis.sections && (
                  <div className="glass-panel p-5">
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 12 }}>
                      PE Sections
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                      <thead>
                        <tr style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {['Name', 'Virtual Size', 'Raw Size', 'Entropy', 'Flags'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {inv.staticAnalysis.sections.map((sec, i) => (
                          <tr key={i} style={{ borderTop: '1px solid rgba(56,189,248,0.06)' }}>
                            <td style={{ padding: '8px 8px', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{sec.name}</td>
                            <td style={{ padding: '8px 8px', color: '#94a3b8' }}>{sec.virtualSize.toLocaleString()}</td>
                            <td style={{ padding: '8px 8px', color: '#94a3b8' }}>{sec.rawSize.toLocaleString()}</td>
                            <td style={{ padding: '8px 8px', color: sec.entropy > 7 ? '#f87171' : '#94a3b8' }}>{sec.entropy.toFixed(2)}</td>
                            <td style={{ padding: '8px 8px', color: '#64748b', fontSize: '0.75rem' }}>{sec.flags.join(', ')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {inv.staticAnalysis.signatures && inv.staticAnalysis.signatures.length > 0 && (
                  <div className="glass-panel p-5">
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 12 }}>
                      AV Detections
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {inv.staticAnalysis.signatures.map(sig => (
                        <span key={sig} style={{
                          fontSize: '0.8rem', padding: '4px 10px', borderRadius: 6,
                          background: 'rgba(248,113,113,0.1)', color: '#f87171',
                          border: '1px solid rgba(248,113,113,0.2)',
                          fontFamily: 'var(--font-mono)',
                        }}>
                          {sig}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {inv.staticAnalysis.packers && inv.staticAnalysis.packers.length > 0 && (
                  <div className="glass-panel p-5">
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>
                      Packers / Protections
                    </h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {inv.staticAnalysis.packers.map(p => (
                        <span key={p} style={{
                          fontSize: '0.8rem', padding: '4px 10px', borderRadius: 6,
                          background: 'rgba(251,191,36,0.1)', color: '#fbbf24',
                          border: '1px solid rgba(251,191,36,0.2)',
                        }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Dynamic Analysis ──────────────────────────────── */}
            {activeTab === 'dynamic' && inv.dynamicAnalysis && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="glass-panel p-5">
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 12 }}>
                    Behavior Tags
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {inv.dynamicAnalysis.behaviorTags?.map(tag => (
                      <span key={tag} style={{
                        fontSize: '0.8rem', padding: '4px 12px', borderRadius: 99,
                        background: 'rgba(167,139,250,0.1)', color: '#a78bfa',
                        border: '1px solid rgba(167,139,250,0.2)',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {inv.dynamicAnalysis.processes && (
                  <div className="glass-panel p-5">
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 12 }}>
                      Process Tree
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {inv.dynamicAnalysis.processes.map(proc => (
                        <div key={proc.pid} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 12px', borderRadius: 8,
                          background: proc.suspicious ? 'rgba(248,113,113,0.05)' : 'rgba(17,28,42,0.5)',
                          border: `1px solid ${proc.suspicious ? 'rgba(248,113,113,0.2)' : 'rgba(56,189,248,0.06)'}`,
                        }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#64748b', width: 40 }}>
                            {proc.pid}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: proc.suspicious ? '#f87171' : '#94a3b8', fontWeight: 500 }}>
                            {proc.name}
                          </span>
                          {proc.injected && (
                            <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: 4, background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>
                              INJECTED
                            </span>
                          )}
                          {proc.commandLine && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#64748b', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {proc.commandLine}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {inv.dynamicAnalysis.registryOps && inv.dynamicAnalysis.registryOps.length > 0 && (
                  <div className="glass-panel p-5">
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 12 }}>
                      Registry Operations
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {inv.dynamicAnalysis.registryOps.map((op, i) => (
                        <div key={i} style={{
                          display: 'flex', gap: 10, padding: '6px 10px',
                          borderRadius: 6, background: 'rgba(17,28,42,0.5)',
                          border: '1px solid rgba(56,189,248,0.06)',
                        }}>
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                            padding: '2px 6px', borderRadius: 4, flexShrink: 0, alignSelf: 'flex-start', marginTop: 2,
                            background: op.type === 'write' ? 'rgba(248,113,113,0.15)' : 'rgba(56,189,248,0.1)',
                            color: op.type === 'write' ? '#f87171' : '#38bdf8',
                          }}>
                            {op.type}
                          </span>
                          <div>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94a3b8' }}>{op.key}</p>
                            {op.value && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{op.value}: {op.data}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Network Analysis ──────────────────────────────── */}
            {activeTab === 'network' && inv.networkAnalysis && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {inv.networkAnalysis.dnsRequests && inv.networkAnalysis.dnsRequests.length > 0 && (
                  <div className="glass-panel p-5">
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 12 }}>
                      DNS Requests
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {inv.networkAnalysis.dnsRequests.map(d => (
                        <div key={d} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '6px 10px', borderRadius: 6,
                          background: 'rgba(17,28,42,0.5)', border: '1px solid rgba(56,189,248,0.06)',
                        }}>
                          <Globe size={13} color="#38bdf8" />
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: '#94a3b8' }}>{d}</span>
                          <CopyBtn text={d} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {inv.networkAnalysis.httpRequests && inv.networkAnalysis.httpRequests.length > 0 && (
                  <div className="glass-panel p-5">
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 12 }}>
                      HTTP Requests
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {inv.networkAnalysis.httpRequests.map((req, i) => (
                        <div key={i} style={{
                          padding: '10px 12px', borderRadius: 8,
                          background: req.suspicious ? 'rgba(248,113,113,0.05)' : 'rgba(17,28,42,0.5)',
                          border: `1px solid ${req.suspicious ? 'rgba(248,113,113,0.2)' : 'rgba(56,189,248,0.06)'}`,
                        }}>
                          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}>
                              {req.method}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.statusCode}</span>
                          </div>
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: req.suspicious ? '#f87171' : '#94a3b8', wordBreak: 'break-all' }}>
                            {req.url}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {inv.networkAnalysis.geoLocations && inv.networkAnalysis.geoLocations.length > 0 && (
                  <div className="glass-panel p-5">
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 12 }}>
                      Geo-Location
                    </h3>
                    {inv.networkAnalysis.geoLocations.map((geo, i) => (
                      <div key={i} style={{
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
                        padding: '12px', borderRadius: 8, background: 'rgba(17,28,42,0.5)',
                        border: '1px solid rgba(56,189,248,0.08)',
                      }}>
                        {[
                          { label: 'IP', value: geo.ip },
                          { label: 'Country', value: `${geo.countryCode} ${geo.country}` },
                          { label: 'City', value: geo.city },
                          { label: 'ASN', value: geo.asn },
                          { label: 'Org', value: geo.org },
                        ].filter(r => r.value).map(r => (
                          <div key={r.label}>
                            <p style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{r.label}</p>
                            <p style={{ fontSize: '0.875rem', color: '#e2e8f0', marginTop: 2 }}>{r.value}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── MITRE ATT&CK ─────────────────────────────────── */}
            {activeTab === 'mitre' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {inv.mitreTechniques.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No MITRE techniques mapped.
                  </div>
                ) : (
                  inv.mitreTechniques.map(tech => (
                    <div key={tech.id} className="glass-panel p-4" style={{
                      borderLeft: `3px solid ${
                        tech.severity === 'critical' ? '#f87171' :
                        tech.severity === 'high' ? '#fb923c' :
                        tech.severity === 'medium' ? '#fbbf24' : '#38bdf8'
                      }`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{
                              fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700,
                              color: '#38bdf8',
                            }}>
                              {tech.id}
                            </span>
                            <span style={{
                              fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99,
                              background: 'rgba(56,189,248,0.1)', color: '#94a3b8',
                              border: '1px solid rgba(56,189,248,0.15)',
                            }}>
                              {tech.tactic}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#e2e8f0' }}>{tech.name}</p>
                          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: 4 }}>{tech.description}</p>
                        </div>
                        <span className={`badge ${getSeverityBg(tech.severity)}`}>
                          {tech.severity}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Timeline ─────────────────────────────────────── */}
            {activeTab === 'timeline' && (
              <div style={{ position: 'relative' }}>
                {inv.timeline && inv.timeline.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {inv.timeline.map((event, i) => (
                      <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{
                            width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 4,
                            background: event.severity === 'critical' ? '#f87171' :
                              event.severity === 'high' ? '#fb923c' :
                              event.severity === 'medium' ? '#fbbf24' : '#38bdf8',
                            boxShadow: `0 0 8px ${event.severity === 'critical' ? 'rgba(248,113,113,0.5)' : 'rgba(56,189,248,0.4)'}`,
                          }} />
                          {i < inv.timeline!.length - 1 && (
                            <div style={{ width: 1, flex: 1, background: 'rgba(56,189,248,0.1)', marginTop: 4 }} />
                          )}
                        </div>
                        <div style={{
                          flex: 1, padding: '4px 14px 12px',
                          background: 'rgba(17,28,42,0.4)',
                          borderRadius: 8, border: '1px solid rgba(56,189,248,0.06)',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>
                              {event.description}
                            </p>
                            <span className={`badge ${getSeverityBg(event.severity)}`} style={{ flexShrink: 0, marginLeft: 8 }}>
                              {event.severity}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {new Date(event.timestamp).toLocaleTimeString()} · {event.type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No timeline events recorded.
                  </div>
                )}
              </div>
            )}

            {/* ── IOCs ─────────────────────────────────────────── */}
            {activeTab === 'iocs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {inv.iocs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No IOCs recorded.
                  </div>
                ) : (
                  inv.iocs.map((ioc, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 8,
                      background: 'rgba(17,28,42,0.6)',
                      border: '1px solid rgba(56,189,248,0.08)',
                    }}>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                        padding: '3px 8px', borderRadius: 4, flexShrink: 0,
                        background: `${iocTypeColor[ioc.type]}20`,
                        color: iocTypeColor[ioc.type],
                        border: `1px solid ${iocTypeColor[ioc.type]}30`,
                        minWidth: 52, textAlign: 'center',
                      }}>
                        {ioc.type}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.875rem',
                        color: '#94a3b8', flex: 1, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {ioc.value}
                      </span>
                      <span className={`badge ${getSeverityBg(ioc.severity)}`}>{ioc.severity}</span>
                      {ioc.description && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: 180, textAlign: 'right' }}>
                          {ioc.description}
                        </span>
                      )}
                      <CopyBtn text={ioc.value} />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Static analysis missing */}
            {activeTab === 'static' && !inv.staticAnalysis && (
              <div className="glass-panel p-8" style={{ textAlign: 'center', color: '#64748b' }}>
                Static analysis not available for this artifact type.
              </div>
            )}
            {activeTab === 'dynamic' && !inv.dynamicAnalysis && (
              <div className="glass-panel p-8" style={{ textAlign: 'center', color: '#64748b' }}>
                Dynamic analysis not available for this artifact type.
              </div>
            )}
            {activeTab === 'network' && !inv.networkAnalysis && (
              <div className="glass-panel p-8" style={{ textAlign: 'center', color: '#64748b' }}>
                Network analysis not available for this artifact type.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Right Column: AI Chat ─── */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--color-panel)',
        border: '1px solid var(--color-border)',
        borderRadius: 12, overflow: 'hidden',
        height: 'calc(100vh - 120px)',
        position: 'sticky', top: 72,
      }}>
        {/* Chat Header */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid rgba(56,189,248,0.1)',
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(56,189,248,0.04)',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(14,165,233,0.1))',
            border: '1px solid rgba(56,189,248,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot size={16} color="#38bdf8" />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>AI Investigator</p>
            <p style={{ fontSize: '0.7rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
              Online
            </p>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="chat-bubble-ai">
              <p style={{ marginBottom: 8, fontWeight: 500 }}>Investigation Analysis Ready</p>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                I've completed the initial analysis of <strong style={{ color: '#e2e8f0' }}>{inv.title}</strong>. 
                Ask me about IOCs, MITRE techniques, executive summary, or any other aspect.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {['Explain the IOCs', 'MITRE tactics used', 'Executive summary', 'Remediation steps'].map(q => (
                  <button
                    key={q}
                    onClick={() => { setChatInput(q); }}
                    style={{
                      fontSize: '0.75rem', padding: '4px 10px', borderRadius: 6,
                      background: 'rgba(56,189,248,0.08)', color: '#38bdf8',
                      border: '1px solid rgba(56,189,248,0.2)', cursor: 'pointer',
                      fontFamily: 'inherit', transition: 'background 150ms',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
              <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>{msg.content}</p>
              <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 4 }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}

          {isTyping && (
            <div className="chat-bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0, 0.15, 0.3].map((delay, i) => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#38bdf8',
                    animation: `pulse-warning 1s ${delay}s infinite`,
                  }} />
                ))}
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Analyzing...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(56,189,248,0.1)',
          display: 'flex', gap: 8,
        }}>
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat() } }}
            placeholder="Ask about this investigation..."
            style={{
              flex: 1, background: 'rgba(8,13,18,0.8)',
              border: '1px solid rgba(56,189,248,0.15)',
              borderRadius: 8, padding: '8px 12px',
              fontSize: '0.875rem', color: '#e2e8f0',
              fontFamily: 'inherit', outline: 'none',
            }}
          />
          <button
            onClick={handleSendChat}
            disabled={!chatInput.trim()}
            style={{
              padding: '8px 12px', borderRadius: 8,
              background: chatInput.trim() ? 'rgba(56,189,248,0.15)' : 'rgba(56,189,248,0.05)',
              border: '1px solid rgba(56,189,248,0.2)',
              cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
              color: chatInput.trim() ? '#38bdf8' : '#64748b',
              transition: 'all 150ms',
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
