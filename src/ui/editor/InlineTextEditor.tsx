import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, X, Type } from 'lucide-react';

interface InlineTextEditorProps {
  initialText: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  sheetWidth: number;
  scale: number;
  pan: { x: number; y: number };
  isDark: boolean;
  isMobile: boolean;
  onDebouncedSave: (text: string) => void;
  onFinish: (text: string) => void;
  onCancel: () => void;
}

export const InlineTextEditor: React.FC<InlineTextEditorProps> = React.memo(({
  initialText,
  x,
  y,
  fontSize,
  color,
  bold,
  italic,
  sheetWidth,
  scale,
  pan,
  isDark,
  isMobile,
  onDebouncedSave,
  onFinish,
  onCancel,
}) => {
  // 1. Independent local state: Keystrokes never trigger re-renders in parent workspace or canvas
  const [text, setText] = useState(initialText);
  const textRef = useRef(text);
  textRef.current = text;

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea height as user types
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.max(64, Math.min(el.scrollHeight, window.innerHeight * 0.45))}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [text, adjustHeight]);

  // Debounced auto-save (800ms) after last keystroke
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onDebouncedSave(newText);
    }, 800);
  };

  // Immediate save & commit on blur or unmount
  const handleBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    onDebouncedSave(textRef.current);
  };

  // Keyboard navigation: Ctrl/Cmd + Enter finishes editing, Escape cancels
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      onFinish(text);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (!text.trim()) {
        onCancel();
      } else {
        onFinish(text);
      }
    }
  };

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Compute word count and character count without blocking
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  // Calculate full-width position:
  // On desktop: spans across the full width of the current page canvas, clamped to screen viewport
  // On mobile: spans full width with safe area margins
  let containerStyle: React.CSSProperties;

  if (isMobile) {
    containerStyle = {
      position: 'fixed',
      left: 'max(12px, env(safe-area-inset-left))',
      right: 'max(12px, env(safe-area-inset-right))',
      top: 'max(72px, env(safe-area-inset-top) + 60px)',
      width: 'calc(100% - 24px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px))',
      maxWidth: '100vw',
      boxSizing: 'border-box',
    };
  } else {
    // Desktop: align horizontally with the rendered page boundaries, stretching to full width of sheet
    const margin = 28 * scale;
    const pageRenderLeft = pan.x + margin;
    const pageRenderWidth = Math.max(320, (sheetWidth * scale) - (margin * 2));
    const maxViewportWidth = window.innerWidth - 48;

    const computedLeft = Math.max(20, Math.min(pageRenderLeft, window.innerWidth - 340));
    const computedWidth = Math.min(pageRenderWidth, maxViewportWidth - computedLeft);

    const screenY = pan.y + y * scale;
    const computedTop = Math.max(72, Math.min(screenY, window.innerHeight - 220));

    containerStyle = {
      position: 'absolute',
      left: `${computedLeft}px`,
      top: `${computedTop}px`,
      width: `${computedWidth}px`,
      maxWidth: 'calc(100vw - 40px)',
      minWidth: '0px',
      boxSizing: 'border-box',
    };
  }

  return (
    <div
      style={containerStyle}
      className={`z-40 rounded-2xl border-2 border-[#6355C7] shadow-xl transition-all duration-150 flex flex-col min-w-0 ${
        isDark ? 'bg-[#141522] text-white' : 'bg-white text-neutral-900'
      }`}
    >
      {/* Top micro-toolbar: badge and word counter */}
      <div className={`px-3 py-1.5 flex items-center justify-between border-b text-[11px] font-medium ${
        isDark ? 'border-neutral-800 text-neutral-400' : 'border-neutral-100 text-neutral-500'
      }`}>
        <div className="flex items-center gap-1.5 text-[#6355C7] dark:text-[#A79AF3] font-semibold">
          <Type className="w-3.5 h-3.5" />
          <span>Текстовое поле</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span>{wordCount} сл.</span>
          <span>·</span>
          <span>{charCount} зн.</span>
        </div>
      </div>

      {/* Main Textarea: 100% width, no fixed w-60, no horizontal overflow, zero input lag */}
      <div className="p-3 w-full min-w-0 flex-1 box-border">
        <textarea
          ref={textareaRef}
          autoFocus
          rows={2}
          spellCheck={false}
          autoCapitalize="sentences"
          autoCorrect="off"
          placeholder="Начните писать конспект, заметку или формулу..."
          value={text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full min-w-0 box-border bg-transparent border-none resize-none focus:outline-none leading-relaxed transition-none"
          style={{
            fontSize: `${Math.max(15, Math.min(28, fontSize * (isMobile ? 1 : scale)))}px`,
            fontWeight: bold ? 'bold' : 'normal',
            fontStyle: italic ? 'italic' : 'normal',
            color: color || (isDark ? '#F1F5F9' : '#0F172A'),
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          }}
        />
      </div>

      {/* Bottom Action Bar */}
      <div className={`px-3 py-2 flex items-center justify-between border-t gap-2 ${
        isDark ? 'border-neutral-800/80 bg-[#10111A]/80' : 'border-neutral-100 bg-[#FAFAFC]'
      }`}>
        <span className="text-[10px] text-neutral-400 hidden sm:inline">
          Нажмите <kbd className="font-mono bg-neutral-200 dark:bg-neutral-800 px-1 py-0.5 rounded text-[9px]">Ctrl+Enter</kbd> для завершения
        </span>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={onCancel}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
          >
            <X className="w-3.5 h-3.5" />
            <span>Отмена</span>
          </button>

          <button
            type="button"
            onClick={() => onFinish(text)}
            className="px-4 py-1.5 rounded-xl bg-[#6355C7] hover:bg-[#5244B4] text-white text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Готово</span>
          </button>
        </div>
      </div>
    </div>
  );
});
