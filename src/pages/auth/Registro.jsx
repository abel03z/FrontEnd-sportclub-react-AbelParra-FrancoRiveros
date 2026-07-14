import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Container, Card } from "react-bootstrap";
import Swal from "sweetalert2";
import { registerRequest } from "../../api/authService";

const EMPTY_FORM = {
  full_name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function Registro() {
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const newErrors = {};

    if (!form.full_name.trim()) {
      newErrors.full_name = "El nombre es obligatorio.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email)) {
      newErrors.email = "Ingresa un correo válido.";
    }

    if (form.password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres.";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // El registro público siempre crea usuarios con rol "user".
      // Los roles admin/coach se asignan después desde el panel de administración.
      await registerRequest({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      await Swal.fire({
        icon: "success",
        title: "Cuenta creada con éxito",
        text: "Ya puedes iniciar sesión.",
        confirmButtonText: "Ir a Login",
      });

      navigate("/login", { replace: true });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo completar el registro",
        text: error.response?.data?.message || error.message || "Intenta nuevamente.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <Card style={{ width: "100%", maxWidth: 440 }} className="p-4 shadow-sm">
        <Card.Body>
          <h3 className="mb-4 text-center">Crear cuenta</h3>

          <Form noValidate onSubmit={handleSubmit}>
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
                placeholder="tu@email.cl"
                value={form.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirmar contraseña</Form.Label>
              <Form.Control
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                isInvalid={!!errors.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
            </Form.Group>

            <Button type="submit" className="w-100" disabled={submitting}>
              {submitting ? "Creando cuenta..." : "Registrarme"}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
