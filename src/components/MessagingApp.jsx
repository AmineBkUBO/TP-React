import { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { useMessagingStore } from "../stores/useMessagingStore";
import { UserList } from "./UserList";
import { MessageList } from "./MessageList";

export function MessagingApp() {
    const { selectedUser, sendMessage } = useMessagingStore();
    const [text, setText] = useState("");

    const handleSend = async () => {
        if (!text.trim() || !selectedUser) return;
        await sendMessage(text);
        setText("");
    };

    return (
        <Row className="vh-100">
            <Col md={3} className="border-end p-0">
                <div className="p-2 bg-light border-bottom">
                    <h5>Users</h5>
                </div>
                <div className="overflow-auto" style={{ height: "90vh" }}>
                    <UserList />
                </div>
            </Col>

            <Col md={9} className="d-flex flex-column p-0">
                <div className="flex-grow-1 overflow-auto p-3 bg-white">
                    {selectedUser ? (
                        <>
                            <h5 className="border-bottom pb-2 mb-3">
                                Chat with {selectedUser.username}
                            </h5>
                            <MessageList />
                        </>
                    ) : (
                        <p className="text-muted">Select a user to start chatting.</p>
                    )}
                </div>

                {selectedUser && (
                    <Form
                        className="d-flex p-2 border-top bg-light"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                    >
                        <Form.Control
                            placeholder="Type a message..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <Button
                            type="submit"
                            className="ms-2"
                            variant="primary"
                            disabled={!text.trim()}
                        >
                            Send
                        </Button>
                    </Form>
                )}
            </Col>
        </Row>
    );
}
