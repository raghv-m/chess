// export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
// export type PieceColor = 'white' | 'black';
// export type LayerIndex = 0 | 1 | 2 | number;

import { GameResult } from "@/types";

// export interface Position {
//   layer: any;
//   x: number;
//   y: number;
//   z: number;
// }

// export interface ChessPiece {
//   type: PieceType;
//   color: PieceColor;
//   position: Position;
//   hasMoved?: boolean;
//   id: string;
  
  
// }

// export interface Move {
//   from: Position;
//   to: Position;
//   piece: ChessPiece;
//   capturedPiece?: ChessPiece;
//   isPromotion?: boolean;
//   promotedTo?: PieceType;
//   isCheck?: boolean;
//   isCheckmate?: boolean;
//   isCastling?: boolean;
//   isEnPassant?: boolean;
//   isLayerMove?: boolean;
//   captured?: ChessPiece;
// }

// export interface PiecesCollection {

//   white: ChessPiece[];
//   black: ChessPiece[];
//   find: (predicate: (p: ChessPiece) => boolean) => ChessPiece | undefined;
//   filter: (predicate: (p: ChessPiece) => boolean) => ChessPiece[];
//   some: (predicate: (p: ChessPiece) => boolean) => boolean;
//   flatMap: <T>(callback: (p: ChessPiece) => T[]) => T[];
//   push: (piece: ChessPiece) => void;
// }

// export interface GameState {
//   board: (ChessPiece | null)[][][];
//   currentTurn: PieceColor;
//   isCheckmate: boolean;
//   isStalemate: boolean;
//   isCheck: boolean;
//   moves: Move[];
//   lastMove?: Move;
//   pieces: PiecesCollection;
//   capturedPieces: {
//     white: ChessPiece[];
//     black: ChessPiece[];
//   };
// }

// export interface GameSettings {
//   boardTheme: 'classic' | 'modern' | 'wooden';
//   pieceStyle: 'classic' | '3d' | 'minimalist';
//   soundEnabled: boolean;
//   showHints: boolean;
//   showCoordinates: boolean;
//   autoQueen: boolean;
// }

// export interface ChatMessage {
//   id: string;
//   sender: string;
//   content: string;
//   timestamp: number;
//   userId?: string;
//   username?: string;
//   message?: string;
// }

// export interface GameResult {
//   winner?: PieceColor;
//   reason: 'checkmate' | 'stalemate' | 'resignation' | 'timeout' | 'draw';
//   finalPosition: GameState;
//   moves: Move[];
//   timestamp: number;
//   whitePlayer: string;
//   blackPlayer: string;
//   timeControl?: string;
// }

// export type BoardLayer = (ChessPiece | null)[][];

// export interface MultiLayerBoard {
//   layers: BoardLayer[];
//   activeLayer: LayerIndex;
// }

export type PieceColor = 'white' | 'black';
export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';

export interface Position {
  x: number;
  y: number;
  layer: number;
}

export interface ChessPiece {
  id: string;
  type: PieceType;
  color: PieceColor;
  position: Position;
  hasMoved: boolean;
}

export interface Move {
  from: Position;
  to: Position;
  piece: ChessPiece;
  capturedPiece?: ChessPiece;
  isCheck?: boolean;
  isCheckmate?: boolean;
  isCastling?: boolean;
  isEnPassant?: boolean;
}

export interface GameState {
  board: (ChessPiece | null)[][][];
  currentTurn: PieceColor;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  moves: Move[];
  pieces: ChessPiece[];
  capturedPieces: {
    white: ChessPiece[];
    black: ChessPiece[];
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  sender: string;
  content: string;
}

export interface DatabaseService {
  getUserStats(userId: string): Promise<{
    rating: number;
    wins: number;
    losses: number;
    draws: number;
    gamesPlayed: number;
    winStreak: number;
  }>;
  updateUserStats(userId: string, stats: {
    rating: number;
    wins: number;
    losses: number;
    draws: number;
    gamesPlayed: number;
    winStreak: number;
  }): Promise<void>;
  getTopPlayers(limit: number): Promise<Array<{
    username: string;
    rating: number;
    wins: number;
    losses: number;
    draws: number;
    winStreak: number;
  }>>;
  getMatchHistory(userId: string): Promise<Array<{
    opponent: string;
    result: 'win' | 'loss' | 'draw';
    date: Date;
  }>>;
  updateMatchResult(userId: string, opponentId: string, result: 'win' | 'loss' | 'draw'): Promise<void>;
}

export interface GameOptions {
  difficulty?: 'beginner' | 'intermediate' | 'expert';
  roomId?: string;
}

export interface GameCallbacks {
  onMove?: (state: GameState) => void;
  onGameEnd?: () => void;
  onError?: (error: Error) => void;
}

export interface PieceEvaluation {
  material: number;
  position: number;
  mobility: number;
  protection: number;
  threats: number;
}

export interface PositionEvaluation {
  material: number;
  position: number;
  mobility: number;
  kingSafety: number;
  centerControl: number;
  total: number;
} 