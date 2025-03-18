export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';
export type LayerIndex = 0 | 1 | 2 | number;

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  position: Position;
  hasMoved?: boolean;
  id: string;
}

export interface Move {
  from: Position;
  to: Position;
  piece: ChessPiece;
  capturedPiece?: ChessPiece;
  isPromotion?: boolean;
  promotedTo?: PieceType;
  isCheck?: boolean;
  isCheckmate?: boolean;
  isCastling?: boolean;
  isEnPassant?: boolean;
  isLayerMove?: boolean;
  captured?: ChessPiece;
}

export interface PiecesCollection {
  white: ChessPiece[];
  black: ChessPiece[];
  find: (predicate: (p: ChessPiece) => boolean) => ChessPiece | undefined;
  filter: (predicate: (p: ChessPiece) => boolean) => ChessPiece[];
  some: (predicate: (p: ChessPiece) => boolean) => boolean;
  flatMap: <T>(callback: (p: ChessPiece) => T[]) => T[];
  push: (piece: ChessPiece) => void;
}

export interface GameState {
  board: (ChessPiece | null)[][][];
  currentTurn: PieceColor;
  isCheckmate: boolean;
  isStalemate: boolean;
  isCheck: boolean;
  moves: Move[];
  lastMove?: Move;
  pieces: PiecesCollection;
  capturedPieces: {
    white: ChessPiece[];
    black: ChessPiece[];
  };
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
}

export interface GameResult {
  winner?: PieceColor;
  reason: 'checkmate' | 'stalemate' | 'resignation' | 'timeout' | 'draw';
  finalPosition: GameState;
  moves: Move[];
  timestamp: number;
  whitePlayer: string;
  blackPlayer: string;
  timeControl?: string;
}

export type BoardLayer = (ChessPiece | null)[][];

export interface MultiLayerBoard {
  layers: BoardLayer[];
  activeLayer: LayerIndex;
} 