import { createClock, applyMove, remainingAt, hasFlagged, startClock, stopClock } from '@/lib/chess/clock';

describe('Chess clock', () => {
  test('time is charged to the side that moved and increment is added', () => {
    let c = startClock(createClock(60_000, 2_000), 1_000);
    const r = applyMove(c, 'white', 6_000); // white used 5s
    expect(r.flagged).toBe(false);
    expect(r.clock.remainingMs.white).toBe(57_000);
    expect(r.clock.running).toBe('black');
    expect(r.clock.turnStartedAt).toBe(6_000);
  });

  test('a side running out of time is flagged and cannot move on', () => {
    const c = startClock(createClock(3_000), 0);
    expect(hasFlagged(c, 2_999)).toBeNull();
    expect(hasFlagged(c, 3_000)).toBe('white');
    const r = applyMove(c, 'white', 4_000);
    expect(r.flagged).toBe(true);
    expect(r.clock.remainingMs.white).toBe(0);
  });

  test('remaining time never goes negative and the idle side does not tick', () => {
    const c = startClock(createClock(10_000), 0);
    expect(remainingAt(c, 'white', 99_999)).toBe(0);
    expect(remainingAt(c, 'black', 5_000)).toBe(10_000);
  });

  test('stopping freezes the running clock', () => {
    const c = stopClock(startClock(createClock(10_000), 0), 4_000);
    expect(c.running).toBeNull();
    expect(c.remainingMs.white).toBe(6_000);
    expect(remainingAt(c, 'white', 9_000)).toBe(6_000);
  });
});
