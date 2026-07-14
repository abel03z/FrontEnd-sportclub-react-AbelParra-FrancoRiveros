import { useState, useEffect } from "react";
import { Form, Button, Card, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import { getProfileRequest, updateProfileRequest } from "../../api/authService";

const ROLE_BADGE = { admin: "danger", coach: "primary", user: "success" };
const ROLE_LABEL = { admin: "Administrador", coach: "Coach", user: "Usuario" };

export default function MiPerfil() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const data = await getProfileRequest();
      setProfile(data);
      setForm({ full_name: data.full_name, email: data.email });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo cargar tu perfil",
        text: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handlePasswordChange(e) {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  }

  function validateProfile() {
    const newErrors = {};
    if (!form.full_name.trim()) newErrors.full_name = "El nombre es obligatorio.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email)) newErrors.email = "Ingresa un correo válido.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmitProfile(e) {
    e.preventDefault();
    if (!validateProfile()) return;
    setSaving(true);
    try {
      await updateProfileRequest({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
      });
      Swal.fire({ icon: "success", title: "Perfil actualizado", timer: 1200, showConfirmButton: false });
      loadProfile();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo actualizar tu perfil",
        text: error.response?.data?.message || error.message,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitPassword(e) {
    e.preventDefault();
    const newErrors = {};
    if (passwordForm.password.length < 8) newErrors.password = "Mínimo 8 caracteres.";
    if (passwordForm.password !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    try {
      await updateProfileRequest({ password: passwordForm.password });
      Swal.fire({ icon: "success", title: "Contraseña actualizada", timer: 1200, showConfirmButton: false });
      setPasswordForm({ password: "", confirmPassword: "" });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo actualizar la contraseña",
        text: error.response?.data?.message || error.message,
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Cargando perfil...</p>;

  return (
    <>
      <h4 className="mb-3">Mi Perfil</h4>

      <Card className="mb-4 p-3" style={{ maxWidth: 500 }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Datos personales</h5>
            {profile?.role && (
              <Badge bg={ROLE_BADGE[profile.role] || "secondary"}>
                {ROLE_LABEL[profile.role] || profile.role}
              </Badge>
            )}
          </div>

          <Form onSubmit={handleSubmitProfile}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre completo</Form.Label>
              <Form.Control
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                isInvalid={!!errors.full_name}
              />
              <Form.Control.Feedback type="invalid">{errors.full_name}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>

            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card className="p-3" style={{ maxWidth: 500 }}>
        <Card.Body>
          <h5 className="mb-3">Cambiar contraseña</h5>
          <Form onSubmit={handleSubmitPassword}>
            <Form.Group className="mb-3">
              <Form.Label>Nueva contraseña</Form.Label>
              <Form.Control
                name="password"
                type="password"
                value={passwordForm.password}
                onChange={handlePasswordChange}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirmar nueva contraseña</Form.Label>
              <Form.Control
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                isInvalid={!!errors.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
            </Form.Group>

            <Button type="submit" variant="warning" disabled={saving}>
              {saving ? "Guardando..." : "Actualizar contraseña"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}
