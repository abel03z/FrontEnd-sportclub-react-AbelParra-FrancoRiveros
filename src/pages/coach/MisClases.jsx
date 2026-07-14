import { useState, useEffect } from "react";
import { Table, Badge, Card } from "react-bootstrap";
import Swal from "sweetalert2";
import { getMyClasses } from "../../api/coachService";

export default function MisClases() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, []);

  async function loadClasses() {
    setLoading(true);
    try {
      const data = await getMyClasses();
      setClasses(data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudieron cargar tus clases",
        text: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h4 className="mb-3">Mis Clases</h4>

      {loading ? (
        <p>Cargando...</p>
      ) : classes.length === 0 ? (
        <Card body className="text-center text-muted">
          Aún no tienes clases asignadas. Cuando el administrador te asigne un deporte y sala,
          aparecerán aquí.
        </Card>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Deporte</th>
              <th>Objetivo</th>
              <th>Sala</th>
              <th>Ubicación</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.sport?.name || c.sport_name || "—"}</td>
                <td>{c.sport?.objective || c.sport_objective || "—"}</td>
                <td>{c.room?.name || c.room_name || "—"}</td>
                <td>{c.room?.location || c.room_location || "—"}</td>
                <td>
                  <Badge bg={c.status ? "success" : "secondary"}>
                    {c.status ? "Activa" : "Inactiva"}
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
