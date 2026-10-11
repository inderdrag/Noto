import { Notebook, Page, PageBackground, Stroke, Shape, TextObject, ImageObject } from '../types';

export function normalizeStroke(s: Stroke): Stroke {
  return {
    ...s,
    deleted: s.deleted ?? false,
    updatedAt: s.updatedAt || s.createdAt || Date.now(),
  };
}

export function normalizeShape(sh: Shape): Shape {
  return {
    ...sh,
    deleted: sh.deleted ?? false,
    updatedAt: sh.updatedAt || sh.createdAt || Date.now(),
  };
}

export function normalizeText(t: TextObject): TextObject {
  return {
    ...t,
    deleted: t.deleted ?? false,
    updatedAt: t.updatedAt || t.createdAt || Date.now(),
  };
}

export function normalizeImage(img: ImageObject): ImageObject {
  return {
    ...img,
    deleted: img.deleted ?? false,
    updatedAt: img.updatedAt || img.createdAt || Date.now(),
  };
}

export function normalizePage(p: Page): Page {
  const rawBg = p.background as any;
  const normalizedBg: PageBackground = {
    color: rawBg?.color || '#FFFFFF',
    type: rawBg?.type || rawBg?.gridType || 'grid',
    gridSize: rawBg?.gridSize || 28,
    gridColor: rawBg?.gridColor || rawBg?.lineColor || '#E2E8F0',
    gridOpacity: rawBg?.gridOpacity ?? 1,
    lineWidth: rawBg?.lineWidth ?? 1,
  };

  return {
    ...p,
    background: normalizedBg,
    height: p.height > 1200 ? 1150 : (p.height || 1150),
    deleted: p.deleted ?? false,
    updatedAt: p.updatedAt || p.createdAt || Date.now(),
    strokes: (p.strokes || []).map(normalizeStroke),
    shapes: (p.shapes || []).map(normalizeShape),
    texts: (p.texts || []).map(normalizeText),
    images: (p.images || []).map(normalizeImage),
  };
}

export function createDefaultPage(id?: string, order: number = 0): Page {
  return {
    id: id || `page_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: 'Страница 1',
    order,
    width: 800,
    height: 1150,
    background: {
      color: '#FFFFFF',
      type: 'grid',
      gridSize: 28,
      gridColor: '#E2E8F0',
      gridOpacity: 1,
      lineWidth: 1,
    },
    strokes: [],
    shapes: [],
    texts: [],
    images: [],
    deleted: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function normalizeNotebook(nb: Notebook): Notebook {
  let pages = (nb.pages || []).map(normalizePage);
  if (pages.length === 0) {
    pages = [createDefaultPage()];
  } else if (pages.every((p) => p.deleted)) {
    pages.push(createDefaultPage(`page_${Date.now()}_def`, pages.length));
  }

  const activePages = pages.filter((p) => !p.deleted);
  const targetId = (activePages[0] || pages[0]).id;

  return {
    ...nb,
    currentPageId: (nb.currentPageId && pages.some((p) => p.id === nb.currentPageId && !p.deleted))
      ? nb.currentPageId
      : targetId,
    updatedAt: nb.updatedAt || nb.createdAt || Date.now(),
    pages,
  };
}
