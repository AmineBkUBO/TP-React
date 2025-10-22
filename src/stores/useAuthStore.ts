import { create } from 'zustand'
import { Session } from "../model/common"
import { CustomError } from "../model/CustomError"
import {loginUser} from "../user/loginApi";

interface AuthState {
    session: Session
    error: CustomError
    login: (username: string, password: string, onSuccess?: () => void) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    session: {} as Session,
    error: {} as CustomError,

    login: (username, password, onSuccess) => {
        loginUser(
            { user_id: -1, username, password },
            (result: Session) => {
                console.log("Login success:", result);
                sessionStorage.setItem("token", result.token);
                set({ session: result, error: new CustomError("") });
                if (onSuccess) onSuccess();
            },
            (loginError: CustomError) => {
                console.log("Login error:", loginError);
                set({ error: loginError, session: {} as Session });
            }
        );
    },

    logout: () => {
        set({ session: {} as Session, error: {} as CustomError });
    }
}));
