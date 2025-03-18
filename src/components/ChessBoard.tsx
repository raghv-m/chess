'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Position, GameState, ChessPiece } from '@/types';
import * as THREE from 'three';

interface ChessBoardProps {
  gameState: GameState;
  selectedPiece: Position | null;
  onSquareClick: (position: Position) => void;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ gameState, selectedPiece, onSquareClick }) => {
  const boardRef = useRef<THREE.Group>(null);
  const [hoveredSquare, setHoveredSquare] = useState<Position | null>(null);
  const [animations, setAnimations] = useState<Map<string, { target: THREE.Vector3; progress: number }>>(new Map());

  // Colors
  const lightSquareColor = new THREE.Color(0xE8EDF9);
  const darkSquareColor = new THREE.Color(0xB7C0D8);
  const selectedColor = new THREE.Color(0x90CDF4);
  const validMoveColor = new THREE.Color(0x68D391);
  const hoveredColor = new THREE.Color(0xF6E05E);

  useFrame((state, delta) => {
    // Update piece animations
    const newAnimations = new Map(animations);
    let hasUpdates = false;

    animations.forEach((animation, key) => {
      animation.progress += delta * 4; // Adjust speed here
      if (animation.progress >= 1) {
        newAnimations.delete(key);
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      setAnimations(newAnimations);
    }
  });

  const handleSquareClick = (position: Position) => {
    onSquareClick(position);
  };

  const renderSquare = (x: number, y: number, layer: number) => {
    const isLight = (x + y) % 2 === 0;
    const position: Position = { x, y, layer };
    const piece = gameState.board[layer][y][x];
    const isSelected = selectedPiece?.x === x && selectedPiece?.y === y && selectedPiece?.layer === layer;
    const isHovered = hoveredSquare?.x === x && hoveredSquare?.y === y && hoveredSquare?.layer === layer;

    let color = isLight ? lightSquareColor : darkSquareColor;
    if (isSelected) color = selectedColor;
    else if (isHovered) color = hoveredColor;

    return (
      <mesh
        position={[x - 3.5, layer * 0.2, y - 3.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={() => handleSquareClick(position)}
        onPointerEnter={() => setHoveredSquare(position)}
        onPointerLeave={() => setHoveredSquare(null)}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color={color} />
        {piece && <ChessPiece piece={piece} />}
      </mesh>
    );
  };

  const renderLayer = (layer: number) => {
    const squares = [];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        squares.push(
          <group key={`${layer}-${x}-${y}`}>
            {renderSquare(x, y, layer)}
          </group>
        );
      }
    }
    return squares;
  };

  return (
    <group ref={boardRef}>
      {/* Base board */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[9, 9, 0.2]} />
        <meshStandardMaterial color={0x4A5568} />
      </mesh>

      {/* Render all three layers */}
      <group position={[0, 0, 0]}>
        {renderLayer(0)}
      </group>
      <group position={[0, 0.2, 0]}>
        {renderLayer(1)}
      </group>
      <group position={[0, 0.4, 0]}>
        {renderLayer(2)}
      </group>
    </group>
  );
};

interface ChessPieceProps {
  piece: ChessPiece;
}

const ChessPiece: React.FC<ChessPieceProps> = ({ piece }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Piece geometry based on type
  const getPieceGeometry = (type: string) => {
    switch (type) {
      case 'pawn':
        return <cylinderGeometry args={[0.2, 0.3, 0.5]} />;
      case 'rook':
        return <boxGeometry args={[0.3, 0.5, 0.3]} />;
      case 'knight':
        return <coneGeometry args={[0.25, 0.6, 4]} />;
      case 'bishop':
        return <coneGeometry args={[0.25, 0.7, 32]} />;
      case 'queen':
        return <cylinderGeometry args={[0.3, 0.3, 0.8, 32]} />;
      case 'king':
        return <cylinderGeometry args={[0.3, 0.3, 0.9, 32]} />;
      default:
        return <sphereGeometry args={[0.3]} />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={[0, 0.3, 0]}
      rotation={piece.type === 'knight' ? [0, Math.PI / 4, 0] : [0, 0, 0]}
    >
      {getPieceGeometry(piece.type)}
      <meshStandardMaterial
        color={piece.color === 'white' ? 0xFFFFFF : 0x1A1A1A}
        metalness={0.5}
        roughness={0.2}
      />
    </mesh>
  );
};

export default ChessBoard; 