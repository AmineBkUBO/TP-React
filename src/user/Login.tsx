import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { FormEvent, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Button,
    Alert,
    Spinner,
    InputGroup,
} from "react-bootstrap";

export function Login() {
    const navigate = useNavigate();
    const { session, error, loading, login } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false); // ✅ state

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const username = data.get("login") as string;
        const password = data.get("password") as string;

        login(username, password, () => {
            form.reset();
            navigate("/chat");
        });
    };

    return (
        <Container className="d-flex align-items-center justify-content-center vh-100">
            <Row className="w-100 justify-content-center">
                <Col xs={10} sm={8} md={6} lg={4}>
                    <Card className="shadow-lg border-0 rounded-4">
                        <Card.Body className="p-4">
                            <h3 className="text-center mb-4">Login</h3>

                            {error && <Alert variant="danger">{error.message}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="loginInput">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        name="login"
                                        type="text"
                                        placeholder="Enter your username"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="passwordInput">
                                    <Form.Label>Password</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            name="password"
                                            type={showPassword ? "text" : "password"} // ✅ toggle type
                                            placeholder="Enter your password"
                                            required
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
                                    <Button variant="primary" type="submit" size="lg">
                                        {loading ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Logging in...
                                            </>
                                        ) : (
                                            "Connexion"
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
