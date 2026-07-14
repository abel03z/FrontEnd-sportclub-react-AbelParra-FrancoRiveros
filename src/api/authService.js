import axiosClient from "./axiosClient";

// Mismo contrato que ya usa tu login.js: la API responde
// { ok, message, data: { user, token } }
export async function loginRequest(email, password) {
  const response = await axiosClient.post("/auth/login", { email, password });
  return response.data;
}

export async function registerRequest(payload) {
  const response = await axiosClient.post("/auth/register", payload);
  return response.data;
}

export async function getProfileRequest() {
  const response = await axiosClient.get("/auth/me");
  // El backend puede responder { data: {...usuario} } o { data: { user: {...usuario} } }
  return response.data.data?.user || response.data.data || response.data;
}

export async function updateProfileRequest(payload) {
  const response = await axiosClient.put("/auth/me", payload);
  return response.data;
}
