import axiosClient from "./axiosClient";

export async function getMyReservations() {
  const response = await axiosClient.get("/reservations/my-reservations");
  return response.data.data;
}

export async function createReservation(classScheduleId) {
  const response = await axiosClient.post("/reservations", {
    class_schedule_id: classScheduleId,
  });
  return response.data;
}

export async function cancelReservation(id) {
  const response = await axiosClient.patch(`/reservations/${id}/cancel`);
  return response.data;
}
