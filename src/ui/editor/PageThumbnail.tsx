import React, { useRef, useEffect, memo } from 'react';
import { Page } from '../../types';
import { renderPage } from '../../drawing-engine/renderer';
import { isUserInteracting } from '../../utils/perfMetrics';

interface PageThumbnailProps {
  page: Page;
  title: string;
  isDark: boolean;
}

export const PageThumbnail: React.FC<PageThumbnailProps> = memo(({ page, title }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRenderedVersionRef = useRef<number>(-1);

  const drawThumbnail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetW = 160;
    const targetH = Math.round((page.height / Math.max(1, page.width)) * targetW);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.save();
    ctx.clearRect(0, 0, targetW, targetH);
    const s = targetW / Math.max(1, page.width);
    ctx.scale(s, s);
    renderPage(ctx, page, { pressureEnabled: false });
    ctx.restore();
    lastRenderedVersionRef.current = page.updatedAt;
  };

  useEffect(() => {
    if (lastRenderedVersionRef.current === page.updatedAt) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    const schedule = (delay: number) => {
      timerRef.current = setTimeout(() => {
        // Never interrupt active drawing!
        if (isUserInteracting()) {
          schedule(1000);
          return;
        }
        drawThumbnail();
      }, delay);
    };

    // Generous 2000ms idle delay so rapid strokes never trigger thumbnail redraws
    schedule(2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [page.id, page.updatedAt, page.width, page.height, page]);

  return (
    <div className="h-28 rounded-lg border border-neutral-100 dark:border-neutral-800 p-2 flex flex-col justify-between overflow-hidden relative bg-white shadow-2xs">
      <div className="text-[10px] font-bold text-[#1E3A8A] truncate z-10">
        {title}
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
    </div>
  );
});

PageThumbnail.displayName = 'PageThumbnail';
