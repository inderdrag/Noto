import React, { useEffect, useState } from 'react';
import { perfMetrics, subscribePerfMetrics } from '../utils/perfMetrics';
import { Page } from '../types';

interface PerformanceOverlayProps {
  currentPage?: Page;
  isDark?: boolean;
}

export const PerformanceOverlay: React.FC<PerformanceOverlayProps> = ({
  currentPage,
  isDark = true,
}) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return subscribePerfMetrics(() => {
      setTick((t) => t + 1);
    });
  }, []);

  const strokesCount = (currentPage?.strokes || []).filter((s) => !s.deleted).length;
  const shapesCount = (currentPage?.shapes || []).filter((s) => !s.deleted).length;
  const textsCount = (currentPage?.texts || []).filter((t) => !t.deleted).length;
  const imagesCount = (currentPage?.images || []).filter((img) => !img.deleted).length;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 p-2.5 rounded-xl border shadow-xl backdrop-blur-md text-[11px] font-mono select-none pointer-events-none flex flex-col gap-1 ${
        isDark
          ? 'bg-neutral-900/85 text-neutral-200 border-neutral-700'
          : 'bg-white/90 text-neutral-800 border-neutral-300'
      }`}
      style={{ minWidth: 220 }}
    >
      <div className="flex items-center justify-between pb-1 border-b border-neutral-500/20 font-bold">
        <span className="text-emerald-500 flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Производительность
        </span>
        <span className="text-[10px] text-neutral-400">Noto 60fps</span>
      </div>

      <div className="flex justify-between">
        <span className="text-neutral-400">Кадр холста:</span>
        <span className={`font-semibold ${perfMetrics.avgFrameMs > 16 ? 'text-amber-500' : 'text-emerald-400'}`}>
          {perfMetrics.lastFrameMs.toFixed(1)} мс (ср: {perfMetrics.avgFrameMs}, макс: {perfMetrics.maxFrameMs})
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-neutral-400">На листе:</span>
        <span className="font-semibold">
          {strokesCount} штрих. / {shapesCount} фиг. / {imagesCount} изобр.
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-neutral-400">PointerMove:</span>
        <span className="font-semibold text-emerald-400">
          {perfMetrics.pointerMoveMs} мс
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-neutral-400">Нажатие клавиши:</span>
        <span className="font-semibold text-emerald-400">
          {perfMetrics.keyPressMs} мс
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-neutral-400">Сохранение:</span>
        <span className="font-semibold">
          {perfMetrics.lastSaveMs} мс ({perfMetrics.lastSaveKb} КБ)
        </span>
      </div>

      <div className="flex justify-between pt-1 border-t border-neutral-500/20 text-[10px] text-neutral-400">
        <span>Рендеры React:</span>
        <span>
          Workspace: {perfMetrics.workspaceRenders} | Sidebar: {perfMetrics.sidebarRenders}
        </span>
      </div>
    </div>
  );
};
