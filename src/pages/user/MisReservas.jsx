import { useState, useEffect } from "react";
import { Table, Button, Badge, Card } from "react-bootstrap";
import Swal from "sweetalert2";
import { getMyReservations, cancelReservation } from "../../api/reservationsService";

const DAY_LABELS = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

const STATUS_BADGE = {
  active: "success",
  confirmed: "success",
  cancelled: "secondary",
  canceled: "secondary",
};

export default function MisReservas() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    loadReservations();
  }, []);

  async function loadReservations() {
    setLoading(true);
    try {
      const data = await getMyReservations();
      setReservations(data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudieron cargar tus reservas",
        text: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(reservation) {
    const result = await Swal.fire({
      icon: "warning",
      title: "¿Cancelar esta reserva?",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Volver",
      confirmButtonColor: "#e63946",
    });

    if (!result.isConfirmed) return;

    setCancelingId(reservation.id);
    try {
      await cancelReservation(reservation.id);
      Swal.fire({
        icon: "success",
        title: "Reserva cancelada",
        timer: 1200,
        showConfirmButton: false,
      });
      loadReservations();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo cancelar",
        text: error.response?.data?.message || error.message,
      });
    } finally {
      setCancelingId(null);
    }
  }

  function isCancellable(status) {
    return !["cancelled", "canceled"].includes(status);
  }

  return (
    <>
      <h4 className="mb-3">Mis Reservas</h4>

      {loading ? (
        <p>Cargando...</p>
      ) : reservations.length === 0 ? (
        <Card body className="text-center text-muted">
          Aún no tienes reservas. Ve a "Clases Disponibles" para crear una.
        </Card>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Deporte</th>
              <th>Sala</th>
              <th>Día</th>
              <th>Horario</th>
              <th>Estado</th>
              <th className="text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => {
              // La reserva trae el horario, y el horario trae la asignación
              // (sportRoom), que es donde realmente viven el deporte y la sala.
              const schedule = r.classSchedule || {};
              const sportRoom = schedule.sportRoom || {};

              return (
                <tr key={r.id}>
                  <td>{sportRoom.sport?.name || "—"}</td>
                  <td>{sportRoom.room?.name || "—"}</td>
                  <td>{DAY_LABELS[schedule.day_of_week] ?? schedule.day_of_week ?? "—"}</td>
                  <td>
                    {schedule.start_time?.slice(0, 5)} - {schedule.end_time?.slice(0, 5)}
                  </td>
                  <td>
                    <Badge bg={STATUS_BADGE[r.status] || "primary"}>{r.status}</Badge>
                  </td>
                  <td className="text-center">
                    {isCancellable(r.status) ? (
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={cancelingId === r.id}
                        onClick={() => handleCancel(r)}
                      >
                        {cancelingId === r.id ? "Cancelando..." : "Cancelar"}
                      </Button>
                    ) : (
                      <span className="text-muted small">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </>
  );
}
