import axiosClient from "./axiosClient";

export async function getUsers() {
  const response = await axiosClient.get("/users");
  return response.data.data; // array de usuarios
}

export async function createUser(payload) {
  const response = await axiosClient.post("/users", payload);
  return response.data;
}

export async function updateUser(id, payload) {
  const response = await axiosClient.put(`/users/${id}`, payload);
  return response.data;
}

export async function deleteUser(id) {
  const response = await axiosClient.delete(`/users/${id}`);
  return response.data;
}
