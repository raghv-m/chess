export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';

export interface Position {
  x: number;
  y: number;
  layer: number;
}

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  position: Position;
  hasMoved?: boolean;
}

export interface Move {
  from: Position;
  to: Position;
  piece: ChessPiece;
  capturedPiece?: ChessPiece;
  isPromotion?: boolean;
  promotionPiece?: PieceType;
  isCastling?: boolean;
  isEnPassant?: boolean;
}

export interface GameState {
  moveHistory: any;
  board: (ChessPiece | null)[][][];
  currentTurn: PieceColor;
  isCheckmate: boolean;
  isStalemate: boolean;
  isCheck: boolean;
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
  capturedPieces: {
    white: ChessPiece[];
    black: ChessPiece[];
  };
}

export interface GameResult {
  winner?: PieceColor;
  reason: 'checkmate' | 'stalemate' | 'resignation' | 'draw' | 'timeout';
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
}

export interface GameOptions {
  difficulty?: 'beginner' | 'intermediate' | 'expert';
  serverUrl?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface GameCallbacks {
  onMove?: (newState: GameState) => void;
  onGameStart?: (opponent: { id: string; username: string }) => void;
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