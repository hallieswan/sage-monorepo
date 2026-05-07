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
 * Geometric anchor points for one side of the angular bracket:
 *
 *   start (upper anchor)
 *     │   top stem (vertical)
 *   stem1End
 *     ╮   rounded corner (radius cornerRadiusPx)
 *   horizontalStart ─────── horizontalEnd
 *                              ╮   rounded corner
 *                            stem2Start
 *                              │   bottom stem (vertical)
 *                            end (lower anchor)
 *
 * `direction` is +1 when the horizontal travels right, -1 when it travels
 * left. `cornerControlPx` is the cubic-bezier control offset that approximates
 * a quarter-circle arc of radius `cornerRadiusPx`.
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
