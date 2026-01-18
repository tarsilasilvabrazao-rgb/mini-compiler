const { app, BrowserWindow } = require('electron');
const path = require('node:path');

// 🔥 HOT RELOAD
require('electron-reload')(__dirname, {
  electron: require('electron-reload')(__dirname)
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // DevTools
  mainWindow.webContents.openDevTools();
};

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

// IPC handler
const { ipcMain } = require('electron');
const compilerApi = require('../../../dist/api');

ipcMain.handle('compile-code', async (event, sourceCode) => {
  console.log("Recebendo código para compilar...");

  // Callback de input que será passado ao compilador
  const inputCallback = (prompt) => {
    return new Promise((resolve) => {
      // 1. Envia solicitação de input para a janela (Frontend)
      event.sender.send('input-request', prompt);

      // 2. Define um listener único para a resposta especifica
      // Nota: Em um app real, ideal tratar IDs para evitar colisão, mas simplificado aqui.
      const responseHandler = (evt, userInput) => {
        resolve(userInput);
        ipcMain.removeListener('input-response', responseHandler); // Limpa listener
      };

      ipcMain.on('input-response', responseHandler);
    });
  };

  try {
    const result = await compilerApi.executeCode(sourceCode, inputCallback);
    return result;
  } catch (error) {
    console.error("Erro na compilação:", error);
    return { output: [], errors: [error.message] };
  }
});
