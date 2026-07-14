import { useState, useEffect } from "react";
import { Table, Button, Badge, Card } from "react-bootstrap";
import Swal from "sweetalert2";
import { getAvailableClasses } from "../../api/memberService";
import { createReservation } from "../../api/reservationsService";

const DAY_LABELS = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

export default function ClasesDisponibles() {
  const [rows, setRows] = useState([]); // una fila por CADA horario, no por asignación
  const [loading, setLoading] = useState(true);
  const [reservingId, setReservingId] = useState(null);

  useEffect(() => {
    loadClasses();
  }, []);

  async function loadClasses() {
    setLoading(true);
    try {
      const assignments = await getAvailableClasses();

      // Cada "asignación" (deporte + sala) trae un array `schedules`.
      // "Aplanamos" para tener una fila por horario, que es lo que el
      // usuario realmente reserva (class_schedule_id).
      const flattened = assignments.flatMap((assignment) =>
        (assignment.schedules || []).map((schedule) => ({
          scheduleId: schedule.id,
          sportName: assignment.sport?.name,
          roomName: assignment.room?.name,
          dayOfWeek: schedule.day_of_week,
          startTime: schedule.start_time,
          endTime: schedule.end_time,
          scheduleStatus: schedule.status,
          assignmentStatus: assignment.status,
        }))
      );

      setRows(flattened);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudieron cargar las clases",
        text: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleReservar(row) {
    const result = await Swal.fire({
      icon: "question",
      title: "¿Confirmar reserva?",
      text: `${row.sportName} — ${DAY_LABELS[row.dayOfWeek] ?? row.dayOfWeek} ${row.startTime?.slice(0, 5)}`,
      showCancelButton: true,
      confirmButtonText: "Sí, reservar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    setReservingId(row.scheduleId);
    try {
      await createReservation(row.scheduleId);
      Swal.fire({
        icon: "success",
        title: "¡Reserva creada!",
        text: "Puedes verla en Mis Reservas.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo reservar",
        text: error.response?.data?.message || error.message,
      });
    } finally {
      setReservingId(null);
    }
  }

  const isAvailable = (row) => row.scheduleStatus && row.assignmentStatus;

  return (
    <>
      <h4 className="mb-3">Clases Disponibles</h4>

      {loading ? (
        <p>Cargando...</p>
      ) : rows.length === 0 ? (
        <Card body className="text-center text-muted">
          No hay clases disponibles en este momento.
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
            {rows.map((row) => (
              <tr key={row.scheduleId}>
                <td>{row.sportName || "—"}</td>
                <td>{row.roomName || "—"}</td>
                <td>{DAY_LABELS[row.dayOfWeek] ?? row.dayOfWeek}</td>
                <td>
                  {row.startTime?.slice(0, 5)} - {row.endTime?.slice(0, 5)}
                </td>
                <td>
                  <Badge bg={isAvailable(row) ? "success" : "secondary"}>
                    {isAvailable(row) ? "Disponible" : "No disponible"}
                  </Badge>
                </td>
                <td className="text-center">
                  <Button
                    size="sm"
                    disabled={!isAvailable(row) || reservingId === row.scheduleId}
                    onClick={() => handleReservar(row)}
                  >
                    {reservingId === row.scheduleId ? "Reservando..." : "Reservar"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
