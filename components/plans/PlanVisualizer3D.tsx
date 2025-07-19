'use client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, OrthographicCamera, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { useMemo } from 'react'
import type { PlanProposal, Parcelle } from '@/interface/type'

function Parcelle3D({ parcelle, heightScale = 0.1 }: {
  parcelle: {
    geometry: {
      type: 'Polygon'
      coordinates: number[][][]
    }
    properties: {
      id_parcelle: string
      couleur: string
      pourcentage: number
    }
  }
  heightScale?: number
}) {
  const shape = useMemo(() => {
    const shape = new THREE.Shape()
    parcelle.geometry.coordinates[0].forEach(([x, y]) => {
      shape.lineTo(x, y)
    })
    return shape
  }, [parcelle.geometry])

  const height = parcelle.properties.pourcentage * heightScale

  return (
    <mesh position={[0, 0, height / 2]}>
      <extrudeGeometry args={[shape, { 
        depth: height, 
        bevelEnabled: false,
        steps: 1
      }]} />
      <meshStandardMaterial 
        color={parcelle.properties.couleur} 
        roughness={0.4}
      />
    </mesh>
  )
}

export default function Plan3D({ plan }: { plan: PlanProposal }) {
  const { width, height } = plan.dimensions
  const maxDimension = Math.max(width, height)
  const cameraPosition: [number, number, number] = [width / 2, height / 2, maxDimension * 1.5]

  return (
    <div className="h-full w-full">
      <Canvas 
        orthographic
        camera={{ 
          position: cameraPosition, 
          zoom: 50,
          near: 0.1,
          far: maxDimension * 3
        }}
      >
        <ambientLight intensity={0.5} />
        <spotLight 
          position={[width, height, maxDimension]} 
          angle={0.3} 
          intensity={1} 
          penumbra={1} 
        />
        
        <Grid
          args={[maxDimension, maxDimension / 10]}
          cellColor="#cccccc"
          sectionColor="#888888"
        />
        
        {plan.parcelles.map((parcelle) => (
          <Parcelle3D 
            key={parcelle.id_parcelle}
            parcelle={{
              geometry: parcelle.geometrie,
              properties: {
                id_parcelle: parcelle.id_parcelle,
                couleur: parcelle.culture?.couleur || '#cccccc',
                pourcentage: parcelle.pourcentage
              }
            }} 
          />
        ))}
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          minZoom={20}
          maxZoom={100}
          target={[width / 2, height / 2, 0]}
        />
      </Canvas>
    </div>
  )
}