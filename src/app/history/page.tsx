'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChessEngine } from '@/lib/chess/engine';
import { parseMoveString } from '@/lib/chess/notation';
import { clearHistory, loadHistory, SavedGame } from '@/lib/chess/gameHistory';
import type { ChessPiece } from '@/types/index';

const GLYPHS: Record<string, string> = {
  white_king: '♔', white_queen: '♕', white_rook: '♖', white_bishop: '♗', white_knight: '♘', white_pawn: '♙',
  black_king: '♚', black_queen: '♛', black_rook: '♜', black_bishop: '♝', black_knight: '♞', black_pawn: '♟'
};

/** Rebuild the position after the first `count` moves of a saved game. */
function positionAfter(moves: string[], count: number): { engine: ChessEngine; applied: number } {
  const engine = new ChessEngine();
  let applied = 0;
  for (const text of moves.slice(0, count)) {
    const parsed = parseMoveString(text);
    if (!parsed || !engine.makeMove(parsed.from, parsed.to, parsed.promotion)) break;
    applied++;
  }
  return { engine, applied };
}

function Board({ engine }: { engine: ChessEngine }) {
  const board = engine.getBoard();
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {[0, 1, 2].map(layer => (
        <div key={layer}>
          <p className="text-xs text-bone/60 mb-1 text-center">Layer {layer + 1}</p>
          <div className="grid grid-cols-8 border border-brass/30">
            {Array.from({ length: 8 }, (_, row) => 7 - row).map(y =>
              Array.from({ length: 8 }, (_, x) => {
                const piece: ChessPiece | null = board[layer][y][x];
                const dark = (x + y) % 2 === 1;
                const glyph = piece ? GLYPHS[`${piece.color}_${piece.type}`] : '';
                return (
                  <div
                    key={`${layer}-${x}-${y}`}
                    className={`aspect-square flex items-center justify-center text-lg sm:text-xl ${dark ? 'bg-walnut' : 'bg-bone/15'} ${piece?.color === 'white' ? 'text-bone' : 'text-ink'}`}
                  >
                    {glyph}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HistoryPage() {
  const [games, setGames] = useState<SavedGame[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    setGames(loadHistory());
  }, []);

  const selected = games.find(g => g.id === selectedId) ?? null;

  const replay = useMemo(() => {
    if (!selected) return null;
    return positionAfter(selected.moves, step);
  }, [selected, step]);

  const select = (id: string) => {
    setSelectedId(id);
    setStep(0);
  };

  const handleClear = () => {
    clearHistory();
    setGames([]);
    setSelectedId(null);
  };

  return (
    <main className="min-h-screen bg-ink text-bone px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Game history</h1>
          <Link href="/game?mode=singleplayer&difficulty=beginner" className="bg-brass text-ink font-semibold px-4 py-2 rounded-lg">
            New game
          </Link>
        </div>

        {games.length === 0 ? (
          <div className="rounded-xl border border-brass/20 bg-walnut/60 p-8 text-center">
            <p className="text-lg font-semibold mb-2">No finished games yet</p>
            <p className="text-bone/70">
              Games you finish in this browser appear here. Online games are kept on the server once accounts and the database are set up.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[280px_1fr]">
            <div className="space-y-2">
              {games.map(g => (
                <button
                  key={g.id}
                  onClick={() => select(g.id)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    g.id === selectedId ? 'border-brass bg-brass/15' : 'border-brass/20 bg-walnut/60 hover:border-brass/50'
                  }`}
                >
                  <p className="font-semibold text-sm">{g.result}</p>
                  <p className="text-xs text-bone/60 mt-1">
                    {new Date(g.savedAt).toLocaleString()} · {g.mode === 'computer' ? `vs computer (${g.difficulty ?? 'n/a'})` : 'two players'} · {g.moves.length} moves
                  </p>
                </button>
              ))}
              <button onClick={handleClear} className="text-xs text-bone/60 hover:text-bone underline mt-2">
                Clear history
              </button>
            </div>

            <div>
              {selected && replay ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setStep(0)} className="bg-walnut border border-brass/30 px-3 py-1 rounded">First</button>
                    <button onClick={() => setStep(s => Math.max(0, s - 1))} className="bg-walnut border border-brass/30 px-3 py-1 rounded">Prev</button>
                    <span className="text-sm text-bone/80 px-2">Move {replay.applied} of {selected.moves.length}</span>
                    <button onClick={() => setStep(s => Math.min(selected.moves.length, s + 1))} className="bg-walnut border border-brass/30 px-3 py-1 rounded">Next</button>
                    <button onClick={() => setStep(selected.moves.length)} className="bg-walnut border border-brass/30 px-3 py-1 rounded">Last</button>
                  </div>
                  <Board engine={replay.engine} />
                  <p className="font-mono text-xs text-bone/70 break-words">
                    {selected.moves.map((m, i) => (
                      <span key={i} className={i === replay.applied - 1 ? 'text-brass-light font-bold' : ''}>
                        {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ''}{m}{' '}
                      </span>
                    ))}
                  </p>
                </div>
              ) : (
                <p className="text-bone/60">Choose a game to replay it.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
