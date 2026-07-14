import axiosClient from "./axiosClient";

export async function getMemberDashboard() {
  const response = await axiosClient.get("/member/dashboard");
  return response.data.data;
}

export async function getAvailableClasses() {
  const response = await axiosClient.get("/member/classes");
  return response.data.data;
}

export async function getClassDetail(id) {
  const response = await axiosClient.get(`/member/classes/${id}`);
  return response.data.data;
}
