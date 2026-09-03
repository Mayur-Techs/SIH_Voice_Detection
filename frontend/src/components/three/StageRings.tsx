import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import type { Stage } from '../../types/api'

interface StageRingsProps {
  completedStages: Stage[]
  currentStage: Stage
}

const STAGES: { id: Stage; label: string; labelMr: string }[] = [
  { id: 'preprocessing',    label: 'VOICE',   labelMr: 'आवाज'   },
  { id: 'representation',   label: 'ANALYZE', labelMr: 'विश्लेषण' },
  { id: 'anti_spoof_model', label: 'SCORE',   labelMr: 'गुण'   },
  { id: 'complete',         label: 'VERIFY',  labelMr: 'तपासा' },
  { id: 'complete',         label: 'PROTECT', labelMr: 'संरक्षण' },
]

const COLOR_ACTIVE   = new THREE.Color('#00E5FF')
const COLOR_INACTIVE = new THREE.Color('#1A1A2E')

function Ring({
  position, label, labelMr, isActive, isCurrent
}: {
  position: [number, number, number]
  label: string
  labelMr: string
  isActive: boolean
  isCurrent: boolean
}) {
  const ringRef = useRef<THREE.Mesh>(null!)
  const matRef  = useRef<THREE.MeshBasicMaterial>(null!)

  useFrame((_, delta) => {
    if (!ringRef.current) return
    // Rotate active rings
    if (isActive) ringRef.current.rotation.z += delta * (isCurrent ? 2 : 0.5)
    // Lerp color
    const target = isActive ? COLOR_ACTIVE : COLOR_INACTIVE
    matRef.current.color.lerp(target, 0.06)
    matRef.current.opacity = isActive ? 0.9 : 0.25
  })

  return (
    <group position={position}>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.35, 0.02, 8, 32]} />
        <meshBasicMaterial ref={matRef} color="#1A1A2E" transparent opacity={0.25} />
      </mesh>
      {isActive && (
        <pointLight color="#00E5FF" intensity={0.6} distance={2} />
      )}
      <Text
        position={[0, -0.55, 0]}
        fontSize={0.12}
        color={isActive ? '#00E5FF' : '#6B7A99'}
        font={undefined}
        anchorX="center"
        anchorY="top"
      >
        {label}
      </Text>
      <Text
        position={[0, -0.72, 0]}
        fontSize={0.09}
        color={isActive ? '#00E5FF88' : '#6B7A9966'}
        anchorX="center"
        anchorY="top"
      >
        {labelMr}
      </Text>
    </group>
  )
}

export default function StageRings({ completedStages, currentStage }: StageRingsProps) {
  // Position rings in an arc to the left of the core
  const positions: [number, number, number][] = [
    [-4.5,  1.2, 0],
    [-3.8, -0.2, 0],
    [-3.2,  0.5, 0],
    [-2.5, -0.8, 0],
    [-2.0,  0.8, 0],
  ]

  return (
    <group>
      {STAGES.map(({ id, label, labelMr }, i) => {
        const isActive = completedStages.includes(id) || currentStage === id
        const isCurrent = currentStage === id
        return (
          <Ring
            key={`${id}-${i}`}
            position={positions[i]}
            label={label}
            labelMr={labelMr}
            isActive={isActive}
            isCurrent={isCurrent}
          />
        )
      })}
      {positions.slice(0, -1).map((pos, i) => {
        const next = positions[i + 1]
        const isActive = completedStages.includes(STAGES[i].id)
        const points = [new THREE.Vector3(...pos), new THREE.Vector3(...next)]
        const geo = new THREE.BufferGeometry().setFromPoints(points)
        const mat = new THREE.LineBasicMaterial({
          color: isActive ? '#00E5FF' : '#1A1A2E',
          transparent: true,
          opacity: isActive ? 0.5 : 0.2,
        })
        const lineObj = new THREE.Line(geo, mat)
        return <primitive key={i} object={lineObj} />
      })}
    </group>
  )
}
