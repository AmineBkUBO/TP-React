import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AppNavbar } from "./components/Navbar";
import { Login } from "./user/Login";
import { Register } from "./user/Register";
import Chat from "./components/Chat";
import { MessagingApp } from "./components/MessagingApp";
import { useAuthStore } from "./stores/useAuthStore";
import { initBeams } from "./user/push";

function App() {
    const restoreSession = useAuthStore((state) => state.restoreSession);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            await restoreSession();
            setLoading(false);
        };
        initAuth();
    }, [restoreSession]);

    // ✅ Initialize Pusher Beams when user logs in
    useEffect(() => {
        if (isAuthenticated && user) {
            initBeams(user.id, user.name || user.email)
                .then(() => console.log("✅ Beams initialized for user:", user.id))
                .catch((err) => console.error("❌ Beams init error:", err));
        }
    }, [isAuthenticated, user]);

    if (loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <>
            <AppNavbar />
            <Routes>
                <Route path="/login" element={ <Login />} />
                <Route path="/register" element={ <Register />} />
                <Route path="/chatapp" element={isAuthenticated ? <Chat /> : <Navigate to="/login" />} />
                <Route path="/chat" element={isAuthenticated ? <MessagingApp /> : <Navigate to="/login" />} />
                <Route path="*" element={ <Login/> } />
            </Routes>
        </>
    );
}

export default App;
