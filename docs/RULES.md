# 3D Chess: rules as implemented

This describes what the engine in `src/lib/chess/engine.ts` actually does. It is
the reference for the rules, tests and AI. If the code and this file disagree,
the code is wrong until one of them is changed on purpose.

## Board

- Three layers, numbered 1 to 3 (layer 1 is the bottom). Each layer is an 8×8 board.
- Squares are written file, rank, layer: `e2:1` is file e, rank 2, layer 1.
  Moves are written `from` then `to`: `e2:1e4:1`. A promotion adds the piece
  letter: `a7:2a8:2q` (q, r, b, n).

## Starting position

- Layer 1: white pawns on rank 2, black pawns on rank 7, and the back ranks
  (rooks, knights, bishops, queen, king) on ranks 1 and 8.
- Layer 2 (middle): white knight on c4 and bishop on f4; black knight on c5 and
  bishop on f5 (see `initializeMiddleLayer`).
- Layer 3 (top): empty. Promoted pieces can be placed here.
- White moves first.

## Moving

Each turn the side to move makes exactly one move. A move is one of:

1. **Normal move.** Move within the piece's own layer, using that piece's usual
   chess movement (pawn, rook, knight, bishop, queen, king).
2. **Layer move.** Rook, bishop, queen and king may move straight to the same
   square on an adjacent layer (layer 1 to 2, or 2 to 3), but only onto an empty
   square. A layer move never captures. It uses the whole turn.
3. **Knight layer jump.** A knight may move to the same square on either other
   layer, if that square is empty. This is in addition to its normal L-shaped
   moves.

Pawns cannot change layers.

Captures happen only within a layer (normal moves), never by a layer move.

## Special moves

- **Castling.** Only on layer 1, on the king's starting square. The king and the
  rook involved must not have moved, the squares between them must be empty, the
  king must not be in check, and it must not pass through or land on an attacked
  square.
- **En passant.** Standard, within the layer, and only on the move immediately
  after a two-square pawn advance.
- **Promotion.** A pawn reaching the last rank of its own layer must promote to a
  queen, rook, bishop or knight. The engine defaults to a queen if no choice is
  given. The promoted piece stays on the layer where it promoted.

## Check and attack

- A square is attacked if an opponent piece could move to it by any rule above,
  on any layer. A layer move can attack an empty square on the adjacent layer,
  but it can never capture, because it only moves onto empty squares.
- A king is in check when its square is attacked.
- A move is illegal if it leaves the mover's own king in check.

## Game end

- **Checkmate.** In check, with no legal move. The other side wins.
- **Stalemate.** Not in check, with no legal move. Draw.
- **Insufficient material.** Automatic draw when neither side can mate, for
  example king against king, king and knight against king, or king and bishop
  against king. Checked by piece count, not by layer.
- **Fivefold repetition.** Automatic draw when the same position occurs five
  times.
- **Seventy-five-move rule.** Automatic draw after 150 plies (75 moves each)
  without a capture or pawn move.
- **Threefold repetition.** Claimable. Use `claimDraw()`.
- **Fifty-move rule.** Claimable after 100 plies without a capture or pawn move.
- **Resignation** and **agreed draw** are handled by the game screen.

A position is identified by the placement of every piece on every layer, the
side to move, castling rights and the en passant target. Move counters are
ignored when comparing positions.

## Undo

Undo restores the complete previous state, including promotions, castling and
en passant. Undo history lives in memory. A game rebuilt from a saved snapshot
can only undo moves made after it was rebuilt.

## Not yet defined

- Whether a king can castle from layer 2 or 3. The engine only allows castling
  on layer 1.
- Whether layer moves should be restricted when a king is in check (the engine
  currently applies the normal check filter to them).
- Whether en passant should depend on the layer the pawn is on (it currently
  does, because the target includes the layer).
