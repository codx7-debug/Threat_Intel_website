import { useState } from 'react'
import { motion } from 'framer-motion'
import { Key, Shield, Database, Globe, Save, Check } from 'lucide-react'
import { useAppStore } from '@/store'

const settingsSections = [
  { id: 'integrations', label: 'Threat Intel Integrations', icon: Globe },
  { id: 'security', label: 'Security & Access', icon: Shield },
  { id: 'storage', label: 'Data Storage', icon: Database },
]

const securitySettings = [
  { label: 'Require MFA for all analysts', desc: 'Enforce multi-factor authentication', enabled: true },
  { label: 'Auto-quarantine malicious samples', desc: 'Move detected malware to isolated storage', enabled: true },
  { label: 'Audit logging', desc: 'Log all analyst actions for compliance', enabled: true },
  { label: 'Sandbox network isolation', desc: 'Block all outbound traffic from sandboxes', enabled: false },
]

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 40, height: 22, borderRadius: 99,
        background: enabled ? '#38bdf8' : 'rgba(56,189,248,0.15)',
        border: `1px solid ${enabled ? '#38bdf8' : 'rgba(56,189,248,0.2)'}`,
        cursor: 'pointer', position: 'relative', transition: 'all 150ms',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: enabled ? 20 : 2,
        width: 16, height: 16, borderRadius: '50%',
        background: enabled ? '#080d12' : '#64748b',
        transition: 'left 150ms',
      }} />
    </button>
  )
}

export default function SettingsPage() {
  const { threatIntelSources, updateThreatIntelSource } = useAppStore()
  const [activeSection, setActiveSection] = useState('integrations')
  const [saved, setSaved] = useState(false)
  const [secSettings, setSecSettings] = useState(securitySettings)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleSecurity = (label: string) => {
    setSecSettings(prev => prev.map(s =>
      s.label === label ? { ...s, enabled: !s.enabled } : s
    ))
  }

  return (
    <div className="space-y-6" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Platform Settings</h1>
        <p className="text-sm text-cyber-muted mt-1">
          Configure integrations, security, and system preferences
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
        {/* Sidebar nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {settingsSections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 8, border: 'none',
                background: activeSection === section.id ? 'rgba(56,189,248,0.1)' : 'transparent',
                color: activeSection === section.id ? '#38bdf8' : '#64748b',
                fontSize: '0.875rem', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms',
                width: '100%', textAlign: 'left',
              }}
              onMouseEnter={e => {
                if (activeSection !== section.id) e.currentTarget.style.background = 'rgba(56,189,248,0.05)'
              }}
              onMouseLeave={e => {
                if (activeSection !== section.id) e.currentTarget.style.background = 'transparent'
              }}
            >
              <section.icon size={16} />
              {section.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeSection === 'integrations' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="glass-panel p-5">
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Key size={15} color="#38bdf8" />
                  API Integrations
                </h3>
                <div className="space-y-3">
                  {threatIntelSources.map(source => (
                    <div key={source.name} style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: '14px 16px', borderRadius: 10,
                      background: 'rgba(17,28,42,0.6)',
                      border: '1px solid rgba(56,189,248,0.08)',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>
                            {source.name}
                          </p>
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 700,
                            padding: '2px 8px', borderRadius: 99,
                            background: source.enabled ? 'rgba(52,211,153,0.15)' : 'rgba(100,116,139,0.15)',
                            color: source.enabled ? '#34d399' : '#64748b',
                          }}>
                            {source.enabled ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Last sync: {source.lastSync ? new Date(source.lastSync).toLocaleString() : 'Never'}
                          </p>
                          {source.quota && (
                            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              Quota: {source.used}/{source.quota}
                            </p>
                          )}
                        </div>
                        {source.quota && (
                          <div style={{ marginTop: 6, height: 3, background: 'rgba(56,189,248,0.1)', borderRadius: 99 }}>
                            <div style={{
                              height: '100%', borderRadius: 99,
                              width: `${Math.min(100, ((source.used || 0) / source.quota) * 100)}%`,
                              background: '#38bdf8',
                            }} />
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input
                          type="password"
                          placeholder="API Key"
                          value={source.apiKey || ''}
                          onChange={(e) => updateThreatIntelSource(source.name, { apiKey: e.target.value })}
                          style={{
                            background: 'var(--color-bg)',
                            border: '1px solid rgba(56,189,248,0.15)',
                            borderRadius: 8, padding: '6px 12px',
                            fontSize: '0.8125rem', color: '#e2e8f0',
                            width: 160, fontFamily: 'inherit', outline: 'none',
                          }}
                        />
                        <Toggle
                          enabled={source.enabled}
                          onToggle={() => updateThreatIntelSource(source.name, { enabled: !source.enabled })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="glass-panel p-5">
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 16 }}>
                  Security Configuration
                </h3>
                <div className="space-y-3">
                  {secSettings.map(setting => (
                    <div key={setting.label} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px', borderRadius: 10,
                      background: 'rgba(17,28,42,0.6)', border: '1px solid rgba(56,189,248,0.08)',
                    }}>
                      <div>
                        <p style={{ fontSize: '0.875rem', color: '#e2e8f0' }}>{setting.label}</p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{setting.desc}</p>
                      </div>
                      <Toggle
                        enabled={setting.enabled}
                        onToggle={() => toggleSecurity(setting.label)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'storage' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="glass-panel p-5">
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 16 }}>
                  Storage Settings
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Sample Retention', value: '90 days', sub: 'Auto-deleted after period' },
                    { label: 'Storage Used', value: '247 GB', sub: '24.7% of 1 TB' },
                    { label: 'Sandbox Timeout', value: '3 minutes', sub: 'Per analysis run' },
                    { label: 'Report Retention', value: '1 year', sub: 'PDF exports retained' },
                  ].map(item => (
                    <div key={item.label} style={{
                      padding: '16px', borderRadius: 10,
                      background: 'rgba(17,28,42,0.6)', border: '1px solid rgba(56,189,248,0.08)',
                    }}>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {item.label}
                      </p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', marginTop: 4 }}>
                        {item.value}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>{item.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Storage bar */}
                <div style={{ marginTop: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Storage</span>
                    <span style={{ fontSize: '0.8rem', color: '#38bdf8' }}>247 GB / 1 TB</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(56,189,248,0.1)', borderRadius: 99 }}>
                    <div style={{
                      height: '100%', width: '24.7%', borderRadius: 99,
                      background: 'linear-gradient(to right, #38bdf8, #0ea5e9)',
                    }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
            color: '#080d12', fontWeight: 600, fontSize: '0.875rem',
            fontFamily: 'inherit',
          }}
        >
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
