import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from "./user/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import 'bootstrap/dist/css/bootstrap.min.css';
import Chat from "./components/Chat";
import { Register } from "./user/Register";
import { AppNavbar } from "./components/Navbar";
import { MessagingApp } from "./components/MessagingApp";
import { useEffect } from "react";
import { useAuthStore } from "./stores/useAuthStore";

function App() {
    const restoreSession = useAuthStore((state) => state.restoreSession);

    useEffect(() => {
        restoreSession();
    }, []);

    return (
        <>
            <AppNavbar />
            <Routes>
                <Route path="*" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/chatapp" element={<Chat />} />
                <Route path="/chat" element={<MessagingApp />} />
            </Routes>
        </>
    );
}

export default App;