import { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Maximize2 } from 'lucide-react'
import { mockThreatNodes } from '@/lib/mockData'
import type { ThreatNode } from '@/types'

// ─── Node Colors ──────────────────────────────────────────────
const nodeColors: Record<ThreatNode['type'], string> = {
  malware: '#f87171',
  c2: '#fb923c',
  victim: '#fbbf24',
  actor: '#a78bfa',
  technique: '#38bdf8',
  tool: '#34d399',
}

const severityScale: Record<string, number> = {
  critical: 0.35,
  high: 0.27,
  medium: 0.22,
  low: 0.18,
  info: 0.15,
}

// ─── Connection Lines ─────────────────────────────────────────
function ConnectionLines({ nodes }: { nodes: ThreatNode[] }) {
  const lines = useRef<THREE.Group>(null)

  const connections: [THREE.Vector3, THREE.Vector3][] = []
  const visited = new Set<string>()

  nodes.forEach(node => {
    node.connections.forEach(connId => {
      const key = [node.id, connId].sort().join('-')
      if (visited.has(key)) return
      visited.add(key)
      const target = nodes.find(n => n.id === connId)
      if (!target) return
      connections.push([
        new THREE.Vector3(...node.position),
        new THREE.Vector3(...target.position),
      ])
    })
  })

  return (
    <group ref={lines}>
      {connections.map(([start, end], i) => {
        const points = [start, end]
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        const material = new THREE.LineBasicMaterial({ color: '#38bdf8', opacity: 0.15, transparent: true })
        const lineObj = new THREE.Line(geometry, material)
        return <primitive key={i} object={lineObj} />
      })}
    </group>
  )
}

// ─── Threat Node Mesh ─────────────────────────────────────────
function ThreatNodeMesh({
  node,
  onClick,
  selected,
}: {
  node: ThreatNode
  onClick: (n: ThreatNode) => void
  selected: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const color = nodeColors[node.type]
  const size = severityScale[node.severity] ?? 0.22

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.4
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    if (selected) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.08
      meshRef.current.scale.setScalar(pulse)
    }
  })

  return (
    <group position={new THREE.Vector3(...node.position)}>
      {/* Glow sphere */}
      <mesh scale={selected ? 2.5 : 1.8}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={selected ? 0.12 : 0.05} />
      </mesh>

      {/* Main node */}
      <mesh
        ref={meshRef}
        onClick={() => onClick(node)}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'default'}
      >
        <octahedronGeometry args={[size, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={selected ? 1.5 : 0.6}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>

      {/* Label */}
      <Billboard>
        <Text
          position={[0, size + 0.15, 0]}
          fontSize={0.18}
          color={color}
          anchorX="center"
          anchorY="bottom"
          font={undefined}
        >
          {node.label}
        </Text>
      </Billboard>
    </group>
  )
}

// ─── Particle Field ───────────────────────────────────────────
function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null)
  const count = 600
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 30
  }

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial color="#38bdf8" size={0.025} transparent opacity={0.35} sizeAttenuation />
    </points>
  )
}

// ─── Scene ────────────────────────────────────────────────────
function Scene({
  nodes,
  selected,
  onSelect,
}: {
  nodes: ThreatNode[]
  selected: ThreatNode | null
  onSelect: (n: ThreatNode) => void
}) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#38bdf8" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a78bfa" />
      <Stars radius={60} depth={30} count={2000} factor={2} saturation={0.3} fade />
      <ParticleField />
      <ConnectionLines nodes={nodes} />
      {nodes.map(node => (
        <ThreatNodeMesh
          key={node.id}
          node={node}
          onClick={onSelect}
          selected={selected?.id === node.id}
        />
      ))}
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        autoRotate
        autoRotateSpeed={0.3}
        minDistance={4}
        maxDistance={30}
      />
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────
export default function ThreatUniversePage() {
  const [selected, setSelected] = useState<ThreatNode | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const nodes = mockThreatNodes

  const typeGroups = nodes.reduce<Record<string, number>>((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1
    return acc
  }, {})

  return (
    <div style={{ height: 'calc(100vh - 56px - 48px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Threat Universe</h1>
          <p className="text-sm text-cyber-muted" style={{ marginTop: 4 }}>
            Interactive 3D threat intelligence graph · {nodes.length} entities
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {Object.entries(typeGroups).map(([type, count]) => (
            <div key={type} style={{ textAlign: 'center' }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: nodeColors[type as ThreatNode['type']],
                margin: '0 auto 3px',
              }} />
              <p style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'capitalize' }}>
                {type} ({count})
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div style={{
        flex: 1, borderRadius: 12, overflow: 'hidden',
        border: '1px solid rgba(56,189,248,0.12)',
        position: 'relative', background: '#04080e',
      }}>
        <Canvas
          camera={{ position: [0, 0, 12], fov: 60 }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <Scene nodes={nodes} selected={selected} onSelect={setSelected} />
          </Suspense>
        </Canvas>

        {/* Controls hint */}
        <div style={{
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 12,
          padding: '6px 16px', borderRadius: 99,
          background: 'rgba(8,13,18,0.8)', border: '1px solid rgba(56,189,248,0.15)',
          fontSize: '0.7rem', color: '#64748b',
        }}>
          <span>🖱 Drag to rotate</span>
          <span>🔍 Scroll to zoom</span>
          <span>👆 Click node for details</span>
        </div>
      </div>

      {/* Selected Node Panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-panel p-4"
            style={{
              flexShrink: 0, borderLeft: `3px solid ${nodeColors[selected.type]}`,
              display: 'flex', alignItems: 'center', gap: 16,
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: `${nodeColors[selected.type]}20`,
              border: `1px solid ${nodeColors[selected.type]}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 12, height: 12, borderRadius: 2,
                background: nodeColors[selected.type],
                transform: 'rotate(45deg)',
              }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.9375rem' }}>{selected.label}</p>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                  background: `${nodeColors[selected.type]}20`, color: nodeColors[selected.type],
                  textTransform: 'uppercase',
                }}>
                  {selected.type}
                </span>
              </div>
              {selected.details && (
                <div style={{ display: 'flex', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
                  {Object.entries(selected.details).map(([k, v]) => (
                    <span key={k} style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      <span style={{ color: '#64748b' }}>{k}: </span>{v}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {selected.connections.map(cId => {
                const cn = nodes.find(n => n.id === cId)
                return cn ? (
                  <span
                    key={cId}
                    style={{
                      fontSize: '0.7rem', padding: '2px 8px', borderRadius: 6,
                      background: `${nodeColors[cn.type]}15`,
                      color: nodeColors[cn.type],
                      border: `1px solid ${nodeColors[cn.type]}25`,
                    }}
                  >
                    → {cn.label}
                  </span>
                ) : null
              })}
            </div>
            <button
              onClick={() => setSelected(null)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#64748b', padding: 4, borderRadius: 4, flexShrink: 0,
              }}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
