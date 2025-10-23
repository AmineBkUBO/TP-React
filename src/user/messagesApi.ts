// Fetch messages between current user and another user OR room
import {Message} from "../stores/useMessagingStore";

export async function fetchMessagesApi(receiver_id?: number, room_id?: number): Promise<Message[]> {
    const token = sessionStorage.getItem("token");
    const params = new URLSearchParams();
    if (receiver_id) params.append("receiver_id", String(receiver_id));
    if (room_id) params.append("room_id", String(room_id));

    const res = await fetch(`/api/message?${params.toString()}`, {
        headers: { Authentication: `Bearer ${token}` },
    });

    if (res.status === 401) throw new Error("UNAUTHORIZED");
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch messages");
    }

    return res.json();
}

// Send message to user or room
export async function sendMessageApi(receiver_id?: number, room_id?: string | number, content?: string): Promise<Message> {
    const token = sessionStorage.getItem("token");
    const sender_id = Number(sessionStorage.getItem("userId"));

    const body: any = { sender_id, content };
    if (receiver_id) body.receiver_id = receiver_id;
    if (room_id) body.room_id = room_id;

    const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authentication: `Bearer ${token}` },
        body: JSON.stringify(body),
    });

    if (res.status === 401) throw new Error("UNAUTHORIZED");
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to send message");
    }

    return res.json();
}
