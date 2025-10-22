import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

export function Login() {
    const router = useNavigate();
    const { session, error, login } = useAuthStore();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const username = data.get('login') as string;
        const password = data.get('password') as string;

        login(username, password, () => {
            form.reset();
            router("/Chat");
        });
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <input name="login" placeholder="login" /><br />
                <input name="password" placeholder="password" type="password" /><br />
                <button type="submit">connexion</button>
            </form>
        </>
    );
}
