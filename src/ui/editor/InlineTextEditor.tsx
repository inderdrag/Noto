import React, { useState } from 'react';
import { recordKeyPressTime } from '../../utils/perfMetrics';

interface InlineTextEditorProps {
  x: number;
  y: number;
  initialText: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  scale: number;
  pan: { x: number; y: number };
  isDark: boolean;
  isMobile: boolean;
  onFinish: (text: string) => void;
  onCancel: () => void;
}

export const InlineTextEditor: React.FC<InlineTextEditorProps> = React.memo(({
  x,
  y,
  initialText,
  fontSize,
  color,
  bold,
  italic,
  scale,
  pan,
  isDark,
  isMobile,
  onFinish,
  onCancel,
}) => {
  const [text, setText] = useState(initialText);

  return (
    <div
      className={`absolute z-40 p-2.5 rounded-2xl shadow-2xl border-2 border-[#6355C7] max-w-[calc(100vw-32px)] ${
        isDark ? 'bg-neutral-900/90 text-white backdrop-blur-md' : 'bg-white/90 text-neutral-900 backdrop-blur-md'
      }`}
      style={{
        left: Math.max(16, Math.min(window.innerWidth - 270, pan.x + x * scale)),
        top: Math.max(64, Math.min(window.innerHeight - 170, pan.y + y * scale)),
      }}
    >
      <textarea
        autoFocus
        rows={2}
        placeholder="Введите текст..."
        value={text}
        onChange={(e) => {
          const t0 = performance.now();
          setText(e.target.value);
          const t1 = performance.now();
          recordKeyPressTime(t1 - t0);
        }}
        className={`w-60 p-2 text-sm bg-transparent border-none resize-none focus:outline-none ${
          isDark ? 'text-white' : 'text-neutral-900'
        }`}
        style={{
          fontSize: `${fontSize}px`,
          fontWeight: bold ? 'bold' : 'normal',
          fontStyle: italic ? 'italic' : 'normal',
          color: color,
        }}
      />
      {!isMobile && (
        <div className="flex items-center justify-end gap-1.5 mt-1">
          <button
            onClick={onCancel}
            className={`px-2.5 py-1 text-xs font-semibold cursor-pointer ${
              isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            Отмена
          </button>
          <button
            onClick={() => onFinish(text)}
            className="px-3.5 py-1 text-xs font-bold rounded-lg shadow-xs bg-[#6355C7] text-white hover:bg-[#5244B4] cursor-pointer"
          >
            Вставить
          </button>
        </div>
      )}
    </div>
  );
});

InlineTextEditor.displayName = 'InlineTextEditor';
