// Simple test script to verify chess engine fixes
const { ChessEngine } = require('./src/lib/chess/engine.ts');

console.log('Testing Chess Engine Fixes...\n');

// Test 1: Verify piece collision detection
console.log('Test 1: Piece Collision Detection');
const engine = new ChessEngine();

// Get a rook from the initial position
const rook = engine.getPieceAt({ x: 0, y: 0, layer: 0 });
if (rook && rook.type === 'rook') {
  const validMoves = engine.getValidMoves(rook);
  console.log(`Rook at (0,0) has ${validMoves.length} valid moves`);
  
  // Should not be able to move through pawns
  const canMoveThroughPawn = validMoves.some(move => move.x === 0 && move.y === 2);
  console.log(`Can move through pawn at (0,1): ${canMoveThroughPawn}`);
  
  if (!canMoveThroughPawn) {
    console.log('✅ PASS: Rook cannot move through pawns');
  } else {
    console.log('❌ FAIL: Rook can move through pawns');
  }
}

// Test 2: Verify piece capture
console.log('\nTest 2: Piece Capture');
const gameState = engine.getGameState();
console.log(`Initial captured pieces - White: ${gameState.capturedPieces.white.length}, Black: ${gameState.capturedPieces.black.length}`);

// Make a capture move (e.g., pawn takes pawn)
const success = engine.makeMove({ x: 0, y: 1, layer: 0 }, { x: 1, y: 6, layer: 0 });
if (success) {
  const newState = engine.getGameState();
  console.log(`After capture - White: ${newState.capturedPieces.white.length}, Black: ${newState.capturedPieces.black.length}`);
  
  if (newState.capturedPieces.black.length > 0) {
    console.log('✅ PASS: Piece capture works correctly');
  } else {
    console.log('❌ FAIL: Piece capture not working');
  }
} else {
  console.log('❌ FAIL: Could not make capture move');
}

// Test 3: Verify check detection
console.log('\nTest 3: Check Detection');
const isInCheck = engine.isKingInCheck('white');
console.log(`White king in check: ${isInCheck}`);

// Test 4: Verify AI integration
console.log('\nTest 4: AI Integration');
const { ChessAI } = require('./src/lib/ai/ChessAI.ts');
const ai = new ChessAI('beginner');

// Get current game state
const currentState = engine.getGameState();
const aiMove = await ai.getNextMove(currentState);

if (aiMove) {
  console.log(`AI suggested move: ${aiMove.piece.type} from (${aiMove.from.x},${aiMove.from.y}) to (${aiMove.to.x},${aiMove.to.y})`);
  console.log('✅ PASS: AI integration working');
} else {
  console.log('❌ FAIL: AI not generating moves');
}

console.log('\nTest completed!'); 