import { app, BrowserWindow, ipcMain, Notification } from "electron";

import { fileURLToPath } from "url";

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

async function createWindow() {
  loginWindow = new BrowserWindow({
    autoHideMenuBar: false,
    minWidth: 700,
    minHeight: 400,
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
async function handleUserRole() {
  try {
    const token = store.get("jwtToken");
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.authorities;
    switch (userRole) {
      case "ADMINISTRADOR":
      case "DEVELOPER":
        loginWindow.loadFile("src/views/adminMenuPrincipal.html");
        break;
      case "GERENTE":
        const response = await axios.get(
          "http://212.1.213.32:8080/guarderia/guarderiaByTokenGerente",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Incluye el token en el encabezado
            },
          }
        );
        const params = {
          idGuarderia: response.data.idGuarderia,
          nombreGuarderia: response.data.nombreGuarderia,
          fechaInicioContrato: response.data.fechaInicioContrato,
          fechaFinContrato: response.data.fechaFinContrato,
          documentos: response.data.documentos,
        };

        navigateTo("gerente.html", params); //asegurar mandar bien los params

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
      await handleUserRole();
    } catch (error) {
      loginWindow.loadFile("src/views/login.html");
    }
  } else loginWindow.loadFile("src/views/login.html");
};
ipcMain.handle("check-role", async (event) => {
  try {
    await handleUserRole();
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
//

// Función de navegación
function navigateTo(page, params) {
  //const pagePath = path.join(__dirname, `${page}.html`);
  loginWindow.loadFile(`src/views/${page}`);

  // Enviar los parámetros a la nueva página cuando termine de cargar
  loginWindow.webContents.once("did-finish-load", () => {
    if (params) {
      loginWindow.webContents.send("navigate-params", params);
    }
  });
}
//Exportamos navigateTo para que sea accesible desde preload.js
ipcMain.handle("navigate-to", (event, page, params) =>
  navigateTo(page, params)
);
