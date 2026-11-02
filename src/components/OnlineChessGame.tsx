'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import ChessBoard from './ChessBoard';
import LoadingSpinner from './LoadingSpinner';
import { ChessEngine, type EngineSnapshot } from '@/lib/chess/engine';
import { GameState as EngineGameState, type Position } from '@/types/index';
import type { GameState as BoardGameState } from '@/types';
import type { PublicGameState } from '@/lib/server/gameService';
import { getBrowserClient } from '@/lib/supabase/client';

/**
 * OnlineChessGame — the /game/<code> screen.
 *
 * The server is the only authority: this component renders the snapshot
 * it is given, collects clicks, and POSTs intended moves to the API.
 * A local ChessEngine hydrated from the same snapshot is used ONLY for
 * click feedback (which of my pieces can move, and where) — if it ever
 * disagreed with the server, the server wins and we refetch.
 *
 * Sync: Supabase Realtime on the `games` row is a doorbell ("something
 * changed — refetch"), backed by a 2.5s poll so the game still works if
 * Realtime is unavailable. Seat identity is the token in localStorage.
 */

const tokenKey = (code: string) => `chess:token:${code}`;

function readToken(code: string): string | null {
  try {
    return localStorage.getItem(tokenKey(code));
  } catch {
    return null;
  }
}

function writeToken(code: string, token: string): void {
  try {
    localStorage.setItem(tokenKey(code), token);
  } catch {
    // Storage unavailable: this browser stays a spectator for the game.
  }
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function api(
  path: string,
  options: { method?: string; token?: string | null; body?: unknown } = {}
): Promise<Record<string, unknown>> {
  const res = await fetch(path, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { 'x-player-token': options.token } : {})
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: 'no-store'
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new ApiError(res.status, typeof json.error === 'string' ? json.error : `Request failed (${res.status})`);
  }
  return json;
}

const FILES = 'abcdefgh';

function squareName(pos: Position): string {
  return `L${pos.layer} ${FILES[pos.x]}${pos.y + 1}`;
}

function sameSquare(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y && a.layer === b.layer;
}

function otherColor(color: 'white' | 'black'): 'white' | 'black' {
  return color === 'white' ? 'black' : 'white';
}

/** Adapt an engine snapshot to the prop shape the 3D board expects. */
function buildBoardState(snapshot: EngineSnapshot): BoardGameState {
  const white: PublicGameState['snapshot']['board'][number][number][number][] = [];
  const black: typeof white = [];
  snapshot.board.forEach((layer) =>
    layer.forEach((row) =>
      row.forEach((piece) => {
        if (piece) (piece.color === 'white' ? white : black).push(piece);
      })
    )
  );
  const all = [...white, ...black];
  type AnyPiece = (typeof all)[number];

  return {
    board: snapshot.board,
    currentTurn: snapshot.currentPlayer,
    isCheck: snapshot.gameState === EngineGameState.IN_CHECK,
    isCheckmate:
      snapshot.gameState === EngineGameState.WHITE_WINS ||
      snapshot.gameState === EngineGameState.BLACK_WINS,
    isStalemate: snapshot.gameState === EngineGameState.STALEMATE,
    capturedPieces: {
      white: snapshot.capturedPieces.filter((p) => p.color === 'white'),
      black: snapshot.capturedPieces.filter((p) => p.color === 'black')
    },
    moveHistory: snapshot.moveHistory,
    moves: snapshot.moveHistory,
    pieces: {
      white,
      black,
      find: (predicate: (piece: AnyPiece) => boolean) => all.find(predicate),
      filter: (predicate: (piece: AnyPiece) => boolean) => all.filter(predicate),
      some: (predicate: (piece: AnyPiece) => boolean) => all.some(predicate),
      flatMap: <T,>(callback: (piece: AnyPiece) => T[]) => all.flatMap(callback),
      push: () => {}
    }
  } as unknown as BoardGameState;
}

const END_REASON_TEXT: Record<string, string> = {
  checkmate: 'checkmate',
  resignation: 'resignation',
  draw_agreement: 'draw by agreement',
  stalemate: 'stalemate',
  insufficient_material: 'insufficient material',
  abandoned: 'game abandoned'
};

