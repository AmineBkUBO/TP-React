export type Room = {
    room_id: number;
    name: string;
    created_on: string;
    created_by: number;
};

// Fetch all rooms
export async function fetchRoomsApi(): Promise<Room[]> {
    const token = sessionStorage.getItem("token");
    const res = await fetch("/api/rooms", {
        headers: { Authentication: `Bearer ${token}` },
    });

    if (res.status === 401) throw new Error("UNAUTHORIZED");
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch rooms");
    }

    return res.json();
}

// Create a new room
export async function createRoomApi(name: string): Promise<Room> {
    const token = sessionStorage.getItem("token");
    const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authentication: `Bearer ${token}` },
        body: JSON.stringify({ name }),
    });

    if (res.status === 401) throw new Error("UNAUTHORIZED");
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create room");
    }

    return res.json();
}
