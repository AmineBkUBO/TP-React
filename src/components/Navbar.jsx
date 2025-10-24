import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { ChatDots, BoxArrowRight, PersonCircle } from "react-bootstrap-icons";

export function AppNavbar() {
    const { isAuthenticated, session, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
            <Container>
                <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center gap-2">
                    <ChatDots size={24} />
                    MyApp
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {isAuthenticated && (
                            <Nav.Link
                                as={Link}
                                to="/chat"
                                className={location.pathname === "/chat" ? "active fw-semibold" : ""}
                            >
                                <ChatDots size={16} className="me-1 mb-1" />
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
                                        <strong>Register</strong>
                                    </Nav.Link>
                                )}
                            </>
                        ) : (
                            <NavDropdown
                                title={
                                    <span className="d-flex align-items-center gap-2">
                                        <PersonCircle size={20} />
                                        {session?.username || "User"}
                                    </span>
                                }
                                id="user-dropdown"
                                align="end"
                            >
                                <NavDropdown.Item onClick={handleLogout}>
                                    <BoxArrowRight size={16} className="me-2" />
                                    Logout
                                </NavDropdown.Item>
                            </NavDropdown>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}