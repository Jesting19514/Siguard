const { contextBridge, ipcRenderer, ipcMain } = require("electron");
const axios = require("axios");
const { format, parse, parseISO } = require("date-fns");

//const url = "http://212.1.213.32:8080";
//const url = "http://localhost:8080";

//Configuracion de axios
// Crea una instancia de Axios
const apiClient = axios.create({
  baseURL: "http://212.1.213.32:8080", // Cambia esta URL según tu API
  timeout: 5000,
});
// Interceptor para agregar el token en los headers
apiClient.interceptors.request.use(
  async (config) => {
    // Define las rutas públicas
    const publicRoutes = ["/auth/login"];

    // Si la URL es una ruta pública, no agregamos el token
    if (!publicRoutes.includes(config.url)) {
      const token = await ipcRenderer.invoke("obtenToken"); // Obten el token de electron-store
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
//Funciones Sebastián
contextBridge.exposeInMainWorld("authentication", {
  login: async (username, password) => {
    try {
      if (!navigator.onLine) {
        throw new Error("Sin conexión a Internet");
      }
      //Realiza peticion para obtener el Rol
      const user = { username: username, password: password };
      const response = await apiClient.post(`/auth/login`, user);

      ipcRenderer.send("guardaToken", response.data.jwtToken);

      await ipcRenderer.invoke("check-role");
    } catch (error) {
      if (error.message === "Sin conexión a Internet") {
        return "Sin conexión a Internet, conectate y vuelve a intentar";
      } else {
        return "Credenciales Incorrectas";
      }
    }
  },
  obtenToken: async () => {
    return await ipcRenderer.invoke("obtenToken");
  },
  borraSesion: () => {
    ipcRenderer.send("logout");
  },
});
contextBridge.exposeInMainWorld("guarderia", {
  //ADMIN
  //Obtiene todas las guarderias
  getAll: async () => {
    try {
      // Realizar la petición GET con Axios
      const response = await apiClient.get(`/guarderia/all`);
      // Manejar la respuesta
      return response.data; // Devuelve los datos al renderizador
    } catch (error) {
      console.error("Error en la petición GET:", error);
      return { error: "Error en la petición" }; // Maneja el error
    }
  },
  //ADMIN
  //Obtiene la guarderia mediante el id enviado
  getById: async (id) => {
    try {
      // Realizar la petición GET con Axios
      const response = await apiClient.get(`/guarderia/${id}`);
      // Manejar la respuesta
      return response.data; // Devuelve los datos al renderizador
    } catch (error) {
      console.error("Error en la petición GET:", error);
      return { error: "Error en la petición" }; // Maneja el error
    }
  },
  //ADMIN
  //Agrega una Guarderia, SOLO ADMIN
  add: async (idGuard, nombreGuard, idGerent, fechIn, fechFin) => {
    try {
      guarderiaJson = {
        idGuarderia: idGuard,
        nombreGuarderia: nombreGuard,
        idGerente: idGerent,
        fechaInicioContrato: fechIn,
        fechaFinContrato: fechFin,
      };
      const response = await apiClient.post(`/guarderia/add`, guarderiaJson); // Realizar la petición GET con Axios
      return response.data; // Devuelve los datos al renderizador
    } catch (error) {
      console.error("Error en la petición POST:", error);
      return { error: error.message }; // Maneja el error
    }
  },
  //ADMIN
  //Elimina guarderia
  deleteById: async (idGuarderia) => {
    try {
      const response = await apiClient.post(`/guarderia/delete/${idGuarderia}`);
      return response.data;
    } catch (error) {
      return error.message;
    }
  },
  //ADMIN
  //Actualiza fecha o nombre de la guarderia
  actGuardContra: async (idGuard, nuevoNombreGuard, nuevasFechas) => {
    let actualiza = {
      id: idGuard,
      nuevoNombre: nuevoNombreGuard,
      nuevasFechas: nuevasFechas,
    };
    try {
      const response = await apiClient.patch(
        `/guarderia/actGuardContrato`,
        actualiza
      );
      return response.data;
    } catch (error) {
      return error.message;
    }
  },
  //GERENTE
  //Encuentra la Guarderia del GERENTE
  guardByTokenGerente: async () => {
    try {
      const response = await apiClient.get(
        `/guarderia/guarderiaByTokenGerente`
      );
      return response.data;
    } catch (error) {
      return error.message;
    }
  },
});

contextBridge.exposeInMainWorld("usuario", {
  //ADMIN
  //Agrega un Gerente
  addGerente: async (nombre, email, password) => {
    const usuario = { nombre: nombre, email: email, password: password };
    try {
      const response = await apiClient.post(`/usuario/addGerente`, usuario);
      return response.data;
    } catch (error) {
      return { error: error.message };
    }
  },
  //ADMIN
  //Elimina un Gerente
  deleteGerente: async (idGerente) => {
    try {
      const reponse = await apiClient.delete(
        `/usuario/deleteGerente/${idGerente}`
      );
      return response.data;
    } catch (error) {
      return { error: error.message };
    }
  },
  //ADMIN
  //Trae la lista de Gerentes
  listGerentes: () => {
    try {
      const response = apiClient.get(`/usuario/listGerentes`);
      return response.data;
    } catch (error) {
      return { error: error.message };
    }
  },
});
contextBridge.exposeInMainWorld("documento", {
  //GERENTE
  updateDateDoc: async (idDocumento, fechInicio, fechFin) => {
    try {
      let docDto = {
        idDocumento: idDocumento,
        fechInicio: fechInicio,
        fechFin: fechFin,
      };
      const response = await apiClient.patch(`/documento/modifica"`, docDto);
      return response.data;
    } catch (error) {
      return { error: error.message };
    }
  },
});

contextBridge.exposeInMainWorld("fechas", {
  //GERENTE
  aNormal: (fechaBD) => {
    // Convertir la cadena en formato año/mes/día a un objeto Date
    const fecha = parse(fechaBD, "yyyy-MM-dd", new Date());
    // Formatear a día/mes/año
    return format(fecha, "dd-MM-yyyy");
  },
  aDB: (fechaNormal) => {
    const fecha = parse(fechaNormal, "dd-MM-yyyy", new Date());
    return format(fecha, "yyyy-MM-dd");
  },
});

/*
contextBridge.exposeInMainWorld("documento", {
  modifica: async () => {
    try {
      const reponst = await axios.post;
    } catch (error) {}
  },
  getAll: async () => {
    try {
      const reponst = await axios.post;
    } catch (error) {}
  },
});
/*
contextBridge.exposeInMainWorld("contrato", {
  getById: async () => {
    try {
      const reponst = await axios.post;
    } catch (error) {}
  },
});*/

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel, data) => {
    const validChannels = ["send-notification", "login"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  on: (channel, callback) => {
    const validChannels = ["login-failed"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },
});
