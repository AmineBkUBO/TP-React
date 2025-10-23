import { create } from 'zustand';
import { CustomError } from "../model/CustomError";
import { loginUser } from "../user/loginApi";
import { registerUser } from "../user/registerApi";

// Inferred types based on usage in App.js and login/register success
interface User {
    id: number;
    username: string;
    email: string;
    name?: string;
}

// Session is what the API returns, which contains user details + token
interface Session extends User {
    token: string;
}

interface AuthState {
    session: Session | null; // The full session response from the API
    user: User | null; // The derived user data for easy access (used in App.js)
    error: CustomError | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string, onSuccess?: () => void) => void;
    register: (username: string, password: string, email: string, onSuccess?: () => void) => void;
    logout: () => void;
    restoreSession: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    session: null,
    user: null, // Initial user is null
    error: null,
    loading: false,
    isAuthenticated: false,

    login: (username, password, onSuccess) => {
        set({ loading: true, error: null });

        loginUser(
            { user_id: -1, username, password },
            (result: any) => {
                const { token, id, username: uname, email, name } = result;
                const userData: User = { id, username: uname, email, name };

                // Store both token and user details in sessionStorage
                sessionStorage.setItem("token", token);
                sessionStorage.setItem("user", JSON.stringify(userData));

                set({
                    session: result,
                    user: userData, // Set the user object
                    error: null,
                    loading: false,
                    isAuthenticated: true
                });
                if (onSuccess) onSuccess();
            },
            (loginError: CustomError) => {
                console.log("Login error:", loginError);
                set({ error: loginError, session: null, user: null, loading: false, isAuthenticated: false });
            }
        );
    },

    register: (username, password, email, onSuccess) => {
        set({ loading: true, error: null });

        registerUser(
            { username, password, email },
            (result: Session) => {
                const { token, id, username: uname, email: uemail, name } = result;
                const userData: User = { id, username: uname, email: uemail, name };

                // Store both token and user details in sessionStorage
                sessionStorage.setItem("token", token);
                sessionStorage.setItem("user", JSON.stringify(userData));

                set({
                    session: result,
                    user: userData, // Set the user object
                    error: null,
                    loading: false,
                    isAuthenticated: true
                });
                if (onSuccess) onSuccess();
            },
            (registerError: CustomError) => {
                console.log("Register error:", registerError);
                set({ error: registerError, session: null, user: null, loading: false, isAuthenticated: false });
            }
        );
    },

    logout: () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user"); // Remove user data on logout
        set({ session: null, user: null, error: null, loading: false, isAuthenticated: false });
    },

    restoreSession: () => {
        const token = sessionStorage.getItem("token");
        const userJson = sessionStorage.getItem("user");

        if (token && userJson) {
            try {
                const userData: User = JSON.parse(userJson);
                // Reconstruct a minimal session object for consistency, but the user object is key
                const restoredSession: Session = { ...userData, token, id: userData.id, username: userData.username, email: userData.email };

                set({
                    session: restoredSession,
                    user: userData, // Fully restore the user data
                    isAuthenticated: true
                });
            } catch (e) {
                console.error("Error parsing user data from session storage", e);
                // Clear invalid session data
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");
                set({ isAuthenticated: false, user: null, session: null });
            }
        } else {
            set({ isAuthenticated: false, user: null, session: null });
        }
    }
}));
