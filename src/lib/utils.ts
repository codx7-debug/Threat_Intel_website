import { clsx, type ClassValue } from 'clsx'
import type { Verdict, Severity } from '@/types'

// ─── Class Names Utility ───────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// ─── ID Generator ─────────────────────────────────────────────────────────────
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// ─── Verdict Color ────────────────────────────────────────────────────────────
export function getVerdictColor(verdict: Verdict): string {
  switch (verdict) {
    case 'malicious':
      return 'badge-malicious'
    case 'suspicious':
      return 'badge-suspicious'
    case 'likely_benign':
      return 'badge-likely-benign'
    case 'benign':
      return 'badge-benign'
    default:
      return 'badge-unknown'
  }
}

// ─── Severity Color ────────────────────────────────────────────────────────────
export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'critical':
      return 'text-red-400'
    case 'high':
      return 'text-orange-400'
    case 'medium':
      return 'text-yellow-400'
    case 'low':
      return 'text-blue-400'
    case 'info':
      return 'text-gray-400'
  }
}

export function getSeverityBg(severity: Severity): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'high':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'low':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'info':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

// ─── Risk Score Color ─────────────────────────────────────────────────────────
export function getRiskColor(score: number): string {
  if (score >= 80) return 'text-red-400'
  if (score >= 60) return 'text-orange-400'
  if (score >= 40) return 'text-yellow-400'
  if (score >= 20) return 'text-blue-400'
  return 'text-green-400'
}

// ─── Date Formatter ────────────────────────────────────────────────────────────
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── File Size Formatter ──────────────────────────────────────────────────────
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

// ─── Truncate String ──────────────────────────────────────────────────────────
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

// ─── Hash Truncate ────────────────────────────────────────────────────────────
export function truncateHash(hash: string, start = 8, end = 8): string {
  if (hash.length <= start + end) return hash
  return `${hash.slice(0, start)}...${hash.slice(-end)}`
}
