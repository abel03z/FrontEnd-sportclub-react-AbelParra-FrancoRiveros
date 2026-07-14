import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

// Mismo diccionario de rutas que usabas en login.js
const ROUTES_BY_ROLE = {
  admin: "/admin/dashboard",
  coach: "/coach/dashboard",
  user: "/dashboard",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const errors = {};
    if (!email.trim()) errors.email = "El correo es obligatorio.";
    if (!password) errors.password = "La contraseña es obligatoria.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const loggedUser = await login(email.trim(), password);
      const destination = ROUTES_BY_ROLE[loggedUser.role] || "/dashboard";

      await Swal.fire({
        icon: "success",
        title: `¡Bienvenido, ${loggedUser.full_name}!`,
        timer: 1200,
        showConfirmButton: false,
      });

      navigate(destination, { replace: true });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo iniciar sesión",
        text: error.response?.data?.message || error.message || "Verifica tus credenciales.",
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
      <Card style={{ width: "100%", maxWidth: 420 }} className="p-4 shadow-sm">
        <Card.Body>
          <h3 className="mb-4 text-center">Iniciar sesión</h3>

          <Form noValidate onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                placeholder="tu@email.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isInvalid={!!fieldErrors.email}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isInvalid={!!fieldErrors.password}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <Button type="submit" className="w-100" disabled={submitting}>
              {submitting ? "Ingresando..." : "Ingresar"}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <Link to="/registro">¿No tienes cuenta? Regístrate</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
