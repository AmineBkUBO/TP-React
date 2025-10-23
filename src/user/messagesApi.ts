import { Message } from "../stores/useMessagingStore";

// ✅ Fetch all messages between current user and another user
export async function fetchMessagesApi(receiver_id: number): Promise<Message[]> {
    const token = sessionStorage.getItem("token");

    const res = await fetch(`/api/message?receiver_id=${receiver_id}`, {
        headers: {
            Authentication: `Bearer ${token}`,
        },
    });

    if (res.status === 401) throw new Error("UNAUTHORIZED");
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch messages");
    }

    const data: Message[] = await res.json();
    return data;
}

// ✅ Send a new message
export async function sendMessageApi(receiver_id: number, content: string): Promise<Message> {
    const token = sessionStorage.getItem("token");
    const sender_id = Number(sessionStorage.getItem("userId"));

    const res = await fetch("/api/message", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authentication: `Bearer ${token}`,
        },
        body: JSON.stringify({
            sender_id,
            receiver_id,
            content,
        }),
    });

    if (res.status === 401) throw new Error("UNAUTHORIZED");
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to send message");
    }

    const data: Message = await res.json();
    return data;
}
