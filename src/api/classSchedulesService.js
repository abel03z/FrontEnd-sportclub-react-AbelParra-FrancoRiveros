import axiosClient from "./axiosClient";

export async function getClassSchedules() {
  const response = await axiosClient.get("/class-schedules");
  return response.data.data;
}

export async function createClassSchedule(payload) {
  const response = await axiosClient.post("/class-schedules", payload);
  return response.data;
}

export async function updateClassSchedule(id, payload) {
  const response = await axiosClient.put(`/class-schedules/${id}`, payload);
  return response.data;
}

export async function deleteClassSchedule(id) {
  const response = await axiosClient.delete(`/class-schedules/${id}`);
  return response.data;
}
