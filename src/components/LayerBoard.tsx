'use client';

import React from 'react';
import type { ChessPiece, Position } from '@/types';
import type { LayerIndex } from '@/types/index';

const GLYPHS: Record<string, string> = {
  white_king: '♔', white_queen: '♕', white_rook: '♖', white_bishop: '♗', white_knight: '♘', white_pawn: '♙',
  black_king: '♚', black_queen: '♛', black_rook: '♜', black_bishop: '♝', black_knight: '♞', black_pawn: '♟'
};
const FILES = 'abcdefgh';

interface LayerBoardProps {
  board: (ChessPiece | null)[][][];
  selected: Position | null;
  targets: Position[];
  onSquareClick: (position: Position) => void;
  disabled?: boolean;
}

/**
 * Flat, clickable view of all three layers. Every square is a real button, so
 * play works with a mouse, keyboard and screen readers, independent of the 3D scene.
 */
export default function LayerBoard({ board, selected, targets, onSquareClick, disabled }: LayerBoardProps) {
  const isTarget = (layer: number, x: number, y: number) =>
    targets.some(t => t.layer === layer && t.x === x && t.y === y);
  const isSelected = (layer: number, x: number, y: number) =>
    selected?.layer === layer && selected?.x === x && selected?.y === y;

  return (
    <div className="grid gap-3 sm:grid-cols-3 w-full max-w-3xl">
      {[0, 1, 2].map(layer => (
        <div key={layer}>
          <p className="text-[11px] text-bone/60 mb-1 text-center">Layer {layer + 1}</p>
          <div className="grid grid-cols-8 border border-brass/30">
            {Array.from({ length: 8 }, (_, row) => 7 - row).map(y =>
              Array.from({ length: 8 }, (_, x) => {
                const piece = board[layer][y][x];
                const dark = (x + y) % 2 === 1;
                const label = `${FILES[x]}${y + 1} layer ${layer + 1}${piece ? `, ${piece.color} ${piece.type}` : ''}`;
                const glyph = piece ? GLYPHS[`${piece.color}_${piece.type}`] : '';
                const ring = isSelected(layer, x, y)
                  ? 'ring-2 ring-inset ring-brass-light'
                  : isTarget(layer, x, y)
                    ? 'ring-2 ring-inset ring-brass/70'
                    : '';
                return (
                  <button
                    key={`${layer}-${x}-${y}`}
                    type="button"
                    data-testid={`sq-${layer}-${x}-${y}`}
                    aria-label={label}
                    disabled={disabled}
                    onClick={() => onSquareClick({ x, y, layer: layer as LayerIndex })}
                    className={`relative aspect-square flex items-center justify-center text-base sm:text-lg leading-none disabled:cursor-not-allowed ${
                      dark ? 'bg-walnut' : 'bg-bone/20'
                    } ${ring}`}
                    style={piece ? { textShadow: piece.color === 'white' ? '0 0 2px #15120F' : '0 0 2px #EDE4D0' } : undefined}
                  >
                    <span className={piece?.color === 'white' ? 'text-white' : 'text-[#120e0b]'}>{glyph}</span>
                    {isTarget(layer, x, y) && !piece && (
                      <span className="absolute w-2 h-2 rounded-full bg-brass/80" aria-hidden="true" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
