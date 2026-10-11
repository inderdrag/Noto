# Руководство по сборке и релизу Noto

## 1. Подготовка окружения

- **Node.js**: версия 20 или 22 LTS
- **npm**: версия 10+
- **Android Studio / Android SDK** (для Android-сборки):
  - Java JDK 21 (Temurin или OpenJDK)
  - Android SDK Platform 34+
  - Build-Tools 34+

## 2. Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера с горячей перезагрузкой
npm run dev
```

Dev-сервер откроется на `http://localhost:3000`.

## 3. Сборка десктопной версии (Electron Windows `.exe`)

```bash
# 1. Сборка веб-приложения
npm run build

# 2. Сборка инсталлятора Windows
npm run build:exe
```

Собранный файл будет находиться в папке `release/`:
- `release/Noto-Setup-1.0.1.exe`

## 4. Сборка мобильной версии (Android APK & AAB)

```bash
# 1. Сборка веб-бандла
npm run build

# 2. Синхронизация ассетов с нативным проектом Capacitor
npx cap sync android

# 3. Сборка релизного APK и AAB через Gradle
cd android
./gradlew assembleRelease bundleRelease
```

Собранные файлы:
- APK: `android/app/build/outputs/apk/release/app-release-unsigned.apk`
- AAB (для Google Play): `android/app/build/outputs/bundle/release/app-release.aab`

## 5. Публикация релиза на GitHub

1. Убедитесь, что все изменения закоммичены.
2. Создайте git-тег версии (например, `v1.0.1`):
   ```bash
   git tag -a v1.0.1 -m "Release v1.0.1"
   git push origin v1.0.1
   ```
3. GitHub Actions (`.github/workflows/build-and-release.yml`) автоматически:
   - Соберёт Windows инсталлятор `.exe`;
   - Соберёт и подпишет Android `.apk` и `.aab`;
   - Создаст единый GitHub Release со всеми прикреплёнными файлами.
