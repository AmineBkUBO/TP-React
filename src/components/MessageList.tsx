import { useMessagingStore } from "../stores/useMessagingStore";
import { ListGroup, Spinner } from "react-bootstrap";
import { useRef, useEffect } from "react";
import { ShieldLock } from "react-bootstrap-icons";

export function MessageList() {
    const { messages, loadingMessages } = useMessagingStore();
    const currentUserId = Number(sessionStorage.getItem("userId"));
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (loadingMessages) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="text-center text-muted mt-5">
                <p>No messages yet. Start the conversation!</p>
            </div>
        );
    }

    const formatTimestamp = (timestamp: string | number | Date) => {
        const date: any = new Date(timestamp);
        const now: any = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24 && date.getDate() === now.getDate()) {
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        }

        if (diffInHours < 168) {
            return (
                date.toLocaleDateString([], { weekday: "short" }) +
                " " +
                date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            );
        }

        return (
            date.toLocaleDateString([], { month: "short", day: "numeric" }) +
            " " +
            date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );
    };

    // ✅ Detect if a string is an image URL
    const isImageUrl = (text: string) => {
        try {
            const url = new URL(text);
            return url.pathname.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);
        } catch {
            return false;
        }
    };

    return (
        <ListGroup variant="flush" className="border-0">
            {messages.map((msg) => {
                const isCurrentUser = msg.from === currentUserId;

                return (
                    <ListGroup.Item
                        key={msg.id}
                        className={`border-0 d-flex ${
                            isCurrentUser ? "justify-content-end" : "justify-content-start"
                        } mb-2`}
                        style={{ backgroundColor: "transparent" }}
                    >
                        <div
                            className={`p-3 rounded-3 shadow-sm ${
                                isCurrentUser ? "bg-primary text-white" : "bg-light text-dark border"
                            }`}
                            style={{
                                maxWidth: "70%",
                                wordWrap: "break-word",
                                wordBreak: "break-word",
                            }}
                        >
                            <div className="mb-1">
                                {isImageUrl(msg.content) ? (
                                    <img
                                        src={msg.content}
                                        alt="sent media"
                                        style={{
                                            maxWidth: "100%",
                                            borderRadius: "8px",
                                            display: "block",
                                            marginTop: "5px",
                                        }}
                                    />
                                ) : (
                                    msg.content
                                )}
                            </div>
                            <div
                                className={`small ${
                                    isCurrentUser ? "text-white-50" : "text-muted"
                                } text-end`}
                                style={{ fontSize: "0.75rem" }}
                            >
                                {formatTimestamp(msg.timestamp)}
                            </div>
                        </div>
                    </ListGroup.Item>
                );
            })}

            {/* ✅ Encryption notice */}
            <div className="text-center text-muted small mt-3 mb-2 d-flex justify-content-center align-items-center gap-1">
                <ShieldLock size={14} className="text-secondary" />
                <span>Your messages are securely encrypted in our database</span>
            </div>

            <div ref={messagesEndRef} />
        </ListGroup>
    );
}
