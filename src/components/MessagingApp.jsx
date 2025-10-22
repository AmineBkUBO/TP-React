import { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { useMessagingStore } from "../stores/useMessagingStore";
import { UserList } from "./UserList";
import { MessageList } from "./MessageList";

export function MessagingApp() {
    const { selectedUser, addMessage } = useMessagingStore();
    const [text, setText] = useState("");

    const handleSend = () => {
        if (!text || !selectedUser) return;

        const message = {
            id: crypto.randomUUID(),
            from: Number(sessionStorage.getItem("user_id")),
            to: selectedUser.user_id,
            content: text,
            timestamp: new Date().toLocaleString(),
        };

        addMessage(message);
        setText("");
        // TODO: send to backend
    };

    return (
        <Row className="vh-100">
            <Col md={3} className="border-end">
                <UserList />
            </Col>
            <Col md={9} className="d-flex flex-column">
                <div className="flex-grow-1 overflow-auto">
                    {selectedUser ? <MessageList /> : <p>Select a user to start chatting</p>}
                </div>
                {selectedUser && (
                    <Form className="d-flex mt-2">
                        <Form.Control
                            placeholder="Type a message"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <Button onClick={handleSend} className="ms-2">
                            Send
                        </Button>
                    </Form>
                )}
            </Col>
        </Row>
    );
}
