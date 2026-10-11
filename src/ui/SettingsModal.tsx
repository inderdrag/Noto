import React, { useState, useRef } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  Moon, 
  Sun, 
  HardDrive, 
  ShieldCheck, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { AppSettings, Notebook, Folder } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  notebooks: Notebook[];
  folders: Folder[];
  onExportAll: () => Promise<void>;
  onImportBackup: (file: File, mode: 'merge' | 'replace') => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  notebooks,
  folders,
  onExportAll,
  onImportBackup,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedPreview, setParsedPreview] = useState<{ count: number; name: string } | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await onExportAll();
      setFeedbackMsg({ text: 'Резервная копия успешно выгружена!', type: 'success' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err) {
      setFeedbackMsg({ 
        text: err instanceof Error ? err.message : 'Ошибка при экспорте данных', 
        type: 'error' 
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsImporting(true);
        // Pre-validate file strictly before showing confirmation
        const text = await file.text();
        const obj = JSON.parse(text);
        let count = 0;
        if (Array.isArray(obj.notebooks)) {
          count = obj.notebooks.length;
        } else if (Array.isArray(obj)) {
          count = obj.length;
        } else if (('application' in obj && obj.application === 'Noto' && 'notebook' in obj) || ('pages' in obj && 'title' in obj)) {
          count = 1;
        } else {
          throw new Error('Файл не содержит распознаваемых данных тетрадей Noto (.noto, .json, .notobackup).');
        }

        if (count === 0) {
          throw new Error('В выбранном файле нет тетрадей для импорта.');
        }

        setSelectedFile(file);
        setParsedPreview({ count, name: file.name });
        setShowImportConfirm(true);
      } catch (err) {
        setFeedbackMsg({
          text: err instanceof Error ? err.message : 'Не удалось прочитать выбранный файл',
          type: 'error',
        });
        setSelectedFile(null);
        setParsedPreview(null);
        setShowImportConfirm(false);
      } finally {
        setIsImporting(false);
      }
    }
    e.target.value = '';
  };

  const handleExecuteImport = async (mode: 'merge' | 'replace') => {
    if (!selectedFile) return;
    try {
      setIsImporting(true);
      await onImportBackup(selectedFile, mode);
      setShowImportConfirm(false);
      setSelectedFile(null);
      setFeedbackMsg({
        text: mode === 'replace' ? 'Все тетради успешно заменены из копии!' : 'Тетради успешно добавлены!',
        type: 'success',
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err) {
      setFeedbackMsg({
        text: err instanceof Error ? err.message : 'Ошибка при импорте резервной копии',
        type: 'error',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const isDark = settings.theme === 'dark';

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <div>
            <h3 className="font-semibold text-base text-neutral-900 dark:text-white">
              Настройки приложения
            </h3>
            <p className="text-[11px] text-neutral-400">
              Локальное хранилище и параметры Noto
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="py-4 space-y-5 text-xs text-neutral-600 dark:text-neutral-300 overflow-y-auto flex-1 pr-1">
          
          {/* Feedback banner */}
          {feedbackMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              feedbackMsg.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}>
              {feedbackMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* Backup & Restore section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900 dark:text-white text-xs uppercase tracking-wider text-[11px]">
                Резервное копирование и перенос
              </span>
              <span className="text-[10px] text-neutral-400">
                Всего тетрадей: {notebooks.filter(n => !n.deleted).length}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-800/40 space-y-3">
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
                Экспортируйте все ваши конспекты, формулы, страницы и рисунки в один файл для сохранения или переноса между ПК и телефоном без использования сторонних облаков.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* Export Button */}
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="px-3.5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Экспорт...' : 'Экспорт всех тетрадей'}</span>
                </button>

                {/* Import Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 font-medium text-xs flex items-center justify-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 text-neutral-500" />
                  <span>{isImporting ? 'Чтение...' : 'Импорт из файла'}</span>
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".noto,.notobackup,.json,application/json"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Confirmation modal / block when importing */}
              {showImportConfirm && selectedFile && (
                <div className="mt-3 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 space-y-2.5">
                  <div className="flex items-center gap-2 font-medium text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Файл выбран: {selectedFile.name} (обнаружено тетрадей: {parsedPreview?.count || 1})</span>
                  </div>
                  <div className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/80 space-y-1">
                    <p>Выберите режим импорта:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-[10.5px]">
                      <li><b>Добавить к существующим:</b> будет добавлено <b>+{parsedPreview?.count || 1}</b> тетрадей к текущим {notebooks.filter(n => !n.deleted).length}.</li>
                      <li><b>Заменить все тетради:</b> будет удалено <b>{notebooks.filter(n => !n.deleted).length}</b> текущих тетрадей и загружено <b>{parsedPreview?.count || 1}</b> тетрадей из файла (с автосохранением снимка отката).</li>
                    </ul>
                  </div>
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      onClick={() => handleExecuteImport('merge')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] transition-colors cursor-pointer"
                    >
                      Добавить (+{parsedPreview?.count || 1})
                    </button>
                    <button
                      onClick={() => handleExecuteImport('replace')}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-[11px] transition-colors cursor-pointer"
                    >
                      Заменить (удалить {notebooks.filter(n => !n.deleted).length}, добавить {parsedPreview?.count || 1})
                    </button>
                    <button
                      onClick={() => {
                        setShowImportConfirm(false);
                        setSelectedFile(null);
                        setParsedPreview(null);
                      }}
                      className="px-2.5 py-1.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white text-[11px] cursor-pointer"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Theme appearance section */}
          <section className="space-y-2">
            <span className="font-semibold text-neutral-900 dark:text-white text-xs uppercase tracking-wider text-[11px]">
              Внешний вид
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
                className={`flex-1 p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  settings.theme === 'light'
                    ? 'border-[#6355C7] bg-[#EFEAFD]/50 text-[#6355C7] font-semibold dark:bg-neutral-800'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Светлая</span>
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
                className={`flex-1 p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  settings.theme === 'dark'
                    ? 'border-[#6355C7] bg-[#252238] text-[#A79AF3] font-semibold'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Тёмная</span>
              </button>
            </div>
          </section>

          {/* Canvas & Inking Settings */}
          <section className="space-y-2.5">
            <span className="font-semibold text-neutral-900 dark:text-white text-xs uppercase tracking-wider text-[11px]">
              Перо и рисование
            </span>
            <div className="p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-800/40 space-y-2.5">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                    Чувствительность к нажиму стилуса
                  </span>
                  <p className="text-[11px] text-neutral-400">
                    S-Pen, Apple Pencil и графические планшеты Wacom
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.pressureSensitivity}
                  onChange={(e) => onUpdateSettings({ ...settings, pressureSensitivity: e.target.checked })}
                  className="rounded text-[#6355C7] focus:ring-[#6355C7] w-4 h-4"
                />
              </label>

              <div className="border-t border-neutral-200/50 dark:border-neutral-700/50 pt-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                      Сглаживание штрихов (Катмулл-Ром)
                    </span>
                    <p className="text-[11px] text-neutral-400">
                      Устраняет дрожание линий при быстром письме
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.smoothingEnabled}
                    onChange={(e) => onUpdateSettings({ ...settings, smoothingEnabled: e.target.checked })}
                    className="rounded text-[#6355C7] focus:ring-[#6355C7] w-4 h-4"
                  />
                </label>
              </div>
            </div>
          </section>

          {/* Security & Local Storage Info */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 text-[11px]">
            <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <span>
              Все записи сохраняются локально на этом устройстве (SQLite на Android, IndexedDB на ПК).
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-3 border-t border-neutral-100 dark:border-neutral-800 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-xs font-medium cursor-pointer hover:opacity-90"
          >
            Готово
          </button>
        </div>

      </div>
    </div>
  );
};
