export async function registerUser(
    { username, password, email }: { username: string; password: string; email: string },
    onSuccess: (result: any) => void,
    onError: (error: any) => void
) {
    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, email }),
        });

        const data = await response.json();

        if (!response.ok) {
            onError(data);
            return;
        }

        onSuccess(data);
    } catch (error: any) {
        onError({ code: "NETWORK_ERROR", message: error.message || "Network error" });
    }
}
