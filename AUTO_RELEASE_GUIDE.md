# ✅ Автоматический релиз с загрузкой файлов

## 🔧 Проблема и решение

**Было**: Workflow работал, но файлы не загружались в Release
**Теперь**: Файлы автоматически загружаются

## 🚀 Как пользоваться

### Шаг 1: Обновите workflow (уже готово)
```bash
# Workflow уже обновлён и запушен!
# Файл: .github/workflows/build-release.yml
```

### Шаг 2: Создайте новый релиз

```bash
# Убедитесь что всё на main:
git status  # должно быть "nothing to commit"

# Создайте тег
git tag -a v1.0.0 -m "Release 1.0.0 - Performance optimized"

# Пушьте тег
git push origin v1.0.0
```

### Шаг 3: Смотрите процесс

Откройте: https://github.com/indebraag/noto/actions
- Видите workflow запускается
- Ждите 5-10 минут

### Шаг 4: Проверьте Release

Откройте: https://github.com/indebraag/noto/releases/tag/v1.0.0
- ✅ Файлы должны быть загружены!

---

## 📋 Что происходит

```
git push tag v1.0.0
        ↓
GitHub Actions срабатывает
        ↓
├─ build-web: npm run build → dist/
├─ build-android: npm run build → dist/
        ↓
release job:
├─ Собирает все файлы
├─ Загружает в Release
        ↓
✅ ГОТОВО!
   На GitHub появляются файлы
```

---

## 🐛 Если всё ещё не работает

### 1. Проверьте что workflow файл обновлён

```bash
cat .github/workflows/build-release.yml | head -20
# Должны быть строки с upload-artifact и softprops/action-gh-release
```

### 2. Пушьте обновлённый workflow

```bash
git add .github/workflows/build-release.yml
git commit -m "Update workflow to upload files"
git push origin main
```

### 3. Создайте новый тег (старый уже запущен)

```bash
git tag -a v1.0.1 -m "Test release"
git push origin v1.0.1
```

### 4. Смотрите Actions логи

- https://github.com/indebraag/noto/actions
- Нажмите на последний workflow run
- Если красный - посмотрите ошибку в логах "release" job

---

## ✨ Итого

**Больше ничего делать не нужно!**

- ✅ Workflow готов
- ✅ Просто создавайте теги
- ✅ Файлы загружаются автоматически

**Следующий раз:**
```bash
git tag -a v1.0.1 -m "Next release"
git push origin v1.0.1
# Файлы появятся в Release автоматически через 5-10 минут
```

