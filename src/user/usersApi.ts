import { User } from "../stores/useMessagingStore";

export async function fetchUsersApi(): Promise<User[]> {
    const token = sessionStorage.getItem("token");

    const res = await fetch("/api/users", {
        headers: {
            Authorization: `Bearer ${token}`, // <- required
        },
    });

    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch users");
    }

    const data: User[] = await res.json();
    return data;
}
