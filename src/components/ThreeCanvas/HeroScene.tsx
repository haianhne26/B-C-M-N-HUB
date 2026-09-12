import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PresentationControls, Environment, Sphere, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// An abstract tech core that pulses and distorts
const TechCore = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1.5, 0]} />
          <meshPhysicalMaterial 
            color="#FF923A" 
            wireframe 
            emissive="#F46D00" 
            emissiveIntensity={2} 
            transparent
            opacity={0.8}
            roughness={0} 
            metalness={1} 
          />
        </mesh>
        
        {/* Inner glowing sphere */}
        <Sphere args={[1.1, 64, 64]}>
          <MeshDistortMaterial 
            color="#F46D00" 
            emissive="#FF923A"
            emissiveIntensity={0.5}
            envMapIntensity={1} 
            clearcoat={1} 
            clearcoatRoughness={0.1} 
            metalness={0.9} 
            roughness={0.1}
            distort={0.4} 
            speed={2} 
          />
        </Sphere>
      </Float>

      {/* Floating particles around the core */}
      <Sparkles count={150} scale={5} size={2} speed={0.4} opacity={0.6} color="#FF923A" />
    </group>
  );
};

export const HeroScene: React.FC = () => {
  return (
    <div className="hero-scene-container" style={{ width: '100%', height: '100%', cursor: 'grab' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}>
        {/* Ambient & directional light */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} color="#FF923A" />
        <directionalLight position={[-10, -10, -10]} intensity={0.5} color="#4ADE9A" />
        
        <PresentationControls
          global
          rotation={[0, 0.3, 0]}
          polar={[-Math.PI / 3, Math.PI / 3]}
          azimuth={[-Math.PI / 1.4, Math.PI / 2]}
        >
          <TechCore />
        </PresentationControls>
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};
