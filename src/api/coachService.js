import axiosClient from "./axiosClient";

export async function getCoachDashboard() {
  const response = await axiosClient.get("/coach/dashboard");
  return response.data.data;
}

export async function getMyClasses() {
  const response = await axiosClient.get("/coach/my-classes");
  return response.data.data;
}

export async function getMySchedules() {
  const response = await axiosClient.get("/coach/my-schedules");
  return response.data.data;
}

export async function getMyRooms() {
  const response = await axiosClient.get("/coach/my-rooms");
  return response.data.data;
}
