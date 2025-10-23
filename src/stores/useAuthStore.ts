import { create } from 'zustand';
import { Session } from "../model/common";
import { CustomError } from "../model/CustomError";
import { loginUser } from "../user/loginApi";
import { registerUser } from "../user/registerApi";

interface AuthState {
    session: Session | null;
    error: CustomError | null;
    loading: boolean;
    isAuthenticated: boolean; // ✅ new
    login: (username: string, password: string, onSuccess?: () => void) => void;
    register: (username: string, password: string, email: string, onSuccess?: () => void) => void;
    logout: () => void;
    restoreSession: () => void; // ✅ new, restore session from sessionStorage
}

export const useAuthStore = create<AuthState>((set, get) => ({
    session: null,
    error: null,
    loading: false,
    isAuthenticated: false,

    login: (username, password, onSuccess) => {
        set({ loading: true, error: null });

        loginUser(
            { user_id: -1, username, password },
            (result: Session) => {
                console.log("Login success:", result);
                sessionStorage.setItem("userid", String(result!.id));
                sessionStorage.setItem("token", result.token);
                set({ session: result, error: null, loading: false, isAuthenticated: true });
                if (onSuccess) onSuccess();
            },
            (loginError: CustomError) => {
                console.log("Login error:", loginError);
                set({ error: loginError, session: null, loading: false, isAuthenticated: false });
            }
        );
    },

    register: (username, password, email, onSuccess) => {
        set({ loading: true, error: null });

        registerUser(
            { username, password, email },
            (result: Session) => {
                console.log("Register success:", result);
                sessionStorage.setItem("token", result.token);
                set({ session: result, error: null, loading: false, isAuthenticated: true });
                if (onSuccess) onSuccess();
            },
            (registerError: CustomError) => {
                console.log("Register error:", registerError);
                set({ error: registerError, session: null, loading: false, isAuthenticated: false });
            }
        );
    },

    logout: () => {
        sessionStorage.removeItem("token");
        set({ session: null, error: null, loading: false, isAuthenticated: false });
    },

    restoreSession: (navigate?: (path: string) => void) => {
        const token = sessionStorage.getItem("token");
        if (token) {
            set({ isAuthenticated: true });
        } else {
            set({ isAuthenticated: false });
            if (navigate) navigate("/login"); // redirect if no token
        }
    }



}));
