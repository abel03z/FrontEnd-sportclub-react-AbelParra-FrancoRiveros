import axiosClient from "./axiosClient";

export async function getRooms() {
  const response = await axiosClient.get("/rooms");
  return response.data.data;
}

export async function createRoom(payload) {
  const response = await axiosClient.post("/rooms", payload);
  return response.data;
}

export async function updateRoom(id, payload) {
  const response = await axiosClient.put(`/rooms/${id}`, payload);
  return response.data;
}

export async function deleteRoom(id) {
  const response = await axiosClient.delete(`/rooms/${id}`);
  return response.data;
}
