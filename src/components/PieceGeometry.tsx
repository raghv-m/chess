'use client';

import { useRef } from 'react';
import { Mesh } from 'three';
import { useGLTF } from '@react-three/drei';

interface PieceGeometryProps {
  type: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
  color: 'white' | 'black';
  onClick?: () => void;
}

export function PieceGeometry({ type, color, onClick }: PieceGeometryProps) {
  const meshRef = useRef<Mesh>(null);
  
  // Basic geometry for each piece type
  const geometry = () => {
    switch (type) {
      case 'pawn':
        return <cylinderGeometry args={[0.2, 0.3, 0.5]} />;
      case 'rook':
        return <boxGeometry args={[0.4, 0.6, 0.4]} />;
      case 'knight':
        return <cylinderGeometry args={[0.2, 0.3, 0.6]} />;
      case 'bishop':
        return <coneGeometry args={[0.3, 0.8, 8]} />;
      case 'queen':
        return <cylinderGeometry args={[0.3, 0.3, 0.9]} />;
      case 'king':
        return <cylinderGeometry args={[0.3, 0.3, 1]} />;
      default:
        return <boxGeometry args={[0.4, 0.4, 0.4]} />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      onClick={onClick}
      castShadow
      receiveShadow
    >
      {geometry()}
      <meshStandardMaterial
        color={color === 'white' ? '#ffffff' : '#333333'}
        metalness={0.5}
        roughness={0.5}
      />
    </mesh>
  );
}

// Preload models
useGLTF.preload('/models/chess-pieces.glb'); 