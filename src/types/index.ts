// ─── Verdict Types ────────────────────────────────────────────────────────────
export type Verdict = 'malicious' | 'suspicious' | 'likely_benign' | 'benign' | 'unknown'
export type ArtifactType = 'file' | 'url' | 'domain' | 'ip' | 'hash' | 'email' | 'script'
export type Status = 'queued' | 'analyzing' | 'complete' | 'error'
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

// ─── Investigation ─────────────────────────────────────────────────────────────
export interface Investigation {
  id: string
  title: string
  artifactType: ArtifactType
  artifactValue: string
  status: Status
  verdict: Verdict
  confidence: number
  riskScore: number
  createdAt: string
  updatedAt?: string
  analyst: string
  tags: string[]
  mitreTechniques: MitreTechnique[]
  iocs: IOC[]
  summary?: string
  staticAnalysis?: StaticAnalysis
  dynamicAnalysis?: DynamicAnalysis
  networkAnalysis?: NetworkAnalysis
  timeline?: TimelineEvent[]
}

// ─── MITRE ATT&CK ─────────────────────────────────────────────────────────────
export interface MitreTechnique {
  id: string          // e.g., "T1059.001"
  name: string
  tactic: string
  description: string
  severity: Severity
}

// ─── IOC ──────────────────────────────────────────────────────────────────────
export interface IOC {
  type: 'ip' | 'domain' | 'url' | 'hash' | 'email' | 'registry' | 'file_path'
  value: string
  severity: Severity
  description?: string
  firstSeen?: string
  lastSeen?: string
}

// ─── Static Analysis ──────────────────────────────────────────────────────────
export interface StaticAnalysis {
  fileType?: string
  fileSize?: number
  md5?: string
  sha1?: string
  sha256?: string
  entropy?: number
  imports?: string[]
  exports?: string[]
  sections?: FileSection[]
  strings?: string[]
  packers?: string[]
  signatures?: string[]
}

export interface FileSection {
  name: string
  virtualSize: number
  rawSize: number
  entropy: number
  flags: string[]
}

// ─── Dynamic Analysis ─────────────────────────────────────────────────────────
export interface DynamicAnalysis {
  sandboxName?: string
  duration?: number
  processes?: ProcessInfo[]
  registryOps?: RegistryOp[]
  fileOps?: FileOp[]
  networkConnections?: NetworkConn[]
  behaviorTags?: string[]
}

export interface ProcessInfo {
  pid: number
  name: string
  commandLine?: string
  parent?: number
  injected?: boolean
  suspicious?: boolean
}

export interface RegistryOp {
  type: 'read' | 'write' | 'delete' | 'create'
  key: string
  value?: string
  data?: string
}

export interface FileOp {
  type: 'create' | 'read' | 'write' | 'delete' | 'move'
  path: string
  suspicious?: boolean
}

export interface NetworkConn {
  protocol: string
  src: string
  dst: string
  dstPort: number
  bytes?: number
  suspicious?: boolean
}

// ─── Network Analysis ─────────────────────────────────────────────────────────
export interface NetworkAnalysis {
  dnsRequests?: string[]
  httpRequests?: HttpRequest[]
  tlsCerts?: TlsCert[]
  geoLocations?: GeoLocation[]
}

export interface HttpRequest {
  method: string
  url: string
  statusCode?: number
  userAgent?: string
  suspicious?: boolean
}

export interface TlsCert {
  subject: string
  issuer: string
  validFrom: string
  validTo: string
  selfSigned?: boolean
}

export interface GeoLocation {
  ip: string
  country: string
  countryCode: string
  city?: string
  asn?: string
  org?: string
  latitude?: number
  longitude?: number
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
export interface TimelineEvent {
  timestamp: string
  type: 'process' | 'network' | 'file' | 'registry' | 'behavior' | 'detection'
  severity: Severity
  description: string
  details?: string
}

// ─── Threat Intel Source ──────────────────────────────────────────────────────
export interface ThreatIntelSource {
  name: string
  enabled: boolean
  apiKey?: string
  lastSync?: string
  quota?: number
  used?: number
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export interface ThreatTrendData {
  date: string
  malicious: number
  suspicious: number
  benign: number
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// ─── Threat Universe Node ─────────────────────────────────────────────────────
export interface ThreatNode {
  id: string
  type: 'malware' | 'c2' | 'victim' | 'actor' | 'technique' | 'tool'
  label: string
  position: [number, number, number]
  connections: string[]
  severity: Severity
  details?: Record<string, string>
}
