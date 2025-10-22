import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

export function AppNavbar() {
    const { isAuthenticated, session, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation(); // ✅ get current path

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <Navbar bg="primary" variant="dark" expand="lg" className="mb-4 shadow-sm">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    MyApp
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {isAuthenticated && (
                            <Nav.Link as={Link} to="/chat">
                                Chat
                            </Nav.Link>
                        )}
                    </Nav>
                    <Nav>
                        {!isAuthenticated ? (
                            <>
                                {location.pathname !== "/login" && (
                                    <Nav.Link as={Link} to="/login">
                                        Login
                                    </Nav.Link>
                                )}
                                {location.pathname !== "/register" && (
                                    <Nav.Link as={Link} to="/register">
                                        <b>
                                        Register
                                        </b>
                                    </Nav.Link>
                                )}
                            </>
                        ) : (
                            <NavDropdown title={session?.username || "User"} id="user-dropdown">
                                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                            </NavDropdown>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>

    );
}
