import axiosClient from "./axiosClient";

export async function getSports() {
  const response = await axiosClient.get("/sports");
  return response.data.data;
}

export async function createSport(payload) {
  const response = await axiosClient.post("/sports", payload);
  return response.data;
}

export async function updateSport(id, payload) {
  const response = await axiosClient.put(`/sports/${id}`, payload);
  return response.data;
}

export async function deleteSport(id) {
  const response = await axiosClient.delete(`/sports/${id}`);
  return response.data;
}
