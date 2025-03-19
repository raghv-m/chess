import { GameState, GameResult, Move, Position, GameOptions, GameCallbacks } from '@/types';
import { GameModeManager } from './GameModeManager';

interface Puzzle {
  id: string;
  title: string;
  description: string;
  rating: number;
  initialState: GameState;
  solution: Move[];
  hint?: string;
}

export class PuzzleManager extends GameModeManager {
  private currentPuzzle: Puzzle | null = null;
  private moveIndex: number = 0;
  private puzzles: Puzzle[] = [
    {
      id: 'mate-in-one',
      title: 'Mate in One',
      description: 'Find the checkmate in one move',
      rating: 1200,
      initialState: {
        ...this.createInitialGameState(),
        board: this.createCustomBoard([
          { type: 'king', color: 'white', position: { layer: 1, x: 4, y: 0 } },
          { type: 'queen', color: 'white', position: { layer: 1, x: 3, y: 6 } },
          { type: 'king', color: 'black', position: { layer: 1, x: 4, y: 7 } }
        ])
      },
      solution: [
        {
          from: { layer: 1, x: 3, y: 6 },
          to: { layer: 1, x: 4, y: 6 },
          piece: { type: 'queen', color: 'white', position: { layer: 1, x: 3, y: 6 }, hasMoved: false, id: 'wq1' }
        }
      ],
      hint: 'Look for a queen move that controls the black king\'s escape squares'
    }
  ];

  private createCustomBoard(pieces: any[]): (any | null)[][][] {
    const board = Array(3).fill(null).map(() =>
      Array(8).fill(null).map(() =>
        Array(8).fill(null)
      )
    );

    pieces.forEach(piece => {
      const { position } = piece;
      board[position.layer][position.y][position.x] = {
        ...piece,
        hasMoved: false,
        id: `${piece.color[0]}${piece.type[0]}1`
      };
    });

    return board;
  }

  async initializeGameMode(mode: string, options?: GameOptions): Promise<void> {
    super.initializeGameMode(mode, options);
    this.currentPuzzle = this.puzzles[0];
    this.moveIndex = 0;
    if (this.currentPuzzle) {
      this.gameState = this.currentPuzzle.initialState;
      this.callbacks?.onMove?.(this.gameState);
    }
  }

  async makeMove(from: Position, to: Position): Promise<boolean> {
    if (!this.currentPuzzle || this.moveIndex >= this.currentPuzzle.solution.length) {
      return false;
    }

    const expectedMove = this.currentPuzzle.solution[this.moveIndex];
    const isCorrectMove = 
      expectedMove.from.x === from.x && 
      expectedMove.from.y === from.y && 
      expectedMove.from.layer === from.layer &&
      expectedMove.to.x === to.x && 
      expectedMove.to.y === to.y && 
      expectedMove.to.layer === to.layer;

    if (!isCorrectMove) {
      this.callbacks?.onError?.(new Error('Incorrect move. Try again!'));
      return false;
    }

    const moveSuccess = await super.makeMove(from, to);
    if (moveSuccess) {
      this.moveIndex++;
      if (this.moveIndex >= this.currentPuzzle.solution.length) {
        this.callbacks?.onGameEnd?.({
          winner: 'white',
          reason: 'puzzle_complete'
        });
      }
    }

    return moveSuccess;
  }

  getHint(): string | undefined {
    return this.currentPuzzle?.hint;
  }

  getCurrentPuzzle(): Puzzle | null {
    return this.currentPuzzle;
  }
} 