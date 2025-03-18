'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GameState, ChatMessage, Position } from '@/types';
import { GameModeManager } from '@/lib/game/GameModeManager';

interface ChessGameProps {
  mode: 'local' | 'ai' | 'multiplayer';
  difficulty?: 'beginner' | 'intermediate' | 'expert';
  initialGameState: GameState;
  onChatMessage?: (message: ChatMessage) => void;
}

export default function ChessGame({
  mode,
  difficulty = 'beginner',
  initialGameState,
  onChatMessage
}: ChessGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameManager, setGameManager] = useState<GameModeManager>();
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);

  // Three.js setup
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 10);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Chessboard setup
    const boardGeometry = new THREE.BoxGeometry(8, 0.2, 8);
    const boardMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.position.set(0, -0.1, 0);
    scene.add(board);

    // Create squares
    for (let x = 0; x < 8; x++) {
      for (let z = 0; z < 8; z++) {
        const squareGeometry = new THREE.BoxGeometry(1, 0.1, 1);
        const color = (x + z) % 2 === 0 ? 0xffffff : 0x000000;
        const squareMaterial = new THREE.MeshStandardMaterial({ color });
        const square = new THREE.Mesh(squareGeometry, squareMaterial);
        square.position.set(x - 3.5, 0, z - 3.5);
        scene.add(square);
      }
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Game logic setup
  useEffect(() => {
    const manager = new GameModeManager();
    manager.initializeGameMode(mode, {
      difficulty,
      serverUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
    });

    manager.setCallbacks({
      onMove: (newState) => {
        setGameState(newState);
      },
      onGameEnd: (result) => {
        if (onChatMessage) {
          onChatMessage({
            id: Date.now().toString(),
            userId: 'system',
            username: 'System',
            message: `Game Over! ${result.winner ? `${result.winner} wins` : 'Draw'} by ${result.reason}`,
            timestamp: Date.now()
          });
        }
      },
      onError: (error) => {
        console.error('Game error:', error);
        if (onChatMessage) {
          onChatMessage({
            id: Date.now().toString(),
            userId: 'system',
            username: 'System',
            message: `Error: ${error.message}`,
            timestamp: Date.now()
          });
        }
      }
    });

    setGameManager(manager);

    return () => {
      manager.cleanup();
    };
  }, [mode, difficulty, onChatMessage]);

  const handleSquareClick = (position: Position) => {
    if (!gameManager) return;

    if (selectedPiece) {
      gameManager.makeMove(selectedPiece, position);
      setSelectedPiece(null);
    } else {
      const piece = gameState.board[position.layer][position.y][position.x];
      if (piece && piece.color === gameState.currentTurn) {
        setSelectedPiece(position);
      }
    }
  };

  return (
    <div className="w-full h-full" ref={containerRef}>
      {/* Game UI overlays can be added here */}
    </div>
  );
} 