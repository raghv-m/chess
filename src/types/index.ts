export type LayerIndex = 0 | 1 | 2;
export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';

export interface Position {
  layer: LayerIndex;
  x: number;
  y: number;
}

export interface ChessPieceInit {
  type: PieceType;
  color: PieceColor;
  position: Position;
  hasMoved: boolean;
}

export interface ChessPiece {
  id: string;
  type: PieceType;
  color: PieceColor;
  position: Position;
  hasMoved: boolean;
}

export interface Player {
  id: string;
  name: string;
}

export interface Move {
  from: Position;
  to: Position;
  piece: ChessPiece;
  captured?: ChessPiece;
}

export interface PiecesCollection {
  white: ChessPiece[];
  black: ChessPiece[];
}

export interface GameState {
  board: (ChessPiece | null)[][][];
  currentTurn: PieceColor;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  capturedPieces: {
    white: ChessPiece[];
    black: ChessPiece[];
  };
  moveHistory: Move[];
  moves: Move[];
  pieces: {
    white: ChessPiece[];
    black: ChessPiece[];
    find: (predicate: (piece: ChessPiece) => boolean) => ChessPiece | undefined;
    filter: (predicate: (piece: ChessPiece) => boolean) => ChessPiece[];
    some: (predicate: (piece: ChessPiece) => boolean) => boolean;
    flatMap: <T>(callback: (piece: ChessPiece) => T[]) => T[];
    push: (piece: ChessPiece) => void;
  };
}

export interface GameResult {
  winner: PieceColor | undefined;
  reason: 'checkmate' | 'stalemate' | 'resignation' | 'timeout';
}

export interface GameSettings {
  boardTheme: 'classic' | 'modern' | 'wooden';
  pieceStyle: 'classic' | '3d' | 'minimalist';
  soundEnabled: boolean;
  showHints: boolean;
  showCoordinates: boolean;
  autoQueen: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  userId?: string;
  username?: string;
  message?: string;
}

export type BoardLayer = (ChessPiece | null)[][];

export interface MultiLayerBoard {
  layers: BoardLayer[];
  activeLayer: LayerIndex;
}

export interface User {
  id: string;
  username: string;
  email: string;
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
  difficulty?: string;
}

export interface GameCallbacks {
  onMove?: (state: GameState) => void;
  onGameEnd?: (result: GameResult) => void;
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