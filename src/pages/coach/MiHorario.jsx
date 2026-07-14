import { useState, useEffect } from "react";
import { Table, Badge, Card } from "react-bootstrap";
import Swal from "sweetalert2";
import { getMySchedules } from "../../api/coachService";

const DAY_LABELS = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

export default function MiHorario() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  async function loadSchedules() {
    setLoading(true);
    try {
      const data = await getMySchedules();
      setSchedules(data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo cargar tu horario",
        text: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h4 className="mb-3">Mi Horario</h4>

      {loading ? (
        <p>Cargando...</p>
      ) : schedules.length === 0 ? (
        <Card body className="text-center text-muted">
          Aún no tienes horarios asignados.
        </Card>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Día</th>
              <th>Deporte</th>
              <th>Sala</th>
              <th>Inicio</th>
              <th>Término</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id}>
                <td>{DAY_LABELS[s.day_of_week] ?? s.day_of_week}</td>
                <td>{s.sportRoom?.sport?.name || s.sport_name || "—"}</td>
                <td>{s.sportRoom?.room?.name || s.room_name || "—"}</td>
                <td>{s.start_time?.slice(0, 5)}</td>
                <td>{s.end_time?.slice(0, 5)}</td>
                <td>
                  <Badge bg={s.status ? "success" : "secondary"}>
                    {s.status ? "Activo" : "Inactivo"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
