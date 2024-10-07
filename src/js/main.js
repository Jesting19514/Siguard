const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

let mainWindow;

// Configura el servidor Express
const serverApp = express();
const port = 3000;

// Middleware para manejar JSON
serverApp.use(express.json());

// Conexión a la base de datos
const uri = 'mongodb+srv://jestgx:xRvHh597z2ouTGbC@siguard.dcen2.mongodb.net/?retryWrites=true&w=majority&appName=Siguard';
const client = new MongoClient(uri);

// Aquí agrega las rutas de tu servidor (ej. API para guarderías)
serverApp.get('/api/daycares', async (req, res) => {
    try {
        await client.connect();
        const database = client.db("siguard");
        const collection = database.collection("guarderias");
        const daycares = await collection.find({}).toArray();
        res.json(daycares);
    } catch (error) {
        console.error('Error al obtener las guarderías:', error);
        res.status(500).json({ error: 'Error al obtener las guarderías' });
    } finally {
        await client.close();
    }
});

// Inicia el servidor
serverApp.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

// Función para crear la ventana principal de la aplicación
function createWindow() {
    mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        width: 1920,
        height: 1080,
        webPreferences: {
            
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'), // Cambia a path.join para mayor portabilidad
            contextIsolation: true,
            enableRemoteModule: false
        },
    });

    mainWindow.loadFile('src/views/adminMenuPrincipal.html');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

// Manejo de notificaciones
ipcMain.on('send-notification', (event, title, body) => {
    console.log(`Título: ${title}, Cuerpo: ${body}`);

    const notification = new Notification({
        title: title,
        body: body,
        icon: path.join(__dirname, '../../assets/icon.png')
    });

    notification.show();
});

// Iniciar la aplicación y la ventana
app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

