import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, File, Link, Hash, Mail, Network, FileCode, Shield } from 'lucide-react'
import { useAppStore } from '@/store'
import { generateId } from '@/lib/utils'
import type { Investigation } from '@/types'

const artifactTypes = [
  { id: 'file', label: 'File', icon: File, desc: 'PE, ELF, Mach-O, Office docs' },
  { id: 'url', label: 'URL', icon: Link, desc: 'Suspicious links' },
  { id: 'domain', label: 'Domain', icon: Network, desc: 'Suspicious domains' },
  { id: 'ip', label: 'IP Address', icon: Shield, desc: 'IPv4/IPv6 addresses' },
  { id: 'hash', label: 'Hash', icon: Hash, desc: 'MD5, SHA1, SHA256' },
  { id: 'email', label: 'Email', icon: Mail, desc: '.eml files or headers' },
  { id: 'script', label: 'Script', icon: FileCode, desc: 'PowerShell, JS, VBA' },
]

export default function SubmissionPage() {
  const [selectedType, setSelectedType] = useState('file')
  const [input, setInput] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { addInvestigation } = useAppStore()

  const handleSubmit = async () => {
    if (!input.trim()) return
    setSubmitting(true)

    // Simulate submission
    setTimeout(() => {
      const newInvestigation: Investigation = {
        id: `inv-${generateId().slice(0, 6)}`,
        title: `New ${selectedType} analysis`,
        artifactType: selectedType as Investigation['artifactType'],
        artifactValue: input,
        status: 'analyzing',
        verdict: 'unknown',
        confidence: 0,
        riskScore: 50,
        createdAt: new Date().toISOString(),
        analyst: 'AI Analyst',
        tags: [],
        mitreTechniques: [],
        iocs: [],
      }
      addInvestigation(newInvestigation)
      setSubmitting(false)
      setInput('')
      alert('Artifact submitted for analysis. Check the Investigations page.')
    }, 1500)
  }

  return (
    <div style={{ maxWidth: 768, margin: '0 auto' }} className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-100">Submit Artifact</h1>
        <p className="text-cyber-muted mt-2">Upload files, URLs, or indicators for AI-powered analysis</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {artifactTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            style={{
              padding: '16px', textAlign: 'left',
              background: selectedType === type.id ? 'rgba(56,189,248,0.07)' : 'var(--color-panel)',
              border: `1px solid ${selectedType === type.id ? 'rgba(56,189,248,0.4)' : 'rgba(56,189,248,0.1)'}`,
              borderRadius: 12, cursor: 'pointer', transition: 'all 150ms',
              fontFamily: 'inherit',
            }}
          >
            <type.icon
              size={22}
              color={selectedType === type.id ? '#38bdf8' : '#94a3b8'}
              style={{ marginBottom: 8 }}
            />
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>{type.label}</p>
            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 4 }}>{type.desc}</p>
          </button>
        ))}
      </div>

      <div className="glass-panel p-6">
        {selectedType === 'file' ? (
          <div
            style={{
              border: `2px dashed ${dragActive ? '#38bdf8' : 'rgba(56,189,248,0.2)'}`,
              borderRadius: 12, padding: '3rem',
              textAlign: 'center', transition: 'all 150ms',
              background: dragActive ? 'rgba(56,189,248,0.03)' : 'transparent',
            }}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false) }}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload size={48} color="#64748b" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#cbd5e1', fontWeight: 500 }}>Drag and drop files here</p>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: 4 }}>
              or click to browse (max 100MB)
            </p>
            <input type="file" style={{ display: 'none' }} />
          </div>
        ) : (
          <div className="space-y-4">
            <label style={{ fontSize: '0.875rem', color: '#cbd5e1', display: 'block' }}>
              Enter {artifactTypes.find(t => t.id === selectedType)?.label}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Enter ${selectedType} to analyze...`}
              rows={4}
              style={{
                width: '100%', background: 'var(--color-bg)',
                border: '1px solid rgba(56,189,248,0.15)',
                borderRadius: 8, padding: 16,
                fontSize: '0.875rem', color: '#f1f5f9',
                fontFamily: 'var(--font-mono)', outline: 'none',
                resize: 'vertical', transition: 'border-color 150ms',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(56,189,248,0.4)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(56,189,248,0.15)' }}
            />
          </div>
        )}

        <div style={{
          marginTop: 24, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#64748b' }}>
            <Shield size={13} />
            <span>Files are analyzed in isolated sandbox environments</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || (!input && selectedType !== 'file')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
              color: '#080d12', fontWeight: 600, fontSize: '0.875rem',
              fontFamily: 'inherit', transition: 'opacity 150ms',
              opacity: (submitting || (!input && selectedType !== 'file')) ? 0.4 : 1,
            }}
          >
            {submitting ? (
              <>
                <div className="spinner" style={{ borderTopColor: '#080d12', borderColor: 'rgba(8,13,18,0.3)' }} />
                Analyzing...
              </>
            ) : (
              <>
                <Upload size={16} />
                Submit for Analysis
              </>
            )}
          </button>
        </div>
      </div>

      <div className="glass-panel p-5">
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 12 }}>
          Analysis Pipeline
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {['Static Analysis', 'Dynamic Sandbox', 'Network Analysis', 'Threat Intel', 'AI Correlation'].map((step, i, arr) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                padding: '6px 12px',
                background: 'rgba(17,28,42,0.8)',
                borderRadius: 8, fontSize: '0.8rem', color: '#cbd5e1',
                border: '1px solid rgba(56,189,248,0.1)',
              }}>
                {step}
              </div>
              {i < arr.length - 1 && (
                <div style={{ width: 16, height: 1, background: 'rgba(56,189,248,0.2)' }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
