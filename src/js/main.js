const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const dotenv = require('dotenv');
const { createServer } = require('../../backend/server');

dotenv.config();

let mainWindow;
let backend;
const backendUrl = `http://localhost:${process.env.BACKEND_PORT || 3000}`;

function createWindow() {
  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadFile('src/views/login.html');
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.on('send-notification', (event, { title, body }) => {
  const notification = new Notification({
    title,
    body: body || 'Sin contenido',
    icon: path.join(__dirname, '../../assets/images/icon.ico'),
    silent: false,
  });
  notification.show();
});

ipcMain.on('login', async (event, { name, password }) => {
  try {
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
    });

    if (!response.ok) {
      event.sender.send('login-failed', 'Credenciales incorrectas');
      return;
    }

    const payload = await response.json();
    if (payload.roleId === 1) {
      mainWindow.loadFile('src/views/adminMenuPrincipal.html');
    } else if (payload.roleId === 2) {
      const daycareId = payload.daycare?._id ? String(payload.daycare._id) : '';
      mainWindow.loadFile('src/views/usuarioMenuPrincipalVentana.html', {
        query: { daycareId },
      });
    } else {
      event.sender.send('login-failed', 'Rol no reconocido');
    }
  } catch (error) {
    console.error('Error durante la autenticación:', error);
    event.sender.send('login-failed', 'Error de autenticación');
  }
});

app.whenReady().then(async () => {
  try {
    backend = await createServer();
    createWindow();
  } catch (error) {
    console.error('No se pudo iniciar el backend:', error);
    app.quit();
  }
});

app.on('window-all-closed', async () => {
  if (backend) {
    await backend.shutdown();
    backend = null;
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  if (backend) {
    await backend.shutdown();
    backend = null;
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
