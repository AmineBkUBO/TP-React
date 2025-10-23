import { useMessagingStore } from "../stores/useMessagingStore";
import { ListGroup, Spinner } from "react-bootstrap";

export function MessageList() {
    const { messages, loadingMessages } = useMessagingStore();

    if (loadingMessages) return <Spinner animation="border" />;

    return (
        <ListGroup variant="flush">
            {messages.map((msg) => (
                <ListGroup.Item
                    key={msg.id}
                    className={`d-flex ${
                        msg.from === Number(sessionStorage.getItem("user_id"))
                            ? "justify-content-end"
                            : "justify-content-start"
                    }`}
                >
                    <div
                        className={`p-2 rounded ${
                            msg.from === Number(sessionStorage.getItem("user_id"))
                                ? "bg-primary text-white"
                                : "bg-light text-dark"
                        }`}
                        style={{ maxWidth: "70%" }}
                    >
                        {msg.content}
                        <div className="small text-muted text-end">{msg.timestamp}</div>
                    </div>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
}
