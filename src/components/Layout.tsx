import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Shield, Globe, Upload, Search,
  FileText, Settings, ChevronLeft, ChevronRight, Wifi,
  Activity,
} from 'lucide-react'
import { useAppStore } from '@/store'
import TopBar from './TopBar'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/investigations', label: 'Investigations', icon: Shield },
  { path: '/threat-universe', label: 'Threat Universe', icon: Globe },
  { path: '/submit', label: 'Submit Artifact', icon: Upload },
  { path: '/search', label: 'Search', icon: Search },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, toggleSidebar, investigations } = useAppStore()
  const activeCount = investigations.filter(i => i.status === 'analyzing').length

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside
        className={sidebarCollapsed ? 'sidebar collapsed' : 'sidebar'}
        style={{ position: 'relative' }}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(56,189,248,0.4)',
          }}>
            <Activity size={18} color="#080d12" strokeWidth={2.5} />
          </div>
          {!sidebarCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap' }}>
                CyberThreat OS
              </p>
              <p style={{ fontSize: '0.65rem', color: '#38bdf8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                AI Analyst
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {/* Live status */}
          {!sidebarCollapsed && activeCount > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', marginBottom: 8,
              background: 'rgba(251,191,36,0.08)', borderRadius: 8,
              border: '1px solid rgba(251,191,36,0.2)',
            }}>
              <div className="status-dot analyzing" />
              <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>
                {activeCount} analyzing
              </span>
            </div>
          )}

          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon className="icon" />
              {!sidebarCollapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '12px 8px',
          borderTop: '1px solid rgba(56,189,248,0.08)',
        }}>
          {!sidebarCollapsed && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', marginBottom: 8,
              background: 'rgba(52,211,153,0.08)', borderRadius: 8,
              border: '1px solid rgba(52,211,153,0.15)',
            }}>
              <Wifi size={12} color="#34d399" />
              <span style={{ fontSize: '0.7rem', color: '#34d399' }}>All systems operational</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="sidebar-item"
            style={{ width: '100%' }}
          >
            {sidebarCollapsed
              ? <ChevronRight className="icon" />
              : <><ChevronLeft className="icon" /><span>Collapse</span></>
            }
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="main-area">
        <TopBar />
        <div className="page-content cyber-grid">
          {children}
        </div>
      </div>
    </div>
  )
}
