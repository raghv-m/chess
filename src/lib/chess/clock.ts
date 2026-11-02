/**
 * Chess clock arithmetic, kept pure so the server and the tests share one
 * implementation. Times are milliseconds. The server supplies `now` from its
 * own clock, so a client cannot extend its time by changing its device clock.
 */

export type ClockColor = 'white' | 'black';

export interface ClockState {
  /** Remaining time for each side, measured at `turnStartedAt`. */
  remainingMs: Record<ClockColor, number>;
  /** Server time when the side to move started its turn, or null if the clock is stopped. */
  turnStartedAt: number | null;
  /** Side whose clock is running, or null if stopped. */
  running: ClockColor | null;
  /** Fischer increment added after each completed move. */
  incrementMs: number;
}

export function createClock(initialMs: number, incrementMs = 0): ClockState {
  return {
    remainingMs: { white: initialMs, black: initialMs },
    turnStartedAt: null,
    running: null,
    incrementMs
  };
}

/** Remaining time for a color right now, without changing state. */
export function remainingAt(clock: ClockState, color: ClockColor, now: number): number {
  const base = clock.remainingMs[color];
  if (clock.running !== color || clock.turnStartedAt === null) return base;
  return Math.max(0, base - Math.max(0, now - clock.turnStartedAt));
}

/**
 * Record a completed move by `mover` at server time `now`: charge the time
 * used, add the increment, and start the opponent's clock.
 * Returns the new state and whether the mover ran out of time first.
 */
export function applyMove(
  clock: ClockState,
  mover: ClockColor,
  now: number
): { clock: ClockState; flagged: boolean } {
  const left = remainingAt(clock, mover, now);
  const flagged = left <= 0;
  const next: ClockState = {
    remainingMs: { ...clock.remainingMs, [mover]: flagged ? 0 : left + clock.incrementMs },
    turnStartedAt: now,
    running: mover === 'white' ? 'black' : 'white',
    incrementMs: clock.incrementMs
  };
  return { clock: next, flagged };
}

/** Whether the side to move has run out of time at `now`. */
export function hasFlagged(clock: ClockState, now: number): ClockColor | null {
  if (clock.running === null || clock.turnStartedAt === null) return null;
  return remainingAt(clock, clock.running, now) <= 0 ? clock.running : null;
}

/** Start the first clock (used when the second player joins). */
export function startClock(clock: ClockState, now: number): ClockState {
  return { ...clock, running: 'white', turnStartedAt: now };
}

/** Stop the clock (game over). Remaining times are frozen at `now`. */
export function stopClock(clock: ClockState, now: number): ClockState {
  if (clock.running === null || clock.turnStartedAt === null) return clock;
  const color = clock.running;
  return {
    ...clock,
    remainingMs: { ...clock.remainingMs, [color]: remainingAt(clock, color, now) },
    running: null,
    turnStartedAt: null
  };
}
