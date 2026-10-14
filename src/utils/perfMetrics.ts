// Global performance metrics store for canvas rendering, input handling, and storage
interface PerfData {
  frameTimes: number[]; // last 60 frames
  avgFrameMs: number;
  maxFrameMs: number;
  lastFrameMs: number;
  pointerMoveMs: number;
  keyPressMs: number;
  lastSaveMs: number;
  lastSaveKb: number;
  workspaceRenders: number;
  sidebarRenders: number;
}

const listeners = new Set<() => void>();

export const perfMetrics: PerfData = {
  frameTimes: [],
  avgFrameMs: 0,
  maxFrameMs: 0,
  lastFrameMs: 0,
  pointerMoveMs: 0,
  keyPressMs: 0,
  lastSaveMs: 0,
  lastSaveKb: 0,
  workspaceRenders: 0,
  sidebarRenders: 0,
};

let notifyTimer: any = null;
function notify() {
  if (notifyTimer !== null) return;
  notifyTimer = setTimeout(() => {
    notifyTimer = null;
    listeners.forEach((fn) => fn());
  }, 100);
}

export function subscribePerfMetrics(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function recordFrameTime(ms: number) {
  perfMetrics.lastFrameMs = ms;
  perfMetrics.frameTimes.push(ms);
  if (perfMetrics.frameTimes.length > 60) {
    perfMetrics.frameTimes.shift();
  }
  const sum = perfMetrics.frameTimes.reduce((a, b) => a + b, 0);
  perfMetrics.avgFrameMs = +(sum / perfMetrics.frameTimes.length).toFixed(2);
  perfMetrics.maxFrameMs = +Math.max(...perfMetrics.frameTimes).toFixed(2);
  notify();
}

export function recordPointerMoveTime(ms: number) {
  perfMetrics.pointerMoveMs = +ms.toFixed(2);
  notify();
}

export function recordKeyPressTime(ms: number) {
  perfMetrics.keyPressMs = +ms.toFixed(2);
  notify();
}

export function recordSaveStats(durationMs: number, bytes: number) {
  perfMetrics.lastSaveMs = +durationMs.toFixed(2);
  perfMetrics.lastSaveKb = +(bytes / 1024).toFixed(1);
  notify();
}

export function incrementWorkspaceRender() {
  perfMetrics.workspaceRenders += 1;
  notify();
}

export function incrementSidebarRender() {
  perfMetrics.sidebarRenders += 1;
  notify();
}

let activeInteractionCount = 0;
export function setUserInteracting(active: boolean) {
  if (active) {
    activeInteractionCount++;
  } else {
    activeInteractionCount = Math.max(0, activeInteractionCount - 1);
  }
}

export function isUserInteracting(): boolean {
  return activeInteractionCount > 0;
}
