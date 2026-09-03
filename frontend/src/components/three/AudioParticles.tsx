import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface AudioParticlesProps {
  count?: number
  isActive?: boolean
}

export default function AudioParticles({ count = 120, isActive = true }: AudioParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy  = useMemo(() => new THREE.Object3D(), [])

  // Each particle: [x, y, z, speed, phase]
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: -8 + Math.random() * 2,
      y: (Math.random() - 0.5) * 3,
      z: (Math.random() - 0.5) * 2,
      speed: 0.8 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2,
    }))
  }, [count])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    const speedMult = isActive ? 1 : 0.2

    particles.forEach((p, i) => {
      // Move toward core
      p.x += p.speed * 0.012 * speedMult
      // Reset when past core
      if (p.x > 2) {
        p.x = -8 + Math.random() * 2
        p.y = (Math.random() - 0.5) * 3
        p.z = (Math.random() - 0.5) * 2
      }

      // Slight oscillation
      const oy = Math.sin(t * 2 + p.phase) * 0.05

      dummy.position.set(p.x, p.y + oy, p.z)
      const scale = 0.04 + (1 - Math.abs(p.x) / 8) * 0.04
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#00E5FF" transparent opacity={0.7} />
    </instancedMesh>
  )
}
