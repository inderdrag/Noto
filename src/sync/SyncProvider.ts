/**
 * Placeholder / contract interface for future cloud synchronization providers
 * (e.g., Google Drive, WebDAV, Nextcloud).
 * 
 * Note: Cloud sync is intentionally detached for release 1.0.1.
 * All data is kept 100% locally in SQLite (Android) and IndexedDB (Desktop/Web).
 */

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingChangesCount: number;
  lastSyncTime?: number | null;
  error?: string | null;
}

export interface SyncProvider {
  /**
   * Pushes local notebooks and folders to remote storage
   */
  push(): Promise<void>;

  /**
   * Pulls latest notebooks and folders from remote storage
   */
  pull(): Promise<void>;

  /**
   * Returns current synchronization status
   */
  getStatus(): SyncStatus;
}
