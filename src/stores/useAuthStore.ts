import { create } from 'zustand';
import { Session } from "../model/common";
import { CustomError } from "../model/CustomError";
import { loginUser } from "../user/loginApi";

interface AuthState {
    session: Session | null;
    error: CustomError | null;
    loading: boolean;
    login: (username: string, password: string, onSuccess?: () => void) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    session: null,
    error: null,
    loading: false,

    login: (username, password, onSuccess) => {
        set({ loading: true, error: null });

        loginUser(
            { user_id: -1, username, password },
            (result: Session) => {
                console.log("Login success:", result);
                sessionStorage.setItem("token", result.token);
                set({ session: result, error: null, loading: false });
                if (onSuccess) onSuccess();
            },
            (loginError: CustomError) => {
                console.log("Login error:", loginError);
                set({ error: loginError, session: null, loading: false });
            }
        );
    },

    logout: () => {
        sessionStorage.removeItem("token");
        set({ session: null, error: null, loading: false });
    },
}));
