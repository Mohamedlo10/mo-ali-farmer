import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, PresentationControls } from '@react-three/drei';
import { Culture } from '@/interface/type';

// Composant pour une parcelle individuelle
const Parcelle = ({ 
  parcelle, 
  culture, 
  terrainWidth, 
  terrainLength, 
  terrainHeight = 0.5 
}: { 
  parcelle: any; 
  culture: Culture | null; 
  terrainWidth: number; 
  terrainLength: number; 
  terrainHeight?: number;
}) => {
  // Calcul des dimensions et position de la parcelle en 3D
  const width = terrainWidth * Math.sqrt(parcelle.pourcentage / 100);
  const length = terrainLength * Math.sqrt(parcelle.pourcentage / 100);
  const posX = (parcelle.position_x * terrainWidth) - (terrainWidth / 2);
  const posZ = (parcelle.position_y * terrainLength) - (terrainLength / 2);
  
  // Conversion de la couleur hexadécimale en couleurs RGB
  // Couleur unique par index si non fournie
  const getColor = (idx: number, total: number) => `hsl(${(idx * 360 / total)}, 70%, 55%)`;
  const color = parcelle.couleur || getColor(parcelle.index ?? 0, parcelle.totalParcelles ?? 5);
  
  // Déterminer la forme à afficher
  const isCircle = parcelle.forme === 'cercle';
  
  // Animation subtile
  const meshRef = useRef<any>(null);
  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.position.y = terrainHeight/2 + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.03;
    }
  });
  
  return (
    <>
      {isCircle ? (
        <Sphere 
          ref={meshRef}
          args={[Math.min(width, length) / 2, 32, 32]} 
          position={[posX, terrainHeight/2, posZ]}
        >
          <meshStandardMaterial 
            color={color} 
            roughness={0.4} 
            metalness={0.1} 
          />
        </Sphere>
      ) : (
        <Box 
          ref={meshRef}
          args={[width, terrainHeight, length]} 
          position={[posX, terrainHeight/2, posZ]}
        >
          <meshStandardMaterial 
            color={color} 
            roughness={0.4} 
            metalness={0.1}
          />
        </Box>
      )}
      
      {/* Étiquette de la culture */}
      {culture && (
        <Text
          position={[posX, terrainHeight + 0.3, posZ]}
          color="black"
          fontSize={0.3}
          maxWidth={2}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
        >
          {culture.nom}
        </Text>
      )}
    </>
  );
};

// Composant de base représentant le terrain
const Terrain = ({ width, length }: { width: number; length: number }) => {
  return (
    <Box args={[width, 0.1, length]} position={[0, 0, 0]}>
      <meshStandardMaterial color="#8B4513" roughness={0.8} />
    </Box>
  );
};

// Composant principal qui affiche le plan en 3D
const PlanVisualizer3D = ({ 
  parcelles, 
  cultures,
  width = 5,
  length = 5,
  height = 3
}: { 
  parcelles: any[]; 
  cultures: Culture[];
  width?: number;
  length?: number;
  height?: number;
}) => {
  // Helper pour trouver une culture par son ID
  const getCultureById = (id: number) => {
    return cultures.find(c => c.id_culture === id) || null;
  };

  return (
    <div className="w-full h-[400px]">
      <Canvas shadows camera={{ position: [0, 5, 7], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          position={[10, 8, 5]}
          intensity={1.5}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <PresentationControls
          global
          zoom={1}
          rotation={[0, -Math.PI / 6, 0]}
          polar={[-Math.PI / 6, Math.PI / 6]}
          azimuth={[-Math.PI / 6, Math.PI / 6]}
        >
          <group>
            <Terrain width={width} length={length} />
            
            {/* Parcelles */}
            {parcelles.map((parcelle, i) => (
              <Parcelle 
                key={i} 
                parcelle={parcelle} 
                culture={getCultureById(parcelle.id_culture)}
                terrainWidth={width}
                terrainLength={length}
              />
            ))}
          </group>
        </PresentationControls>
        <OrbitControls 
          enableZoom={true}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 6}
        />
      </Canvas>
    </div>
  );
};

export default PlanVisualizer3D;
