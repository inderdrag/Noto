import { Point, Stroke, Shape } from '../types';

/**
 * Calculates distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates distance from point P to line segment AB
 */
export function distToSegment(p: Point, a: Point, b: Point): number {
  const l2 = (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
  if (l2 === 0) return distance(p, a);
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return distance(p, {
    x: a.x + t * (b.x - a.x),
    y: a.y + t * (b.y - a.y),
  });
}

/**
 * Checks if a circle (center, radius) intersects any segment of a stroke
 */
export function strokeIntersectsCircle(stroke: Stroke, center: Point, radius: number): boolean {
  if (stroke.points.length === 0) return false;
  const effectiveRadius = radius + Math.max(stroke.width || 2, 4) / 2;
  if (stroke.points.length === 1) {
    return distance(stroke.points[0], center) <= effectiveRadius;
  }
  for (let i = 0; i < stroke.points.length - 1; i++) {
    const p1 = stroke.points[i];
    const p2 = stroke.points[i + 1];
    if (distToSegment(center, p1, p2) <= effectiveRadius) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if an eraser circle (center, radius) intersects any part of a shape
 */
export function shapeIntersectsCircle(shape: Shape, center: Point, radius: number): boolean {
  if (shape.deleted) return false;

  const isLine = ['line', 'dashed-line', 'arrow', 'dashed-arrow'].includes(shape.type);
  if (isLine) {
    const p1: Point = { x: shape.x, y: shape.y };
    const p2: Point = { x: shape.x + shape.width, y: shape.y + shape.height };
    const effectiveRadius = radius + Math.max(shape.strokeWidth || 2, 4) / 2;
    return distToSegment(center, p1, p2) <= effectiveRadius;
  }

  // Rect, Circle, Triangle, Star:
  const left = Math.min(shape.x, shape.x + shape.width);
  const right = Math.max(shape.x, shape.x + shape.width);
  const top = Math.min(shape.y, shape.y + shape.height);
  const bottom = Math.max(shape.y, shape.y + shape.height);
  const pad = Math.max(shape.strokeWidth || 2, 4) / 2;

  // Circle / Ellipse shape specific check
  if (shape.type === 'circle' || shape.type === 'ellipse') {
    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;
    const rx = (right - left) / 2 + pad;
    const ry = (bottom - top) / 2 + pad;
    const dx = (center.x - cx) / Math.max(rx + radius, 1);
    const dy = (center.y - cy) / Math.max(ry + radius, 1);
    return (dx * dx + dy * dy) <= 1;
  }

  // Rectangles, Triangles, Stars bounding check
  const closestX = Math.max(left - pad, Math.min(center.x, right + pad));
  const closestY = Math.max(top - pad, Math.min(center.y, bottom + pad));
  const dx = center.x - closestX;
  const dy = center.y - closestY;
  return (dx * dx + dy * dy) <= (radius * radius);
}

/**
 * Slices a stroke by removing points within eraser radius.
 * Splits into multiple continuous strokes if cut in the middle.
 */
export function sliceStrokeByEraser(stroke: Stroke, center: Point, eraserRadius: number): Stroke[] {
  const strokeWidth = stroke.width || (stroke.tool === 'marker' ? 24 : 3);
  const effectiveRadius = eraserRadius + strokeWidth * 0.45;
  const pts = stroke.points;
  if (!pts || pts.length === 0) return [];
  if (pts.length === 1) {
    return distance(pts[0], center) <= effectiveRadius ? [] : [stroke];
  }

  // Subdivide any long segments so the eraser can slice lines of any speed/length
  const densePoints: Point[] = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const segDist = distance(a, b);
    const step = Math.max(4, effectiveRadius * 0.5);
    if (segDist > step) {
      const steps = Math.ceil(segDist / step);
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        densePoints.push({
          x: a.x + t * (b.x - a.x),
          y: a.y + t * (b.y - a.y),
          pressure: (a.pressure ?? 0.5) * (1 - t) + (b.pressure ?? 0.5) * t,
          time: a.time ? a.time + t * ((b.time || a.time) - a.time) : Date.now(),
        });
      }
    }
    densePoints.push(b);
  }

  const result: Stroke[] = [];
  let currentSegment: Point[] = [];

  for (let i = 0; i < densePoints.length; i++) {
    const pt = densePoints[i];
    const isErased = distance(pt, center) <= effectiveRadius;

    if (!isErased) {
      currentSegment.push(pt);
    } else {
      if (currentSegment.length >= 2) {
        result.push({
          ...stroke,
          id: `${stroke.id}_part_${result.length}_${Date.now()}`,
          points: [...currentSegment],
          updatedAt: Date.now(),
        });
      }
      currentSegment = [];
    }
  }

  if (currentSegment.length >= 2) {
    result.push({
      ...stroke,
      id: `${stroke.id}_part_${result.length}_${Date.now()}`,
      points: currentSegment,
      updatedAt: Date.now(),
    });
  }

  return result;
}

/**
 * Computes bounding box for a list of points
 */
export function getPointsBounds(points: Point[]): { minX: number; minY: number; maxX: number; maxY: number } {
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }

  return { minX, minY, maxX, maxY };
}

/**
 * Computes bounding box for a stroke including line width
 */
export function getStrokeBounds(stroke: Stroke): { x: number; y: number; width: number; height: number } {
  const b = getPointsBounds(stroke.points);
  const pad = stroke.width / 2 + 4;
  return {
    x: b.minX - pad,
    y: b.minY - pad,
    width: b.maxX - b.minX + pad * 2,
    height: b.maxY - b.minY + pad * 2,
  };
}

/**
 * Computes bounding box for a shape
 */
export function getShapeBounds(shape: Shape): { x: number; y: number; width: number; height: number } {
  const pad = shape.strokeWidth / 2 + 2;
  const x = Math.min(shape.x, shape.x + shape.width) - pad;
  const y = Math.min(shape.y, shape.y + shape.height) - pad;
  const width = Math.abs(shape.width) + pad * 2;
  const height = Math.abs(shape.height) + pad * 2;
  return { x, y, width, height };
}

/**
 * Checks if a point is inside a rectangle
 */
export function pointInRect(p: Point, rect: { x: number; y: number; width: number; height: number }): boolean {
  return p.x >= rect.x && p.x <= rect.x + rect.width && p.y >= rect.y && p.y <= rect.y + rect.height;
}

/**
 * Smooths stroke points using Chaikin corner-cutting algorithm for natural, silky handwriting
 */
export function smoothPoints(points: Point[]): Point[] {
  if (points.length < 3) return points;

  // Single pass of Chaikin corner-cutting creates organic, smooth calligraphy without wobble or overshoot
  const smoothed: Point[] = [points[0]];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];

    const q: Point = {
      x: 0.75 * p0.x + 0.25 * p1.x,
      y: 0.75 * p0.y + 0.25 * p1.y,
      pressure: (p0.pressure ?? 0.5) * 0.75 + (p1.pressure ?? 0.5) * 0.25,
      time: p0.time,
    };
    const r: Point = {
      x: 0.25 * p0.x + 0.75 * p1.x,
      y: 0.25 * p0.y + 0.75 * p1.y,
      pressure: (p0.pressure ?? 0.5) * 0.25 + (p1.pressure ?? 0.5) * 0.75,
      time: p1.time,
    };

    smoothed.push(q, r);
  }
  smoothed.push(points[points.length - 1]);
  return smoothed;
}
