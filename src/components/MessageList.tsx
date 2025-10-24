import { useMessagingStore } from "../stores/useMessagingStore";
import { ListGroup, Spinner } from "react-bootstrap";
import { useRef, useEffect } from "react";
import { ShieldCheck } from "react-bootstrap-icons";

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
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="text-muted mt-3 mb-0">Loading messages...</p>
                </div>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="text-center text-muted my-5 py-5">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    fill="currentColor"
                    className="bi bi-chat-left-text mb-3 opacity-50"
                    viewBox="0 0 16 16"
                >
                    <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                    <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
                </svg>
                <p className="fw-medium">No messages yet</p>
                <p className="small mb-0">Start the conversation by sending a message</p>
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
            {messages.map((msg, index) => {
                const isCurrentUser = msg.from === currentUserId;
                const showDate = index === 0 ||
                    new Date(messages[index - 1].timestamp).toDateString() !== new Date(msg.timestamp).toDateString();

                return (
                    <div key={msg.id}>
                        {showDate && (
                            <div className="text-center my-3">
                                <span
                                    className="badge bg-light text-muted border px-3 py-2"
                                    style={{ fontSize: '0.75rem', fontWeight: '500' }}
                                >
                                    {new Date(msg.timestamp).toLocaleDateString([], {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        )}
                        <ListGroup.Item
                            className={`border-0 d-flex ${
                                isCurrentUser ? "justify-content-end" : "justify-content-start"
                            } mb-2 px-0`}
                            style={{ backgroundColor: "transparent" }}
                        >
                            <div
                                className={`px-3 py-2 rounded-3 ${
                                    isCurrentUser
                                        ? "bg-primary text-white"
                                        : "bg-white text-dark border shadow-sm"
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
                                            className="img-fluid"
                                            style={{
                                                maxWidth: "100%",
                                                borderRadius: "8px",
                                                display: "block",
                                                marginTop: "2px",
                                            }}
                                        />
                                    ) : (
                                        <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                                    )}
                                </div>
                                <div
                                    className={`small ${
                                        isCurrentUser ? "text-white-50" : "text-muted"
                                    } text-end mt-1`}
                                    style={{ fontSize: "0.7rem" }}
                                >
                                    {formatTimestamp(msg.timestamp)}
                                </div>
                            </div>
                        </ListGroup.Item>
                    </div>
                );
            })}

            <div className="text-center text-muted small mt-4 mb-3 d-flex justify-content-center align-items-center gap-2">
                <ShieldCheck size={16} className="text-success" />
                <span style={{ fontSize: '0.8rem' }}>End-to-end encrypted</span>
            </div>

            <div ref={messagesEndRef} />
        </ListGroup>
    );
}