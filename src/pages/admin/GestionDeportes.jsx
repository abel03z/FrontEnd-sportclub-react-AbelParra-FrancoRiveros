import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import { getSports, createSport, updateSport, deleteSport } from "../../api/sportsService";

const EMPTY_FORM = { name: "", objective: "", duration: "", status: true };

export default function GestionDeportes() {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSports();
  }, []);

  async function loadSports() {
    setLoading(true);
    try {
      setSports(await getSports());
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo cargar Deportes", text: error.response?.data?.message || error.message });
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

  function openEditModal(s) {
    setIsEditMode(true);
    setEditingId(s.id);
    setForm({ name: s.name, objective: s.objective || "", duration: s.duration || "", status: s.status });
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
    if (!form.duration || Number(form.duration) <= 0) newErrors.duration = "Ingresa una duración válida (minutos).";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      objective: form.objective.trim(),
      duration: Number(form.duration),
      status: form.status,
    };
    try {
      if (isEditMode) {
        await updateSport(editingId, payload);
        Swal.fire({ icon: "success", title: "Deporte actualizado", timer: 1200, showConfirmButton: false });
      } else {
        await createSport(payload);
        Swal.fire({ icon: "success", title: "Deporte creado", timer: 1200, showConfirmButton: false });
      }
      setShowModal(false);
      loadSports();
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo guardar", text: error.response?.data?.message || error.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(s) {
    const result = await Swal.fire({
      icon: "warning",
      title: `¿Eliminar "${s.name}"?`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e63946",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteSport(s.id);
      Swal.fire({ icon: "success", title: "Deporte eliminado", timer: 1200, showConfirmButton: false });
      loadSports();
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo eliminar", text: error.response?.data?.message || error.message });
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Gestión de Deportes</h4>
        <Button onClick={openCreateModal}>+ Nuevo Deporte</Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Objetivo</th>
              <th>Duración (min)</th>
              <th>Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sports.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.name}</td>
                <td>{s.objective}</td>
                <td>{s.duration}</td>
                <td>
                  <Badge bg={s.status ? "success" : "secondary"}>{s.status ? "Activo" : "Inactivo"}</Badge>
                </td>
                <td className="text-center">
                  <Button size="sm" variant="warning" className="me-2" onClick={() => openEditModal(s)}>Editar</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(s)}>Eliminar</Button>
                </td>
              </tr>
            ))}
            {sports.length === 0 && (
              <tr><td colSpan={6} className="text-center text-muted">No hay deportes registrados.</td></tr>
            )}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? "Editar Deporte" : "Nuevo Deporte"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control name="name" value={form.name} onChange={handleChange} isInvalid={!!errors.name} />
              <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Objetivo</Form.Label>
              <Form.Control as="textarea" rows={2} name="objective" value={form.objective} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Duración (minutos)</Form.Label>
              <Form.Control type="number" name="duration" value={form.duration} onChange={handleChange} isInvalid={!!errors.duration} />
              <Form.Control.Feedback type="invalid">{errors.duration}</Form.Control.Feedback>
            </Form.Group>
            <Form.Check
              type="switch"
              id="sport-status"
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
