import {useAuthStore} from "../stores/useAuthStore";
import {FormEvent, useState} from "react";
import {Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup} from "react-bootstrap";
import {useNavigate, Link} from "react-router-dom";
import {Eye, EyeSlash, PersonPlusFill} from "react-bootstrap-icons";

export function Register() {
    const router = useNavigate();
    const {register, error, loading} = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const username = data.get("username") as string;
        const email = data.get("email") as string;
        const password = data.get("password") as string;

        register(username, password, email, () => {
            form.reset();
            router("/login");
        });
    };

    return (
        <Container className="d-flex align-items-center justify-content-center"
                   style={{minHeight: "calc(100vh - 100px)"}}>
            <Row className="w-100 justify-content-center">
                <Col xs={11} sm={9} md={7} lg={5} xl={4}>
                    <Card className="shadow-lg border-0 rounded-4">
                        <Card.Body className="p-4 p-sm-5">
                            <div className="text-center mb-4">
                                <div
                                    className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 mb-3"
                                    style={{width: '64px', height: '64px'}}
                                >
                                    <PersonPlusFill size={32} className="text-primary"/>
                                </div>
                                <h3 className="fw-bold mb-2">Create Account</h3>
                                <p className="text-muted mb-0">Sign up to get started</p>
                            </div>

                            {error && (
                                <Alert variant="danger" className="py-2 small">
                                    {error.message}
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Username</Form.Label>
                                    <Form.Control
                                        name="username"
                                        required
                                        placeholder="Choose a username"
                                        className="py-2"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Email</Form.Label>
                                    <Form.Control
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="Enter your email"
                                        className="py-2"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-semibold">Password</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            placeholder="Create a password"
                                            className="py-2"
                                        />
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="px-3"
                                        >
                                            {showPassword ? <EyeSlash size={18}/> : <Eye size={18}/>}
                                        </Button>
                                    </InputGroup>
                                    <Form.Text className="text-muted small">
                                        Must be at least 8 characters long
                                    </Form.Text>
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
                                                <Spinner animation="border" size="sm" className="me-2"/>
                                                Creating account...
                                            </>
                                        ) : (
                                            "Create Account"
                                        )}
                                    </Button>
                                </div>

                                <div className="text-center">
                                    <small className="text-muted">
                                        Already have an account?{" "}
                                        <Link to="/login" className="text-decoration-none fw-semibold">
                                            Login here
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