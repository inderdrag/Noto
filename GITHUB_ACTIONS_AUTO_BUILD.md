# 🤖 GitHub Actions - Автоматическая сборка релизов

## ✅ Что было настроено

Создан GitHub Actions workflow файл:
```
.github/workflows/build-release.yml
```

Этот файл автоматически:
1. **Ловит создание тега** (когда вы создаёте `v1.0.0`)
2. **Собирает на разных ОС**:
   - Windows → `.exe`
   - macOS → `.dmg`
   - Linux/Web → `.tar.gz`
   - Android → `.apk`
3. **Загружает файлы в Releases**

---

## 🚀 Как это работает

### Шаг 1: Коммитим и тегируем

```bash
git add src/ui/EditorWorkspace.tsx
git commit -m "perf: Fix rendering lag"
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin main
git push origin v1.0.0
```

### Шаг 2: GitHub Actions срабатывает

Когда вы пушите тег `v1.0.0`:
- 🟢 Запускается workflow
- 📦 Собирает все платформы параллельно
- 📤 Загружает файлы в Release автоматически

### Шаг 3: Проверяете на GitHub

Откройте: https://github.com/indebraag/noto/releases
- ✅ Будут файлы `.exe`, `.dmg`, `.apk`, `.tar.gz`
- ✅ Все автоматически загружены

---

## 📋 Что собирается

После срабатывания workflow в Release будут:

```
📦 Релиз v1.0.0
├── 📄 noto-1.0.0-web.tar.gz (Web версия)
├── 💻 noto-1.0.0.exe (Windows)
├── 🍎 noto-1.0.0.dmg (macOS)
└── 📱 noto-1.0.0.apk (Android)
```

---

## ⚙️ Требования

Для того чтобы это работало, нужны скрипты в package.json:

```json
{
  "scripts": {
    "build": "vite build",
    "build:electron:win": "npm run build && electron-builder --win",
    "build:electron:mac": "npm run build && electron-builder --mac",
    "build:android": "npm run build && capacitor build android"
  }
}
```

**Проверьте что они есть в вашем package.json!**

---

## 🔍 Статус сборки

Смотрите на GitHub:
1. Откройте репозиторий: https://github.com/indebraag/noto
2. Нажмите: **Actions** вверху
3. Видите workflow процесс в реальном времени
4. Если ✅ зелёно - успешно
5. Если ❌ красно - ошибка (посмотрите логи)

---

## 🐛 Если что-то не работает

### ❌ "Build failed" в Actions

1. Откройте Actions → нужный workflow
2. Нажмите на job который упал
3. Посмотрите "Run build X" → красные строки
4. Обычно причины:
   - Нет зависимости (npm install ошибка)
   - Синтаксическая ошибка в коде
   - Electron/Android SDK не установлен

**Решение**: Исправьте ошибку локально, затем пушьте новый тег

### ❌ Файлы не загружаются в Release

- Проверьте что workflow прошёл до конца (статус: ✅)
- Обновите страницу Release (F5)
- Если файлы не появились - посмотрите логи workflow

### ❌ "workflow file not found"

Значит файл `.github/workflows/build-release.yml` не запушен на GitHub:
```bash
git add .github/workflows/build-release.yml
git commit -m "Add GitHub Actions workflow"
git push origin main
```

---

## 📝 Полный процесс с нуля

### 1. Убедитесь что всё готово

```bash
# Проверьте что package.json содержит скрипты:
grep -A 5 '"scripts"' package.json

# Должны быть:
# "build": "...",
# "build:electron:win": "...",
# "build:electron:mac": "...",
# "build:android": "..."
```

### 2. Проверьте что workflow файл есть

```bash
ls -la .github/workflows/build-release.yml
# Должен выдать файл (не "cannot access")
```

### 3. Пушьте workflow на GitHub

```bash
git add .github/workflows/build-release.yml
git commit -m "Add GitHub Actions auto-build workflow"
git push origin main
```

### 4. Проверьте на GitHub

Откройте: https://github.com/indebraag/noto/actions
- Должен появиться workflow файл

### 5. Создайте релиз

```bash
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
```

### 6. Смотрите как собирается

Откройте Actions → видите процесс в реальном времени

### 7. Проверьте Release

Откройте Releases → должны быть файлы

---

## 🎯 Ключевые моменты

✅ **Всё автоматически**, когда вы:
- Создаёте тег `v1.0.0`
- Пушите его на GitHub

❌ **Не требует ручной работы**:
- Не нужно собирать вручную
- Не нужно загружать файлы вручную
- Просто создайте тег → готово!

⏱️ **Время сборки**: 5-10 минут (зависит от размера)

🔄 **Может быть использовано повторно**: каждый раз когда создаёте новый тег

---

## 📊 Что происходит внутри

```
Вы пушите тег v1.0.0
        ↓
GitHub Actions срабатывает
        ↓
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  Windows    │   macOS     │   Linux/Web │   Android   │
│  сборка     │   сборка    │   сборка    │   сборка    │
│  (параллель)│ (параллель) │ (параллель) │ (параллель) │
└─────────────┴─────────────┴─────────────┴─────────────┘
        ↓
  Все готовы
        ↓
  Загружаются в Release
        ↓
  ✅ Готово! На GitHub:
     • noto-1.0.0.exe
     • noto-1.0.0.dmg
     • noto-1.0.0.apk
     • noto-1.0.0-web.tar.gz
```

---

## 🚀 Резюме

1. ✅ Workflow создан: `.github/workflows/build-release.yml`
2. ✅ Запушен на GitHub
3. ✅ Теперь: просто создавайте теги `v1.0.0` → автоматическая сборка
4. ✅ Файлы появляются в Release автоматически

**Больше никогда не собирайте вручную!** 🎉
