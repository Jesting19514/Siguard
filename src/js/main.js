import { app, BrowserWindow, ipcMain, Notification } from "electron";
import express from "express";
import { fileURLToPath } from "url";
import { MongoClient, ObjectId } from "mongodb";
import path, { dirname, join } from "path";
//Token
import Store from "electron-store";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const store = new Store();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;
let loginWindow;

const serverApp = express();
const port = 3000;

serverApp.use(express.json());

const uri =
  "mongodb+srv://jestgx:xRvHh597z2ouTGbC@siguard.dcen2.mongodb.net/?retryWrites=true&w=majority&appName=Siguard";
const client = new MongoClient(uri);

serverApp.get("/api/daycares", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("siguard");
    const collection = database.collection("guarderias");
    const daycares = await collection.find({}).toArray();
    res.json(daycares);
  } catch (error) {
    console.error("Error al obtener las guarderías:", error);
    res.status(500).json({ error: "Error al obtener las guarderías" });
  } finally {
    await client.close();
  }
});

serverApp.put("/api/daycares/:id", async (req, res) => {
  const { id } = req.params;
  const { razon_social, fecha_inicio, fecha_termino, num_guarderia } = req.body;

  try {
    await client.connect();
    const database = client.db("siguard");
    const collection = database.collection("guarderias");

    const result = await collection.updateOne(
      { _id: id },
      {
        $set: {
          razon_social: razon_social,
          fecha_inicio: new Date(fecha_inicio),
          fecha_termino: new Date(fecha_termino),
          num_guarderia: num_guarderia, // Agregar el campo num_guarderia
        },
      }
    );

    if (result.modifiedCount === 1) {
      res.json({
        success: true,
        message: "Guardería actualizada correctamente.",
      });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Guardería no encontrada." });
    }
  } catch (error) {
    console.error("Error al actualizar la guardería:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al actualizar la guardería." });
  } finally {
    await client.close();
  }
});

serverApp.delete("/api/daycares/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await client.connect();
    const database = client.db("siguard");
    const collection = database.collection("guarderias");

    const result = await collection.deleteOne({ _id: id });

    if (result.deletedCount === 1) {
      res.json({
        success: true,
        message: "Guardería eliminada correctamente.",
      });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Guardería no encontrada." });
    }
  } catch (error) {
    console.error("Error al eliminar la guardería:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al eliminar la guardería." });
  } finally {
    await client.close();
  }
});
serverApp.post("/api/daycares", async (req, res) => {
  const {
    _id,
    razon_social,
    id_usuario_gerente,
    fecha_inicio,
    fecha_termino,
    num_guarderia,
  } = req.body;

  try {
    await client.connect();
    const database = client.db("siguard");
    const collection = database.collection("guarderias");

    const result = await collection.insertOne({
      _id: _id,
      razon_social: razon_social,
      id_usuario_gerente: id_usuario_gerente,
      fecha_inicio: new Date(fecha_inicio), // Convertir a Date
      fecha_termino: new Date(fecha_termino), // Convertir a Date
      num_guarderia: num_guarderia, // Agregar el campo num_guarderia
    });

    res.json({
      success: true,
      message: "Guardería agregada correctamente.",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Error al agregar la guardería:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al agregar la guardería." });
  } finally {
    await client.close();
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

async function createWindow() {
  loginWindow = new BrowserWindow({
    autoHideMenuBar: false,
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
      preload: join(__dirname, "preload.cjs"),
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });
  //await logicaInicio();
  loginWindow.loadFile("src/views/login.html");
  //mainWindow.loadFile("src/views/adminMenuPrincipal.html");

  loginWindow.on("closed", function () {
    mainWindow = null;
  });
}

ipcMain.on("send-notification", (event, { title, body }) => {
  if (typeof body === "undefined") {
    console.error("El cuerpo de la notificación es undefined");
    body = "Sin contenido";
  }

  const notification = new Notification({
    title: title,
    body: body,
    icon: path.join(__dirname, "../../assets/images/imss_logo.png"),
    silent: false,
  });

  notification.show();
});
//IPC Cerrar Sesion
ipcMain.on("logout", () => {
  store.clear();
  loginWindow.loadFile("src/views/login.html");
});
// IPC electron-store
ipcMain.handle("obtenToken", async (event) => {
  const res = store.get("jwtToken");
  if (res) {
    return res;
  } else {
    return "¡El token ya fue eliminado!";
  }
});
ipcMain.on("guardaToken", async (event, val) => {
  store.set("jwtToken", val);
});
ipcMain.on("obtenToken", async (event, val) => {
  event.returnValue = jwtDecode(store.get(val));
});
function handleUserRole() {
  try {
    const decodedToken = jwtDecode(store.get("jwtToken"));
    const userRole = decodedToken.authorities;
    switch (userRole) {
      case "ADMINISTRADOR":
      case "DEVELOPER":
        loginWindow.loadFile("src/views/adminMenuPrincipal.html");
        break;
      case "GERENTE":
        loginWindow.loadFile("src/views/reportes.html");
        break;
    }
  } catch (error) {
    console.log(error);
  }
}

const logicaInicio = async () => {
  const token = store.get("jwtToken");
  if (token) {
    const tokenDto = { jwtToken: token };
    try {
      await axios.post("http://212.1.213.32:8080/auth/tokenStatus", tokenDto);
      handleUserRole();
    } catch (error) {
      loginWindow.loadFile("src/views/login.html");
    }
  } else loginWindow.loadFile("src/views/login.html");
};

ipcMain.handle("check-role", (event) => {
  try {
    handleUserRole();
  } catch (error) {
    console.log(error);
  }
});

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});
