import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Preload } from '@react-three/drei'
import ShravCore from './ShravCore'
import AudioParticles from './AudioParticles'
import StageRings from './StageRings'
import type { Stage } from '../../types/api'

interface ShravSceneProps {
  riskScore?: number      // 0-1, drives core color
  isActive?: boolean      // drives particle flow speed
  completedStages?: Stage[]
  currentStage?: Stage
  ambient?: boolean       // true = Landing ambient mode (no controls, dimmer)
}

export default function ShravScene({
  riskScore = 0,
  isActive = false,
  completedStages = [],
  currentStage = 'idle',
  ambient = false,
}: ShravSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.4} color="#00E5FF" />
      <directionalLight position={[-5, -5, 3]} intensity={0.2} color="#7B2FBE" />

      {/* Stars background */}
      <Stars
        radius={80}
        depth={50}
        count={ambient ? 800 : 2000}
        factor={2}
        saturation={0}
        fade
        speed={0.3}
      />

      {/* Core SHRAV shape */}
      <ShravCore riskScore={riskScore} isActive={isActive} />

      {/* Audio particle stream */}
      <AudioParticles count={ambient ? 60 : 120} isActive={isActive} />

      {/* Pipeline stage rings — only shown in analysis mode */}
      {!ambient && (
        <StageRings
          completedStages={completedStages}
          currentStage={currentStage}
        />
      )}

      {/* Camera controls — only in full mode */}
      {!ambient && (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.3}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI * 2 / 3}
        />
      )}

      <Preload all />
    </Canvas>
  )
}
