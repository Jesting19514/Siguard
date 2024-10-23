const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

let mainWindow;

const serverApp = express();
const port = 3000;
serverApp.use(express.json());

const uri = 'mongodb+srv://jestgx:xRvHh597z2ouTGbC@siguard.dcen2.mongodb.net/?retryWrites=true&w=majority&appName=Siguard';
const client = new MongoClient(uri);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Conectado a la base de datos');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
}

async function closeDatabase() {
    await client.close();
    console.log('Conexión a la base de datos cerrada');
}

// Rutas
serverApp.get('/api/daycares', async (req, res) => {
    try {
        const database = client.db("siguard");
        const collection = database.collection("guarderias");
        const daycares = await collection.find({}).toArray();
        res.json(daycares);
    } catch (error) {
        console.error('Error al obtener las guarderías:', error);
        res.status(500).json({ error: 'Error al obtener las guarderías' });
    }
});

serverApp.get('/api/documents', async (req, res) => {
    try {
        const database = client.db("siguard");
        const collection = database.collection("documentos");
        const documents = await collection.find({}).toArray();
        res.json(documents);
    } catch (error) {
        console.error('Error al obtener los documentos:', error);
        res.status(500).json({ error: 'Error al obtener los documentos' });
    }
});

// Otras rutas...

serverApp.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

// Función para crear la ventana principal
function createWindow() {
    mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false
        },
    });

    mainWindow.loadFile('src/views/adminguarCon.html');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

// Manejo de notificaciones
ipcMain.on('send-notification', (event, title, body) => {
    const notification = new Notification({
        title: title,
        body: body,
        icon: path.join(__dirname, '../../assets/icon.png')
    });

    notification.show();
});

// Iniciar la aplicación
app.on('ready', async () => {
    await connectToDatabase();
    createWindow();
});

app.on('before-quit', async () => {
    await closeDatabase();
});

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