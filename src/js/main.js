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

async function connectMongoDB() {
    try {
        await client.connect();
        console.log('Conectado a MongoDB exitosamente');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error);
        process.exit(1); // Finaliza el proceso si no se puede conectar
    }
}

connectMongoDB(); // Conexión persistente al iniciar el servidor

// Rutas de la API

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

serverApp.put('/api/daycares/:id', async (req, res) => {
    const { id } = req.params;
    const { razon_social, fecha_inicio, fecha_termino, num_guarderia } = req.body;
    try {
        const database = client.db("siguard");
        const collection = database.collection("guarderias");
        const result = await collection.updateOne(
            { _id: id },  
            { $set: { 
                razon_social,
                fecha_inicio: new Date(fecha_inicio),
                fecha_termino: new Date(fecha_termino),
                num_guarderia 
            } }
        );
        if (result.modifiedCount === 1) {
            res.json({ success: true, message: 'Guardería actualizada correctamente.' });
        } else {
            res.status(404).json({ success: false, message: 'Guardería no encontrada.' });
        }
    } catch (error) {
        console.error('Error al actualizar la guardería:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar la guardería.' });
    }
});

serverApp.delete('/api/daycares/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const database = client.db("siguard");
        const collection = database.collection("guarderias");
        const result = await collection.deleteOne({ _id: id });
        if (result.deletedCount === 1) {
            res.json({ success: true, message: 'Guardería eliminada correctamente.' });
        } else {
            res.status(404).json({ success: false, message: 'Guardería no encontrada.' });
        }
    } catch (error) {
        console.error('Error al eliminar la guardería:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar la guardería.' });
    }
});

serverApp.post('/api/daycares', async (req, res) => {
    const { _id, razon_social, id_usuario_gerente, fecha_inicio, fecha_termino, num_guarderia } = req.body;
    try {
        const database = client.db("siguard");
        const collection = database.collection("guarderias");
        const result = await collection.insertOne({
            _id,
            razon_social,
            id_usuario_gerente,
            fecha_inicio: new Date(fecha_inicio),
            fecha_termino: new Date(fecha_termino),
            num_guarderia
        });
        res.json({ success: true, message: 'Guardería agregada correctamente.', id: result.insertedId });
    } catch (error) {
        console.error('Error al agregar la guardería:', error);
        res.status(500).json({ success: false, message: 'Error al agregar la guardería.' });
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

// Configuración del servidor de Express
serverApp.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

// Funciones de la aplicación de Electron
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
    mainWindow.loadFile('src/views/login.html');
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

ipcMain.on('send-notification', (event, { title, body }) => { 
    if (typeof body === 'undefined') {
        console.error("El cuerpo de la notificación es undefined");
        body = "Sin contenido"; 
    }
    const notification = new Notification({
        title,
        body,
        icon: path.join(__dirname, '../../assets/images/imss_logo.png'), 
        silent: false
    });
    notification.show();
});

ipcMain.on('login', async (event, { name, password }) => {
    try {
        const database = client.db("siguard");
        const collection = database.collection("usuarios");
        const user = await collection.findOne({ nombre: name, password });
        
        if (user) {
            if (user.id_roles === 1) {
                mainWindow.loadFile('src/views/adminMenuPrincipal.html');
            } else if (user.id_roles === 2) {
                mainWindow.loadFile('src/views/usuarioMenuPrincipalVentana.html');
            }
        } else {
            event.sender.send('login-failed', 'Credenciales incorrectas');
        }
    } catch (error) {
        console.error('Error durante la autenticación:', error);
        event.sender.send('login-failed', 'Error de autenticación');
    }
});

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

// Cierre ordenado de la conexión a MongoDB al cerrar la aplicación
process.on('SIGINT', async () => {
    await client.close();
    console.log('MongoDB desconectado');
    process.exit(0);
});
