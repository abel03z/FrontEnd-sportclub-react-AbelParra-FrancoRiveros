import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import { getUsers, createUser, updateUser, deleteUser } from "../../api/usersService";

const ROLE_BADGE = { admin: "danger", coach: "primary", user: "success" };
const EMPTY_FORM = { full_name: "", email: "", role: "user", password: "", confirmPassword: "" };

export default function GestionUsuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      setUsers(await getUsers());
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo cargar la lista de usuarios", text: error.response?.data?.message || error.message });
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

  function openEditModal(u) {
    setIsEditMode(true);
    setEditingId(u.id);
    setForm({ full_name: u.full_name, email: u.email, role: u.role, password: "", confirmPassword: "" });
    setErrors({});
    setShowModal(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const newErrors = {};
    if (!form.full_name.trim()) newErrors.full_name = "El nombre es obligatorio.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email)) newErrors.email = "Ingresa un correo válido.";
    if (!form.role) newErrors.role = "Selecciona un rol.";
    if (!isEditMode) {
      if (form.password.length < 8) newErrors.password = "Mínimo 8 caracteres.";
      if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = { full_name: form.full_name.trim(), email: form.email.trim(), role: form.role };
    if (!isEditMode) payload.password = form.password;
    try {
      if (isEditMode) {
        await updateUser(editingId, payload);
        Swal.fire({ icon: "success", title: "Usuario actualizado", timer: 1200, showConfirmButton: false });
      } else {
        await createUser(payload);
        Swal.fire({ icon: "success", title: "Usuario creado", timer: 1200, showConfirmButton: false });
      }
      setShowModal(false);
      loadUsers();
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo guardar el usuario", text: error.response?.data?.message || error.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(u) {
    const result = await Swal.fire({
      icon: "warning",
      title: `¿Eliminar a ${u.full_name}?`,
      text: "Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e63946",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteUser(u.id);
      Swal.fire({ icon: "success", title: "Usuario eliminado", timer: 1200, showConfirmButton: false });
      loadUsers();
    } catch (error) {
      Swal.fire({ icon: "error", title: "No se pudo eliminar el usuario", text: error.response?.data?.message || error.message });
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Gestión de Usuarios</h4>
        <Button onClick={openCreateModal}>+ Nuevo Usuario</Button>
      </div>

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th><th>Nombre</th><th>Correo</th><th>Rol</th><th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td><Badge bg={ROLE_BADGE[u.role] || "secondary"}>{u.role}</Badge></td>
                <td className="text-center">
                  <Button size="sm" variant="warning" className="me-2" onClick={() => openEditModal(u)}>Editar</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(u)}>Eliminar</Button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="text-center text-muted">No hay usuarios registrados.</td></tr>
            )}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? "Editar Usuario" : "Nuevo Usuario"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre completo</Form.Label>
              <Form.Control name="full_name" value={form.full_name} onChange={handleChange} isInvalid={!!errors.full_name} />
              <Form.Control.Feedback type="invalid">{errors.full_name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control name="email" type="email" value={form.email} onChange={handleChange} isInvalid={!!errors.email} />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Select name="role" value={form.role} onChange={handleChange} isInvalid={!!errors.role}>
                <option value="user">Usuario</option>
                <option value="coach">Coach</option>
                <option value="admin">Administrador</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.role}</Form.Control.Feedback>
            </Form.Group>
            {!isEditMode && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control name="password" type="password" value={form.password} onChange={handleChange} isInvalid={!!errors.password} />
                  <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Confirmar contraseña</Form.Label>
                  <Form.Control name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} isInvalid={!!errors.confirmPassword} />
                  <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
                </Form.Group>
              </>
            )}
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
