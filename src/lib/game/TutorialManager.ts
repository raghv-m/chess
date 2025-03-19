import { GameState, GameResult, Move, Position, GameOptions, GameCallbacks } from '@/types';
import { GameModeManager } from './GameModeManager';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  initialState: GameState;
  steps: {
    instruction: string;
    validMoves: { from: Position; to: Position }[];
    feedback?: string;
  }[];
}

export class TutorialManager extends GameModeManager {
  private currentTutorial: Tutorial | null = null;
  private currentStep: number = 0;
  private tutorials: Tutorial[] = [
    {
      id: 'basic-moves',
      title: 'Basic Moves',
      description: 'Learn how each piece moves in chess',
      initialState: this.createInitialGameState(),
      steps: [
        {
          instruction: 'Move a pawn forward two squares',
          validMoves: [
            { from: { layer: 1, x: 4, y: 1 }, to: { layer: 1, x: 4, y: 3 } }
          ],
          feedback: 'Great! Pawns can move two squares forward on their first move.'
        },
        {
          instruction: 'Move the knight to control the center',
          validMoves: [
            { from: { layer: 1, x: 1, y: 0 }, to: { layer: 1, x: 2, y: 2 } },
            { from: { layer: 1, x: 6, y: 0 }, to: { layer: 1, x: 5, y: 2 } }
          ],
          feedback: 'Excellent! Knights move in an L-shape and can jump over other pieces.'
        }
      ]
    }
  ];

  async initializeGameMode(mode: string, options?: GameOptions): Promise<void> {
    super.initializeGameMode(mode, options);
    this.currentTutorial = this.tutorials[0];
    this.currentStep = 0;
    if (this.currentTutorial) {
      this.gameState = this.currentTutorial.initialState;
      this.callbacks?.onMove?.(this.gameState);
    }
  }

  async makeMove(from: Position, to: Position): Promise<boolean> {
    if (!this.currentTutorial || this.currentStep >= this.currentTutorial.steps.length) {
      return false;
    }

    const currentStep = this.currentTutorial.steps[this.currentStep];
    const isValidMove = currentStep.validMoves.some(
      move => 
        move.from.x === from.x && 
        move.from.y === from.y && 
        move.from.layer === from.layer &&
        move.to.x === to.x && 
        move.to.y === to.y && 
        move.to.layer === to.layer
    );

    if (!isValidMove) {
      this.callbacks?.onError?.(new Error('Try again! That\'s not the correct move for this step.'));
      return false;
    }

    const moveSuccess = await super.makeMove(from, to);
    if (moveSuccess) {
      if (currentStep.feedback) {
        console.log(currentStep.feedback);
      }

      this.currentStep++;
      if (this.currentStep >= this.currentTutorial.steps.length) {
        this.callbacks?.onGameEnd?.({
          winner: 'white',
          reason: 'tutorial_complete'
        });
      }
    }

    return moveSuccess;
  }

  getCurrentStep() {
    if (!this.currentTutorial || this.currentStep >= this.currentTutorial.steps.length) {
      return null;
    }
    return this.currentTutorial.steps[this.currentStep];
  }
} 