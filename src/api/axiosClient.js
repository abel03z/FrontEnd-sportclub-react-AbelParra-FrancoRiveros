import axios from "axios";

// Centraliza la URL base. Configúrala en un archivo .env en la raíz del proyecto:
// VITE_API_URL=http://localhost:3000/api
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: agrega el token JWT a cada petición automáticamente,
// así no hay que repetir "Authorization: Bearer ..." en cada servicio.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta: si el token expira o es inválido (401),
// limpia la sesión y manda al login.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
