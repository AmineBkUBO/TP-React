import './App.css';
import {Routes, Route, Navigate} from 'react-router-dom';
import {Login} from "./user/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import 'bootstrap/dist/css/bootstrap.min.css';
import Chat from "./components/Chat";
import {Register} from "./user/Register";
import {AppNavbar} from "./components/Navbar";
import {MessagingApp} from "./components/MessagingApp";
import {useEffect, useState} from "react";
import {useAuthStore} from "./stores/useAuthStore";

function App() {
    const restoreSession = useAuthStore((state) => state.restoreSession);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            await restoreSession();  // this updates Zustand state
            setLoading(false);
        };
        initAuth();
    }, [restoreSession]);

    if (loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <>
            <AppNavbar/>
            <Routes>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/chatapp" element={<Chat/>}/>
                <Route path="/chat" element={<MessagingApp/> }/>
                <Route path="*"  element={<Navigate to={isAuthenticated ? "/chat" : "/login"}/>}
                />
            </Routes>
        </>
    );
}

export default App;
