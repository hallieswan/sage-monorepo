export interface Point {
  x: number;
  y: number;
}

export interface BracketAnchors {
  upperLeft: Point;
  upperRight: Point;
  lowerLeft: Point;
  lowerRight: Point;
}

/**
 * Geometric anchor points for one side of the angular bracket. The shape
 * (matching `tmp/images/example-bracket-line.svg`) is:
 *
 *   start (upper anchor)
 *     │   ← top stem (vertical)
 *   stem1End
 *     ╮   ← rounded corner (radius cornerRadiusPx)
 *   horizontalStart ─────── horizontalEnd
 *                              ╮   ← rounded corner
 *                            stem2Start
 *                              │   ← bottom stem (vertical)
 *                            end (lower anchor)
 *
 * `direction` is +1 when the horizontal segment travels right (right bracket)
 * and -1 when it travels left (left bracket). `cornerControlPx` is the cubic-
 * bezier control offset that approximates a quarter-circle arc of radius
 * `cornerRadiusPx`.
 */
export interface BracketSideShape {
  start: Point;
  stem1End: Point;
  horizontalStart: Point;
  horizontalEnd: Point;
  stem2Start: Point;
  end: Point;
  cornerControlPx: number;
  direction: 1 | -1;
}

export interface BracketShape {
  left: BracketSideShape;
  right: BracketSideShape;
}

// Cubic-bezier control distance that approximates a quarter circle.
// (4/3) × tan(π/8) ≈ 0.5523.
const CIRCLE_BEZIER_K = 0.5522847498307933;

export function computeBracketSide(
  upper: Point,
  lower: Point,
  topStemPx: number,
  cornerRadiusPx: number,
): BracketSideShape {
  const direction: 1 | -1 = lower.x >= upper.x ? 1 : -1;
  const horizontalY = upper.y + topStemPx + cornerRadiusPx;
  return {
    start: { x: upper.x, y: upper.y },
    stem1End: { x: upper.x, y: upper.y + topStemPx },
    horizontalStart: { x: upper.x + direction * cornerRadiusPx, y: horizontalY },
    horizontalEnd: { x: lower.x - direction * cornerRadiusPx, y: horizontalY },
    stem2Start: { x: lower.x, y: horizontalY + cornerRadiusPx },
    end: { x: lower.x, y: lower.y },
    cornerControlPx: cornerRadiusPx * CIRCLE_BEZIER_K,
    direction,
  };
}

export function computeBrackets(
  anchors: BracketAnchors,
  topStemPx: number,
  cornerRadiusPx: number,
): BracketShape {
  return {
    left: computeBracketSide(anchors.upperLeft, anchors.lowerLeft, topStemPx, cornerRadiusPx),
    right: computeBracketSide(anchors.upperRight, anchors.lowerRight, topStemPx, cornerRadiusPx),
  };
}

/**
 * SVG `d` string for one side of the bracket -- mostly horizontal with a
 * vertical stem and rounded corner at each end. Useful for testing the
 * geometry; the chart itself constructs ECharts graphic primitives instead
 * since `path` isn't a valid graphic.elements type.
 */
export function bracketSideToPathD(side: BracketSideShape): string {
  const { start, stem1End, horizontalStart, horizontalEnd, stem2Start, end } = side;
  const cc = side.cornerControlPx;
  const dir = side.direction;
  return [
    `M ${start.x} ${start.y}`,
    `V ${stem1End.y}`,
    `C ${stem1End.x} ${stem1End.y + cc},`,
    `${horizontalStart.x - dir * cc} ${horizontalStart.y},`,
    `${horizontalStart.x} ${horizontalStart.y}`,
    `H ${horizontalEnd.x}`,
    `C ${horizontalEnd.x + dir * cc} ${horizontalEnd.y},`,
    `${stem2Start.x} ${stem2Start.y - cc},`,
    `${stem2Start.x} ${stem2Start.y}`,
    `V ${end.y}`,
  ].join(' ');
}
