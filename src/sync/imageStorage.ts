import { ImageObject, Page } from '../types';

/**
 * Image storage utilities for local standalone operation.
 * Images are stored directly in local database (IndexedDB / SQLite) as data URLs
 * or offline blobs, without external cloud dependencies.
 */

// Callbacks to notify canvas or editor when an image has been loaded or resolved
const imageResolvedListeners = new Set<() => void>();

export function subscribeImageResolved(listener: () => void): () => void {
  imageResolvedListeners.add(listener);
  return () => {
    imageResolvedListeners.delete(listener);
  };
}

export function notifyImageResolved(): void {
  imageResolvedListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Ignore listener error
    }
  });
}

/**
 * Returns image source directly.
 */
export function getResolvedImageUrl(srcOrPath: string): string {
  return srcOrPath || '';
}

/**
 * Prepares all images on page for local display.
 */
export async function preparePageImages(page: Page, onResolved?: () => void): Promise<void> {
  if (onResolved) {
    onResolved();
  }
}
