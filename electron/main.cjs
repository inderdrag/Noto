const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

function createWindow() {
  const iconPath = path.join(__dirname, '../build/icon.png');
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'Noto',
    icon: iconPath,
    backgroundColor: '#0E0F14',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // Load the built Vite production app
  const indexPath = path.join(__dirname, '../dist/index.html');
  mainWindow.loadFile(indexPath);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Graceful window close: wait for pending saves to finish before destroying window
  let isClosing = false;
  mainWindow.on('close', (e) => {
    if (!isClosing) {
      e.preventDefault();
      isClosing = true;
      mainWindow.webContents
        .executeJavaScript('window.__NOTO_FLUSH_SAVE__ ? window.__NOTO_FLUSH_SAVE__() : Promise.resolve()')
        .catch(() => {})
        .finally(() => {
          mainWindow.destroy();
        });

      // Fallback safety timeout (1200ms)
      setTimeout(() => {
        if (!mainWindow.isDestroyed()) {
          mainWindow.destroy();
        }
      }, 1200);
    }
  });

  // Open external links in user's default browser only for http/https
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Prevent in-window navigation to external web pages
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault();
      if (url.startsWith('https://') || url.startsWith('http://')) {
        shell.openExternal(url);
      }
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
