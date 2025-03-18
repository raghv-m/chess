'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { GameState, Position } from '@/types';
import { PieceGeometry } from './PieceGeometry';

interface ChessBoardProps {
  gameState: GameState;
  selectedSquare?: Position;
  onSquareClick: (position: Position) => void;
}

export function ChessBoard({ gameState, selectedSquare, onSquareClick }: ChessBoardProps) {
  const boardRef = useRef();
  const SQUARE_SIZE = 1;
  const BOARD_SIZE = 8;

  // Generate board squares
  const squares = useMemo(() => {
    const result = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const isLight = (x + y) % 2 === 0;
        const isSelected = selectedSquare?.x === x && selectedSquare?.y === y;
        
        result.push({
          position: [
            x * SQUARE_SIZE - (BOARD_SIZE * SQUARE_SIZE) / 2,
            0,
            y * SQUARE_SIZE - (BOARD_SIZE * SQUARE_SIZE) / 2
          ],
          color: isLight ? '#f0d9b5' : '#b58863',
          selected: isSelected,
          coords: { x, y, layer: 0 }
        });
      }
    }
    return result;
  }, [selectedSquare]);

  // Generate pieces
  const pieces = useMemo(() => {
    const result = [];
    const board = gameState.board[0]; // Use only the first layer
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const piece = board[y][x];
        if (piece) {
          result.push({
            piece,
            position: [
              x * SQUARE_SIZE - (BOARD_SIZE * SQUARE_SIZE) / 2,
              0.5, // Lift pieces slightly above board
              y * SQUARE_SIZE - (BOARD_SIZE * SQUARE_SIZE) / 2
            ],
            coords: { x, y, layer: 0 }
          });
        }
      }
    }
    return result;
  }, [gameState.board]);

  // Board animation
  useFrame((state) => {
    if (boardRef.current) {
      boardRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={boardRef}>
      {/* Board squares */}
      {squares.map((square, i) => (
        <mesh
          key={i}
          position={square.position}
          onClick={() => onSquareClick(square.coords)}
          receiveShadow
        >
          <boxGeometry args={[SQUARE_SIZE, 0.1, SQUARE_SIZE]} />
          <meshStandardMaterial 
            color={square.color}
            emissive={square.selected ? '#2196f3' : '#000000'}
            emissiveIntensity={square.selected ? 0.5 : 0}
          />
        </mesh>
      ))}

      {/* Chess pieces */}
      {pieces.map((piece, i) => (
        <group key={i} position={piece.position}>
          <PieceGeometry
            type={piece.piece.type}
            color={piece.piece.color}
            onClick={() => onSquareClick(piece.coords)}
          />
        </group>
      ))}

      {/* Coordinate labels */}
      {squares
        .filter(square => square.coords.y === 0)
        .map((square, i) => (
          <group key={`label-${i}`}>
            {/* File labels (a-h) */}
            <Text
              position={[
                square.position[0],
                -0.1,
                square.position[2] - SQUARE_SIZE / 2 - 0.3
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.3}
              color="#000000"
            >
              {String.fromCharCode(97 + square.coords.x)}
            </Text>
            {/* Rank labels (1-8) */}
            {square.coords.x === 0 && (
              <Text
                position={[
                  square.position[0] - SQUARE_SIZE / 2 - 0.3,
                  -0.1,
                  square.position[2]
                ]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.3}
                color="#000000"
              >
                {8 - square.coords.y}
              </Text>
            )}
          </group>
        ))}
    </group>
  );
} 