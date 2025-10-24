import { useNavigate, Link } from "react-router-dom";
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
import { Eye, EyeSlash, BoxArrowInRight } from "react-bootstrap-icons";

export function Login() {
    const navigate = useNavigate();
    const { session, error, loading, login } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);

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
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "calc(100vh - 100px)" }}>
            <Row className="w-100 justify-content-center">
                <Col xs={11} sm={9} md={7} lg={5} xl={4}>
                    <Card className="shadow-lg border-0 rounded-4">
                        <Card.Body className="p-4 p-sm-5">
                            <div className="text-center mb-4">
                                <div
                                    className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 mb-3"
                                    style={{ width: '64px', height: '64px' }}
                                >
                                    <BoxArrowInRight size={32} className="text-primary" />
                                </div>
                                <h3 className="fw-bold mb-2">Welcome Back</h3>
                                <p className="text-muted mb-0">Login to your account</p>
                            </div>

                            {error && (
                                <Alert variant="danger" className="py-2 small">
                                    {error.message}
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="loginInput">
                                    <Form.Label className="fw-semibold">Username</Form.Label>
                                    <Form.Control
                                        name="login"
                                        type="text"
                                        placeholder="Enter your username"
                                        required
                                        className="py-2"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="passwordInput">
                                    <Form.Label className="fw-semibold">Password</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            required
                                            className="py-2"
                                        />
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="px-3"
                                        >
                                            {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                                        </Button>
                                    </InputGroup>
                                </Form.Group>

                                <div className="d-grid mb-3">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        size="lg"
                                        disabled={loading}
                                        className="py-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Logging in...
                                            </>
                                        ) : (
                                            "Login"
                                        )}
                                    </Button>
                                </div>

                                <div className="text-center">
                                    <small className="text-muted">
                                        Don't have an account?{" "}
                                        <Link to="/register" className="text-decoration-none fw-semibold">
                                            Register here
                                        </Link>
                                    </small>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}