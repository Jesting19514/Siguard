const { contextBridge, ipcRenderer } = require("electron");
const axios = require("axios");

const url = "http://212.1.213.32:8080";
//Función Erick
contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel, title, body) => {
    const validChannels = ["send-notification"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, { title, body });
    }
  },
});

/*
contextBridge.exposeInMainWorld("guarderia", {
  getById: async (id) => {
    try {
      // Realizar la petición GET con Axios
      const response = await axios.get(`${url}/guarderia/${id}`);
      // Manejar la respuesta
      return response.data; // Devuelve los datos al renderizador
    } catch (error) {
      console.error("Error en la petición GET:", error);
      return { error: "Error en la petición" }; // Maneja el error
    }
  },
  getAll: async () => {
    try {
      // Realizar la petición GET con Axios
      const response = await axios.get(`${url}/guarderia/all`);
      // Manejar la respuesta
      return response.data; // Devuelve los datos al renderizador
    } catch (error) {
      console.error("Error en la petición GET:", error);
      return { error: "Error en la petición" }; // Maneja el error
    }
  },
  add: async (guarderiaJson) => {
    try {
      // Realizar la petición GET con Axios
      const response = await axios.post(`${url}/guarderia/add`, guarderiaJson);

      // Manejar la respuesta
      return response.data; // Devuelve los datos al renderizador
    } catch (error) {
      console.error("Error en la petición GET:", error);
      return { error: "Error en la petición" }; // Maneja el error
    }
  },
});*/

contextBridge.exposeInMainWorld("authentication", {
  login: async (username, password) => {
    try {
      const user = { username: username, password: password };
      const response = await axios.post(`${url}/auth/login`, user);
      // Guarda el token como jwtToken
      store.set("jwtToken", response.data.jwtToken);
      await ipcRenderer.invoke("check-role");
    } catch (error) {
      return error;
    }
  },
  obtenToken: () => {
    return store.get("jwtToken");
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

contextBridge.exposeInMainWorld("contrato", {
  getById: async () => {
    try {
      const reponst = await axios.post;
    } catch (error) {}
  },
});*/

const store = {
  get(key) {
    return ipcRenderer.sendSync("electron-store-get", key);
  },
  set(property, val) {
    ipcRenderer.send("electron-store-set", property, val);
  },
  getTokenDecoded(key) {
    return ipcRenderer.sendSync("jwt-decoded-get", key);
  },
};
