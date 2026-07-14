import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import { getSportRooms, createSportRoom, updateSportRoom, deleteSportRoom } from "../../api/sportRoomsService";
import { getSports } from "../../api/sportsService";
import { getRooms } from "../../api/roomsService";
import { getUsers } from "../../api/usersService";

const EMPTY_FORM = { sport_id: "", room_id: "", coach_id: "", observation: "", status: true };

export default function GestionAsignaciones() {
  const [assignments, setAssignments] = useState([]);
  const [sports, setSports] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [assignmentsData, sportsData, roomsData, usersData] = await Promise.all([
        getSportRooms(),
        getSports(),
        getRooms(),
        getUsers(),
      ]);
      setAssignments(assignmentsData);
      setSports(sportsData);
      setRooms(roomsData);
      setCoaches(usersData.filter((u) => u.role === "coach"));
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo cargar Asignaciones", text: error.response?.data?.message || error.message });
    } finally {
      setLoading(false);
    }
  }

  function sportName(id) {
    return sports.find((s) => s.id === id)?.name || "—";
  }
  function roomName(id) {
    return rooms.find((r) => r.id === id)?.name || "—";
  }
  function coachName(id) {
    return coaches.find((c) => c.id === id)?.full_name || "Sin asignar";
  }

  function openCreateModal() {
    setIsEditMode(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  }

  function openEditModal(a) {
    setIsEditMode(true);
    setEditingId(a.id);
    setForm({
      sport_id: a.sport_id,
      room_id: a.room_id,
      coach_id: a.coach_id || "",
      observation: a.observation || "",
      status: a.status,
    });
    setErrors({});
    setShowModal(true);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function validate() {
    const newErrors = {};
    if (!form.sport_id) newErrors.sport_id = "Selecciona un deporte.";
    if (!form.room_id) newErrors.room_id = "Selecciona una sala.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      sport_id: Number(form.sport_id),
      room_id: Number(form.room_id),
      coach_id: form.coach_id ? Number(form.coach_id) : null,
      observation: form.observation.trim(),
      status: form.status,
    };
    try {
      if (isEditMode) {
        await updateSportRoom(editingId, payload);
        Swal.fire({ icon: "success", title: "Asignación actualizada", timer: 1200, showConfirmButton: false });
      } else {
        await createSportRoom(payload);
        Swal.fire({ icon: "success", title: "Asignación creada", timer: 1200, showConfirmButton: false });
      }
      setShowModal(false);
      loadAll();
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo guardar", text: error.response?.data?.message || error.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(a) {
    const result = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar esta asignación?",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e63946",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteSportRoom(a.id);
      Swal.fire({ icon: "success", title: "Asignación eliminada", timer: 1200, showConfirmButton: false });
      loadAll();
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo eliminar", text: error.response?.data?.message || error.message });
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Gestión de Asignaciones</h4>
        <Button onClick={openCreateModal}>+ Nueva Asignación</Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Deporte</th>
              <th>Sala</th>
              <th>Coach</th>
              <th>Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{sportName(a.sport_id)}</td>
                <td>{roomName(a.room_id)}</td>
                <td>{coachName(a.coach_id)}</td>
                <td>
                  <Badge bg={a.status ? "success" : "secondary"}>{a.status ? "Activa" : "Inactiva"}</Badge>
                </td>
                <td className="text-center">
                  <Button size="sm" variant="warning" className="me-2" onClick={() => openEditModal(a)}>Editar</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(a)}>Eliminar</Button>
                </td>
              </tr>
            ))}
            {assignments.length === 0 && (
              <tr><td colSpan={6} className="text-center text-muted">No hay asignaciones registradas.</td></tr>
            )}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? "Editar Asignación" : "Nueva Asignación"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Deporte</Form.Label>
              <Form.Select name="sport_id" value={form.sport_id} onChange={handleChange} isInvalid={!!errors.sport_id}>
                <option value="">Selecciona un deporte</option>
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.sport_id}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Sala</Form.Label>
              <Form.Select name="room_id" value={form.room_id} onChange={handleChange} isInvalid={!!errors.room_id}>
                <option value="">Selecciona una sala</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.room_id}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Coach (opcional)</Form.Label>
              <Form.Select name="coach_id" value={form.coach_id} onChange={handleChange}>
                <option value="">Sin asignar</option>
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Observación</Form.Label>
              <Form.Control name="observation" value={form.observation} onChange={handleChange} />
            </Form.Group>

            <Form.Check
              type="switch"
              id="assignment-status"
              label="Activa"
              name="status"
              checked={form.status}
              onChange={handleChange}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
