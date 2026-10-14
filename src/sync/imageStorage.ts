import { ImageObject, Page } from '../types';

/**
 * 100% Local Image Storage:
 * All images are stored locally in the notebook state (IndexedDB / SQLite) on the device.
 * No external database or cloud storage upload.
 */

const imageResolvedListeners = new Set<() => void>();

export function subscribeImageResolved(listener: () => void): () => void {
  imageResolvedListeners.add(listener);
  return () => {
    imageResolvedListeners.delete(listener);
  };
}

export function extractStoragePath(_src: string): string | null {
  return null;
}

export async function uploadImageToStorage(img: ImageObject): Promise<string> {
  return img.src;
}

export async function getSignedImageUrl(srcOrPath: string): Promise<string> {
  return srcOrPath || '';
}

export function getResolvedImageUrl(srcOrPath: string): string {
  return srcOrPath || '';
}

export async function preparePageImages(page: Page, onResolved?: () => void): Promise<void> {
  if (onResolved) {
    onResolved();
  }
}
