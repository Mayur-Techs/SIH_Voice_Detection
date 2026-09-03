import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ShravCoreProps {
  riskScore?: number  // 0-1
  isActive?: boolean
}

function lerpColor(a: THREE.Color, b: THREE.Color, t: number): THREE.Color {
  return new THREE.Color(
    a.r + (b.r - a.r) * t,
    a.g + (b.g - a.g) * t,
    a.b + (b.b - a.b) * t,
  )
}

const COLOR_LOW  = new THREE.Color('#00FF87')
const COLOR_SUSP = new THREE.Color('#FFB800')
const COLOR_HIGH = new THREE.Color('#FF2D55')

function getRiskColor(score: number): THREE.Color {
  if (score < 0.4) {
    return lerpColor(COLOR_LOW, COLOR_SUSP, score / 0.4)
  }
  return lerpColor(COLOR_SUSP, COLOR_HIGH, (score - 0.4) / 0.6)
}

export default function ShravCore({ riskScore = 0, isActive = false }: ShravCoreProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const wireRef = useRef<THREE.Mesh>(null!)
  const matRef  = useRef<THREE.MeshStandardMaterial>(null!)
  const wireMat = useRef<THREE.MeshBasicMaterial>(null!)

  const color = useMemo(() => getRiskColor(Math.min(1, Math.max(0, riskScore))), [riskScore])

  useFrame((_, delta) => {
    // Rotate
    meshRef.current.rotation.x += delta * 0.3
    meshRef.current.rotation.y += delta * 0.5
    wireRef.current.rotation.x += delta * 0.3
    wireRef.current.rotation.y += delta * 0.5

    // Smooth color interpolation
    matRef.current.color.lerp(color, 0.08)
    matRef.current.emissive.lerp(color, 0.06)
    wireMat.current.color.lerp(color, 0.08)

    // Pulse scale when active
    if (isActive) {
      const pulse = 1 + Math.sin(Date.now() * 0.003) * 0.05
      meshRef.current.scale.setScalar(pulse)
      wireRef.current.scale.setScalar(pulse)
    }
  })

  return (
    <group>
      {/* Solid icosahedron */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial
          ref={matRef}
          color="#00FF87"
          emissive="#00FF87"
          emissiveIntensity={0.3}
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0.7}
        />
      </mesh>
      {/* Wireframe overlay */}
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[1.25, 1]} />
        <meshBasicMaterial
          ref={wireMat}
          color="#00FF87"
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>
      {/* Point light at center */}
      <pointLight color={color} intensity={2} distance={6} />
    </group>
  )
}