function resultText(data: PublicGameState): string {
  const reason = END_REASON_TEXT[data.endReason ?? ''] ?? 'game over';
  if (data.winner === 'draw') return `Draw — ${reason}`;
  if (!data.winner) return `Game over — ${reason}`;
  return `${data.winner === 'white' ? 'White' : 'Black'} wins — ${reason}`;
}

interface OnlineChessGameProps {
  code: string;
}

const OnlineChessGame: React.FC<OnlineChessGameProps> = ({ code }) => {
  const router = useRouter();
  const [data, setData] = useState<PublicGameState | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const [selected, setSelected] = useState<Position | null>(null);
  const [promotionPending, setPromotionPending] = useState<{ from: Position; to: Position } | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmResign, setConfirmResign] = useState(false);
  const [opponentOnline, setOpponentOnline] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
    const stored = readToken(code);
    tokenRef.current = stored;
    setToken(stored);
  }, [code]);

  const shareUrl = origin ? `${origin}/game/${code}` : '';

  const refetch = useCallback(async () => {
    try {
      const state = (await api(`/api/games/${code}`, {
        token: tokenRef.current
      })) as unknown as PublicGameState;
      setData((prev) => (prev && prev.updatedAt === state.updatedAt ? prev : state));
      setNotFound(false);
      setLoadError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
      } else {
        setLoadError((prev) => prev ?? 'Could not reach the game server. Retrying…');
      }
    }
  }, [code]);

  // Initial load + polling fallback (the Realtime doorbell below covers
  // the fast path; this poll guarantees progress even without it).
  useEffect(() => {
    void refetch();
    const id = setInterval(() => {
      void refetch();
    }, 2500);
    return () => clearInterval(id);
  }, [refetch]);

  const yourSeat = data?.yourSeat ?? null;
  const hasData = data !== null;

  // Realtime doorbell + presence (cosmetic). Refetch on any row UPDATE.
  useEffect(() => {
    const client = getBrowserClient();
    if (!client || !hasData) return;

    const seatKey = yourSeat ?? 'viewer';
    const channel = client.channel(`game:${code}`, {
      config: { presence: { key: seatKey } }
    });

    channel
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'games', filter: `code=eq.${code}` },
        () => {
          void refetch();
        }
      )
      .on('presence', { event: 'sync' }, () => {
        if (!yourSeat) {
          setOpponentOnline(null);
          return;
        }
        const presence = channel.presenceState();
        setOpponentOnline(Boolean(presence[otherColor(yourSeat)]?.length));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ seat: seatKey, online_at: new Date().toISOString() });
        }
      });

    return () => {
      void client.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, yourSeat, refetch, hasData]);

  const localEngine = useMemo(() => {
    if (!data) return null;
    try {
      return ChessEngine.fromSnapshot(data.snapshot);
    } catch {
      return null;
    }
  }, [data]);

  const boardState = useMemo(
    () => (data ? buildBoardState(data.snapshot) : null),
    [data]
  );

  const myTurn =
    data?.status === 'active' &&
    yourSeat !== null &&
    data.snapshot.currentPlayer === yourSeat;

  const validTargets = useMemo(() => {
    if (!localEngine || !selected || !myTurn) return [];
    return localEngine.getValidMoves(selected);
  }, [localEngine, selected, myTurn]);

  // Clear selection whenever the position changes under us.
  useEffect(() => {
    setSelected(null);
    setPromotionPending(null);
    setConfirmResign(false);
  }, [data?.updatedAt]);

  const errorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashError = useCallback((message: string) => {
    setErrorMsg(message);
    if (errorTimeout.current) clearTimeout(errorTimeout.current);
    errorTimeout.current = setTimeout(() => setErrorMsg(null), 4000);
  }, []);

  const doMove = async (from: Position, to: Position, promotion?: string) => {
    setBusy(true);
    try {
      const resp = await api(`/api/games/${code}/move`, {
        method: 'POST',
        token,
        body: { from, to, ...(promotion ? { promotion } : {}) }
      });
      setData(resp.state as unknown as PublicGameState);
      setSelected(null);
      setPromotionPending(null);
    } catch (err) {
      flashError(err instanceof Error ? err.message : 'That move was rejected.');
      void refetch();
    } finally {
      setBusy(false);
    }
  };

  const handleSquareClick = (boardPos: { x: number; y: number; layer: number }) => {
    if (!data || busy || promotionPending) return;
    const pos: Position = {
      x: boardPos.x,
      y: boardPos.y,
      layer: boardPos.layer as Position['layer']
    };
    if (!yourSeat || !myTurn) return;

    const piece = data.snapshot.board[pos.layer][pos.y][pos.x];

    if (selected) {
      if (sameSquare(selected, pos)) {
        setSelected(null);
        return;
      }
      if (validTargets.some((target) => sameSquare(target, pos))) {
        const moving = data.snapshot.board[selected.layer][selected.y][selected.x];
        const isPromotion =
          moving?.type === 'pawn' &&
          ((moving.color === 'white' && pos.y === 7) ||
            (moving.color === 'black' && pos.y === 0));
        if (isPromotion) {
          setPromotionPending({ from: selected, to: pos });
          return;
        }
        void doMove(selected, pos);
        return;
      }
    }

    if (piece && piece.color === yourSeat) {
      setSelected(pos);
    } else {
      setSelected(null);
    }
  };

  const handleJoin = async () => {
    setBusy(true);
    try {
      const resp = await api(`/api/games/${code}/join`, { method: 'POST', token });
      const newToken = typeof resp.token === 'string' ? resp.token : null;
      if (newToken) {
        writeToken(code, newToken);
        tokenRef.current = newToken;
        setToken(newToken);
      }
      setData(resp.state as unknown as PublicGameState);
    } catch (err) {
      flashError(err instanceof Error ? err.message : 'Could not join the game.');
      void refetch();
    } finally {
      setBusy(false);
    }
  };

  const handleResign = async () => {
    setBusy(true);
    try {
      const resp = await api(`/api/games/${code}/resign`, { method: 'POST', token });
      setData(resp.state as unknown as PublicGameState);
      setConfirmResign(false);
    } catch (err) {
      flashError(err instanceof Error ? err.message : 'Resign failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleDraw = async (action: 'offer' | 'accept' | 'decline' | 'withdraw') => {
    setBusy(true);
    try {
      const resp = await api(`/api/games/${code}/draw`, {
        method: 'POST',
        token,
        body: { action }
      });
      setData(resp.state as unknown as PublicGameState);
    } catch (err) {
      flashError(err instanceof Error ? err.message : 'Draw action failed.');
      void refetch();
    } finally {
      setBusy(false);
    }
  };

  const followRematch = (newCode: string) => {
    if (token) writeToken(newCode, token);
    router.push(`/game/${newCode}`);
  };

  const handleRematch = async () => {
    if (!data) return;
    if (data.rematchCode) {
      followRematch(data.rematchCode);
      return;
    }
    setBusy(true);
    try {
      const resp = await api(`/api/games/${code}/rematch`, { method: 'POST', token });
      const newCode = resp.code as string;
      const state = resp.state as unknown as PublicGameState;
      if (token) writeToken(newCode, token);
      if (state.code === newCode) setData(state);
      router.push(`/game/${newCode}`);
    } catch (err) {
      flashError(err instanceof Error ? err.message : 'Rematch failed.');
      void refetch();
      setBusy(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      flashError('Copy failed — select the link text and copy it manually.');
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-white text-center bg-white/5 border border-white/10 rounded-xl p-10 max-w-md">
          <h2 className="text-3xl font-bold mb-3">Game not found</h2>
          <p className="text-gray-400 mb-6">
            No game exists with the code <span className="font-mono text-white">{code}</span>.
            Check the link, or start a new game instead.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  if (!data || !boardState) {
    if (loadError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="text-white text-center">
            <h2 className="text-2xl font-bold mb-3">Connecting…</h2>
            <p className="text-red-400">{loadError}</p>
          </div>
        </div>
      );
    }
    return <LoadingSpinner />;
  }

  const current = data.snapshot.currentPlayer;
  const inCheck = data.snapshot.gameState === EngineGameState.IN_CHECK;
  const drawOfferedByOpponent =
    data.drawOfferBy !== null && yourSeat !== null && data.drawOfferBy !== yourSeat;
  const drawOfferedByMe = data.drawOfferBy !== null && data.drawOfferBy === yourSeat;

  const statusLine =
    data.status === 'waiting'
      ? yourSeat === 'white'
        ? 'Waiting for your opponent — share the link below.'
        : 'Waiting for a second player to join.'
      : data.status === 'finished'
        ? resultText(data)
        : myTurn
          ? `Your move${inCheck ? ' — your king is in check!' : ''}`
          : yourSeat
            ? `Opponent's move${inCheck ? ' — opponent is in check' : ''}`
            : `${current === 'white' ? 'White' : 'Black'} to move${inCheck ? ' — in check' : ''}`;

  const capturedByWhite = data.snapshot.capturedPieces.filter((p) => p.color === 'black');
  const capturedByBlack = data.snapshot.capturedPieces.filter((p) => p.color === 'white');

  const renderCaptured = (pieces: typeof capturedByWhite) => (
    <div className="flex flex-wrap gap-1">
      {pieces.length === 0 && <span className="text-xs text-gray-500">none</span>}
      {pieces.map((piece, index) => (
        <div
          key={`${piece.id}-${index}`}
          className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${
            piece.color === 'white' ? 'bg-white text-black' : 'bg-gray-800 text-white border border-white/30'
          }`}
        >
          {piece.type.charAt(0).toUpperCase()}
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative h-screen">
      {/* Info panel */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm p-4 rounded-lg text-white z-10 max-w-xs">
        <h2 className="text-xl font-bold mb-1">Online Game</h2>
        <p className="text-sm text-gray-300 mb-2">
          Room <span className="font-mono tracking-widest text-white">{code}</span>
        </p>
        <p className="text-sm mb-2">
          {yourSeat
            ? `You are playing ${yourSeat === 'white' ? 'White' : 'Black'}`
            : 'You are watching this game'}
          {yourSeat && opponentOnline !== null && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs text-gray-300">
              <span
                className={`w-2 h-2 rounded-full ${opponentOnline ? 'bg-green-400' : 'bg-gray-500'}`}
              />
              opponent {opponentOnline ? 'online' : 'offline'}
            </span>
          )}
        </p>
        <p className="text-sm font-semibold">{statusLine}</p>
        {data.status === 'active' && (
          <p className="text-xs text-gray-400 mt-1">
            Turn: {current === 'white' ? 'White' : 'Black'}
          </p>
        )}
      </div>

      {/* Controls */}
      {yourSeat && data.status !== 'finished' && (
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm p-4 rounded-lg text-white z-10">
          <div className="flex flex-wrap gap-2 justify-end">
            {data.status === 'active' && !data.drawOfferBy && (
              <button
                onClick={() => void handleDraw('offer')}
                disabled={busy}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 px-3 py-1 rounded text-sm transition-colors"
              >
                Offer draw
              </button>
            )}
            {drawOfferedByMe && (
              <button
                onClick={() => void handleDraw('withdraw')}
                disabled={busy}
                className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 px-3 py-1 rounded text-sm transition-colors"
              >
                Withdraw draw offer
              </button>
            )}
            {confirmResign ? (
              <>
                <button
                  onClick={() => void handleResign()}
                  disabled={busy}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-3 py-1 rounded text-sm transition-colors"
                >
                  Confirm resign
                </button>
                <button
                  onClick={() => setConfirmResign(false)}
                  className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmResign(true)}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
              >
                Resign
              </button>
            )}
          </div>
          {drawOfferedByMe && (
            <p className="text-xs text-yellow-300 mt-2 text-right">Draw offer sent</p>
          )}
        </div>
      )}

      {/* Incoming draw offer */}
      {drawOfferedByOpponent && data.status === 'active' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500/90 backdrop-blur-sm p-4 rounded-lg text-black z-20 text-center">
          <p className="font-bold mb-2">Your opponent offers a draw</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => void handleDraw('accept')}
              disabled={busy}
              className="bg-black text-white px-4 py-1 rounded text-sm disabled:opacity-50"
            >
              Accept
            </button>
            <button
              onClick={() => void handleDraw('decline')}
              disabled={busy}
              className="bg-white/80 px-4 py-1 rounded text-sm disabled:opacity-50"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Error toast */}
      {errorMsg && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-red-600/90 backdrop-blur-sm px-4 py-2 rounded-lg text-white z-20">
          <p className="font-semibold text-sm">{errorMsg}</p>
        </div>
      )}

      {/* Promotion chooser */}
      {promotionPending && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
          <div className="bg-gray-900 border border-white/15 rounded-xl p-6 text-white text-center">
            <h3 className="text-xl font-bold mb-4">Promote pawn to</h3>
            <div className="flex gap-3">
              {(['queen', 'rook', 'bishop', 'knight'] as const).map((pieceType) => (
                <button
                  key={pieceType}
                  onClick={() =>
                    void doMove(promotionPending.from, promotionPending.to, pieceType)
                  }
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold capitalize transition-colors"
                >
                  {pieceType}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPromotionPending(null)}
              className="mt-4 text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Game over panel */}
      {data.status === 'finished' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm p-5 rounded-lg text-white z-10 text-center min-w-[280px]">
          <p className="text-lg font-bold mb-3">{resultText(data)}</p>
          {yourSeat ? (
            <button
              onClick={() => void handleRematch()}
              disabled={busy}
              className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              {data.rematchCode ? 'Go to rematch' : busy ? 'Creating rematch…' : 'Rematch (swap colours)'}
            </button>
          ) : (
            <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">
              Start your own game
            </Link>
          )}
        </div>
      )}

      {/* 3D board (existing renderer, untouched) */}
      <div className="w-full h-full">
        <Canvas
          camera={{ position: [0, 5, 8], fov: 50 }}
          style={{ background: 'linear-gradient(to bottom, #1a202c, #2d3748)' }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />

          <ChessBoard
            gameState={boardState}
            selectedPiece={selected}
            onSquareClick={handleSquareClick}
          />

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={20}
          />

          <Environment preset="sunset" />
        </Canvas>
      </div>

      {/* Captured pieces */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm p-4 rounded-lg text-white z-10">
        <h3 className="text-sm font-semibold mb-2">Captured</h3>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-gray-300 mb-1">By White</p>
            {renderCaptured(capturedByWhite)}
          </div>
          <div>
            <p className="text-xs text-gray-300 mb-1">By Black</p>
            {renderCaptured(capturedByBlack)}
          </div>
        </div>
      </div>

      {/* Share + join + move list */}
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm p-4 rounded-lg text-white z-10 w-72">
        {data.status === 'waiting' && !yourSeat && !data.seats.black && (
          <button
            onClick={() => void handleJoin()}
            disabled={busy}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-lg font-semibold mb-3 disabled:opacity-50"
          >
            {busy ? 'Joining…' : 'Join as Black'}
          </button>
        )}
        {data.status === 'waiting' && !yourSeat && data.seats.black && (
          <p className="text-sm text-gray-300 mb-3">Both seats are taken — you are spectating.</p>
        )}

        <h3 className="text-sm font-semibold mb-1">Share this game</h3>
        <div className="flex gap-2 mb-3">
          <input
            readOnly
            value={shareUrl}
            onFocus={(event) => event.target.select()}
            className="flex-1 min-w-0 bg-black/40 border border-white/15 rounded px-2 py-1 text-xs font-mono"
          />
          <button
            onClick={() => void handleCopyLink()}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs font-semibold transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <h3 className="text-sm font-semibold mb-1">Moves</h3>
        {data.moves.length === 0 ? (
          <p className="text-xs text-gray-400">No moves yet.</p>
        ) : (
          <ol className="text-xs font-mono space-y-0.5 max-h-40 overflow-y-auto pr-1">
            {data.moves.map((move) => (
              <li key={move.ply} className="flex justify-between gap-2">
                <span className="text-gray-400">{move.ply}.</span>
                <span>
                  {squareName(move.from)} → {squareName(move.to)}
                  {move.promotion ? ` =${move.promotion.charAt(0).toUpperCase()}` : ''}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};

export default OnlineChessGame;
