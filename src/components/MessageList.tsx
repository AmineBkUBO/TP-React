import { useMessagingStore } from "../stores/useMessagingStore";
import { ListGroup, Spinner } from "react-bootstrap";

export function MessageList() {
    const { messages, loadingMessages } = useMessagingStore();

    if (loadingMessages) return <Spinner animation="border" />;

    return (
        <ListGroup>
            {messages.map((msg) => (
                <ListGroup.Item key={msg.id}>
                    <b>{msg.from}:</b> {msg.content} <small className="text-muted">{msg.timestamp}</small>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
}
