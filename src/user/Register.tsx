import { useAuthStore } from "../stores/useAuthStore";
import { FormEvent, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export function Register() {
    const router = useNavigate();
    const { register, error, loading } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false); // ✅ state

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const username = data.get("username") as string;
        const email = data.get("email") as string;
        const password = data.get("password") as string;

        register(username, password, email, () => {
            form.reset();
            router("/chat");
        });
    };

    return (
        <Container className="d-flex align-items-center justify-content-center vh-100">
            <Row className="w-100 justify-content-center">
                <Col xs={10} sm={8} md={6} lg={4}>
                    <Card className="shadow-lg border-0 rounded-4">
                        <Card.Body className="p-4">
                            <h3 className="text-center mb-4">Register</h3>

                            {error && <Alert variant="danger">{error.message}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control name="username" required placeholder="Enter username" />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control name="email" type="email" required placeholder="Enter email" />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Password</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            name="password"
                                            type={showPassword ? "text" : "password"} // ✅ toggle type
                                            required
                                            placeholder="Enter password"
                                        />
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? "Hide" : "Show"}
                                        </Button>
                                    </InputGroup>
                                </Form.Group>

                                <div className="d-grid">
                                    <Button variant="primary" type="submit" size="lg" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" /> Creating account...
                                            </>
                                        ) : (
                                            "Register"
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
