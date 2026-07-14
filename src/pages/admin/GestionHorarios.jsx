import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import {
  getClassSchedules,
  createClassSchedule,
  updateClassSchedule,
  deleteClassSchedule,
} from "../../api/classSchedulesService";
import { getSportRooms } from "../../api/sportRoomsService";
import { getSports } from "../../api/sportsService";
import { getRooms } from "../../api/roomsService";

const DAYS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

const EMPTY_FORM = { sport_room_id: "", day_of_week: "", start_time: "", end_time: "", status: true };

export default function GestionHorarios() {
  const [schedules, setSchedules] = useState([]);
  const [sportRooms, setSportRooms] = useState([]);
  const [sports, setSports] = useState([]);
  const [rooms, setRooms] = useState([]);
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
      const [schedulesData, sportRoomsData, sportsData, roomsData] = await Promise.all([
        getClassSchedules(),
        getSportRooms(),
        getSports(),
        getRooms(),
      ]);
      setSchedules(schedulesData);
      setSportRooms(sportRoomsData);
      setSports(sportsData);
      setRooms(roomsData);
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo cargar Horarios", text: error.response?.data?.message || error.message });
    } finally {
      setLoading(false);
    }
  }

  function describeSportRoom(id) {
    const sr = sportRooms.find((x) => x.id === id);
    if (!sr) return "—";
    const sportLabel = sports.find((s) => s.id === sr.sport_id)?.name || "?";
    const roomLabel = rooms.find((r) => r.id === sr.room_id)?.name || "?";
    return `${sportLabel} — ${roomLabel}`;
  }

  function dayLabel(value) {
    return DAYS.find((d) => d.value === value)?.label || value;
  }

  function openCreateModal() {
    setIsEditMode(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  }

  function openEditModal(s) {
    setIsEditMode(true);
    setEditingId(s.id);
    setForm({
      sport_room_id: s.sport_room_id,
      day_of_week: s.day_of_week,
      start_time: s.start_time?.slice(0, 5) || "",
      end_time: s.end_time?.slice(0, 5) || "",
      status: s.status,
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
    if (!form.sport_room_id) newErrors.sport_room_id = "Selecciona una asignación (deporte + sala).";
    if (form.day_of_week === "") newErrors.day_of_week = "Selecciona un día.";
    if (!form.start_time) newErrors.start_time = "Ingresa hora de inicio.";
    if (!form.end_time) newErrors.end_time = "Ingresa hora de término.";
    if (form.start_time && form.end_time && form.start_time >= form.end_time) {
      newErrors.end_time = "Debe ser posterior a la hora de inicio.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      sport_room_id: Number(form.sport_room_id),
      day_of_week: Number(form.day_of_week),
      start_time: form.start_time,
      end_time: form.end_time,
      status: form.status,
    };
    try {
      if (isEditMode) {
        await updateClassSchedule(editingId, payload);
        Swal.fire({ icon: "success", title: "Horario actualizado", timer: 1200, showConfirmButton: false });
      } else {
        await createClassSchedule(payload);
        Swal.fire({ icon: "success", title: "Horario creado", timer: 1200, showConfirmButton: false });
      }
      setShowModal(false);
      loadAll();
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo guardar", text: error.response?.data?.message || error.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(s) {
    const result = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar este horario?",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e63946",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteClassSchedule(s.id);
      Swal.fire({ icon: "success", title: "Horario eliminado", timer: 1200, showConfirmButton: false });
      loadAll();
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo eliminar", text: error.response?.data?.message || error.message });
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Gestión de Horarios</h4>
        <Button onClick={openCreateModal}>+ Nuevo Horario</Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Deporte — Sala</th>
              <th>Día</th>
              <th>Inicio</th>
              <th>Término</th>
              <th>Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{describeSportRoom(s.sport_room_id)}</td>
                <td>{dayLabel(s.day_of_week)}</td>
                <td>{s.start_time?.slice(0, 5)}</td>
                <td>{s.end_time?.slice(0, 5)}</td>
                <td>
                  <Badge bg={s.status ? "success" : "secondary"}>{s.status ? "Activo" : "Inactivo"}</Badge>
                </td>
                <td className="text-center">
                  <Button size="sm" variant="warning" className="me-2" onClick={() => openEditModal(s)}>Editar</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(s)}>Eliminar</Button>
                </td>
              </tr>
            ))}
            {schedules.length === 0 && (
              <tr><td colSpan={7} className="text-center text-muted">No hay horarios registrados.</td></tr>
            )}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? "Editar Horario" : "Nuevo Horario"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Asignación (Deporte — Sala)</Form.Label>
              <Form.Select
                name="sport_room_id"
                value={form.sport_room_id}
                onChange={handleChange}
                isInvalid={!!errors.sport_room_id}
              >
                <option value="">Selecciona una asignación</option>
                {sportRooms.map((sr) => (
                  <option key={sr.id} value={sr.id}>{describeSportRoom(sr.id)}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.sport_room_id}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Día de la semana</Form.Label>
              <Form.Select name="day_of_week" value={form.day_of_week} onChange={handleChange} isInvalid={!!errors.day_of_week}>
                <option value="">Selecciona un día</option>
                {DAYS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.day_of_week}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Hora de inicio</Form.Label>
              <Form.Control type="time" name="start_time" value={form.start_time} onChange={handleChange} isInvalid={!!errors.start_time} />
              <Form.Control.Feedback type="invalid">{errors.start_time}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Hora de término</Form.Label>
              <Form.Control type="time" name="end_time" value={form.end_time} onChange={handleChange} isInvalid={!!errors.end_time} />
              <Form.Control.Feedback type="invalid">{errors.end_time}</Form.Control.Feedback>
            </Form.Group>

            <Form.Check
              type="switch"
              id="schedule-status"
              label="Activo"
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
