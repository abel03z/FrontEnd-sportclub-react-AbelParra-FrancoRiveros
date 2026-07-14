import axiosClient from "./axiosClient";

export async function getSportRooms() {
  const response = await axiosClient.get("/sport-rooms");
  return response.data.data;
}

export async function createSportRoom(payload) {
  const response = await axiosClient.post("/sport-rooms", payload);
  return response.data;
}

export async function updateSportRoom(id, payload) {
  const response = await axiosClient.put(`/sport-rooms/${id}`, payload);
  return response.data;
}

export async function deleteSportRoom(id) {
  const response = await axiosClient.delete(`/sport-rooms/${id}`);
  return response.data;
}
