import axios from "axios";
// Crea una instancia de Axios
const apiClient = axios.create({
  baseURL: "http://212.1.213.32:8080", // Cambia esta URL según tu API
  timeout: 5000,
});
// Interceptor para agregar el token en los headers
apiClient.interceptors.request.use(
  (config) => {
    // Define las rutas públicas
    const publicRoutes = ["/auth/login"];

    // Si la URL es una ruta pública, no agregamos el token
    if (!publicRoutes.includes(config.url)) {
      const token = store.get("token"); // Obten el token de electron-store
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
