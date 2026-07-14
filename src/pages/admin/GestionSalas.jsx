import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import { getRooms, createRoom, updateRoom, deleteRoom } from "../../api/roomsService";

const EMPTY_FORM = { name: "", description: "", capacity: "", location: "", observation: "", status: true };

export default function GestionSalas() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    setLoading(true);
    try {
      setRooms(await getRooms());
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo cargar Salas", text: error.response?.data?.message || error.message });
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setIsEditMode(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  }

  function openEditModal(r) {
    setIsEditMode(true);
    setEditingId(r.id);
    setForm({
      name: r.name,
      description: r.description || "",
      capacity: r.capacity || "",
      location: r.location || "",
      observation: r.observation || "",
      status: r.status,
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
    if (!form.name.trim()) newErrors.name = "El nombre es obligatorio.";
    if (!form.capacity || Number(form.capacity) <= 0) newErrors.capacity = "Ingresa una capacidad válida.";
    if (!form.location.trim()) newErrors.location = "La ubicación es obligatoria.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      capacity: Number(form.capacity),
      location: form.location.trim(),
      observation: form.observation.trim(),
      status: form.status,
    };
    try {
      if (isEditMode) {
        await updateRoom(editingId, payload);
        Swal.fire({ icon: "success", title: "Sala actualizada", timer: 1200, showConfirmButton: false });
      } else {
        await createRoom(payload);
        Swal.fire({ icon: "success", title: "Sala creada", timer: 1200, showConfirmButton: false });
      }
      setShowModal(false);
      loadRooms();
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo guardar", text: error.response?.data?.message || error.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(r) {
    const result = await Swal.fire({
      icon: "warning",
      title: `¿Eliminar "${r.name}"?`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e63946",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteRoom(r.id);
      Swal.fire({ icon: "success", title: "Sala eliminada", timer: 1200, showConfirmButton: false });
      loadRooms();
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo eliminar", text: error.response?.data?.message || error.message });
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Gestión de Salas</h4>
        <Button onClick={openCreateModal}>+ Nueva Sala</Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Ubicación</th>
              <th>Capacidad</th>
              <th>Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.name}</td>
                <td>{r.location}</td>
                <td>{r.capacity}</td>
                <td>
                  <Badge bg={r.status ? "success" : "secondary"}>{r.status ? "Activa" : "Inactiva"}</Badge>
                </td>
                <td className="text-center">
                  <Button size="sm" variant="warning" className="me-2" onClick={() => openEditModal(r)}>Editar</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(r)}>Eliminar</Button>
                </td>
              </tr>
            ))}
            {rooms.length === 0 && (
              <tr><td colSpan={6} className="text-center text-muted">No hay salas registradas.</td></tr>
            )}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? "Editar Sala" : "Nueva Sala"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control name="name" value={form.name} onChange={handleChange} isInvalid={!!errors.name} />
              <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ubicación</Form.Label>
              <Form.Control name="location" value={form.location} onChange={handleChange} isInvalid={!!errors.location} />
              <Form.Control.Feedback type="invalid">{errors.location}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Capacidad</Form.Label>
              <Form.Control type="number" name="capacity" value={form.capacity} onChange={handleChange} isInvalid={!!errors.capacity} />
              <Form.Control.Feedback type="invalid">{errors.capacity}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control as="textarea" rows={2} name="description" value={form.description} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Observación</Form.Label>
              <Form.Control name="observation" value={form.observation} onChange={handleChange} />
            </Form.Group>
            <Form.Check
              type="switch"
              id="room-status"
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
