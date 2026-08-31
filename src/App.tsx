import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import DashboardPage from '@/pages/DashboardPage'
import InvestigationsPage from '@/pages/InvestigationsPage'
import InvestigationDetailPage from '@/pages/InvestigationDetailPage'
import ThreatUniversePage from '@/pages/ThreatUniversePage'
import SubmissionPage from '@/pages/SubmissionPage'
import SearchPage from '@/pages/SearchPage'
import ReportsPage from '@/pages/ReportsPage'
import SettingsPage from '@/pages/SettingsPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/investigations" element={<InvestigationsPage />} />
        <Route path="/investigation/:id" element={<InvestigationDetailPage />} />
        <Route path="/threat-universe" element={<ThreatUniversePage />} />
        <Route path="/submit" element={<SubmissionPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}
