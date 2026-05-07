import { computeBrackets, computeBracketSide } from './bracket-utils';

describe('computeBracketSide', () => {
  it('builds the angular bracket anchors for a left side (horizontal goes left)', () => {
    const side = computeBracketSide({ x: 568.187, y: 0 }, { x: 0.5, y: 36 }, 14.8, 8);
    expect(side.direction).toBe(-1);
    expect(side.start).toEqual({ x: 568.187, y: 0 });
    expect(side.stem1End).toEqual({ x: 568.187, y: 14.8 });
    expect(side.horizontalStart).toEqual({ x: 568.187 - 8, y: 22.8 });
    expect(side.horizontalEnd).toEqual({ x: 0.5 + 8, y: 22.8 });
    expect(side.stem2Start).toEqual({ x: 0.5, y: 30.8 });
    expect(side.end).toEqual({ x: 0.5, y: 36 });
    // Cubic-bezier control distance for a quarter-circle of radius 8.
    expect(side.cornerControlPx).toBeCloseTo(4.418, 3);
  });

  it('flips direction to +1 when the horizontal travels right', () => {
    const side = computeBracketSide({ x: 0, y: 0 }, { x: 100, y: 36 }, 15, 8);
    expect(side.direction).toBe(1);
    expect(side.horizontalStart.x).toBe(8);
    expect(side.horizontalEnd.x).toBe(92);
  });

  it('places the horizontal segment topStem + cornerRadius below the upper anchor', () => {
    const side = computeBracketSide({ x: 0, y: 100 }, { x: 50, y: 200 }, 12, 8);
    expect(side.horizontalStart.y).toBe(120);
    expect(side.horizontalEnd.y).toBe(120);
  });
});

describe('computeBrackets', () => {
  it('produces a left and right side from the four anchors', () => {
    const brackets = computeBrackets(
      {
        upperLeft: { x: 100, y: 50 },
        upperRight: { x: 200, y: 50 },
        lowerLeft: { x: 0, y: 100 },
        lowerRight: { x: 300, y: 100 },
      },
      14.8,
      8,
    );
    expect(brackets.left.direction).toBe(-1);
    expect(brackets.right.direction).toBe(1);
    expect(brackets.left.start).toEqual({ x: 100, y: 50 });
    expect(brackets.right.end).toEqual({ x: 300, y: 100 });
  });
});
