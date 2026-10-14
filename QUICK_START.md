# ⚡ Быстрая инструкция (5 минут)

## Шаг 1: Клонирование
```bash
git clone https://github.com/indebraag/noto.git
cd noto
```

## Шаг 2: Распаковка архива
```bash
# Linux/Mac:
tar -xzf noto-performance-fixes.tar.gz -C ./

# Windows PowerShell:
tar -xzf noto-performance-fixes.tar.gz -C ./
```

## Шаг 3: Обновление версии
Откройте `package.json` и измените:
```json
"version": "1.0.0"
```

## Шаг 4: Сборка & Проверка
```bash
npm install
npm run build
```

## Шаг 5: Коммит
```bash
git add package.json src/ui/EditorWorkspace.tsx
git commit -m "perf: 3-5x FPS improvement during selection transform"
git push origin main
```

## Шаг 6: Удалить v1.0.1
Откройте https://github.com/indebraag/noto/releases
- Найдите Release 1.0.1
- Нажмите "..." и "Delete"

## Шаг 7: Создать Release v1.0.0
```bash
git tag -a v1.0.0 -m "Noto 1.0.0 - Performance Optimization"
git push origin v1.0.0
```

Откройте https://github.com/indebraag/noto/releases
- Нажмите "Draft a new release"
- Выберите tag `v1.0.0`
- Добавьте описание
- Загрузите APK (если есть)
- Нажмите "Publish"

## ✅ Готово!

Проверьте: https://github.com/indebraag/noto/releases

---

**Полная версия**: см. GITHUB_DEPLOYMENT_GUIDE.md
