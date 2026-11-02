/// <reference lib="webworker" />
// Runs the computer's search off the main thread so the board stays responsive
// at the expert level. Receives an engine snapshot, returns the chosen move.
import { ChessEngine, EngineSnapshot } from '@/lib/chess/engine';
import { ChessAI, Difficulty } from '@/lib/ai/ChessAI';

export interface AIWorkerRequest {
  id: number;
  snapshot: EngineSnapshot;
  difficulty: Difficulty;
}

export interface AIWorkerResponse {
  id: number;
  move: { from: { x: number; y: number; layer: number }; to: { x: number; y: number; layer: number } } | null;
  error?: string;
}

self.onmessage = (event: MessageEvent<AIWorkerRequest>) => {
  const { id, snapshot, difficulty } = event.data;
  try {
    const engine = ChessEngine.fromSnapshot(snapshot);
    const ai = new ChessAI(difficulty);
    const move = ai.chooseMove(engine);
    const response: AIWorkerResponse = { id, move };
    self.postMessage(response);
  } catch (err) {
    const response: AIWorkerResponse = { id, move: null, error: String(err) };
    self.postMessage(response);
  }
};
