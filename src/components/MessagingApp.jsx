import { useState, useRef, useEffect } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { useMessagingStore } from "../stores/useMessagingStore";
import { UserList } from "./UserList";
import { MessageList } from "./MessageList";
import {ChatPlaceholder} from "./ChatPlaceholder";

export function MessagingApp() {
    const { selectedUser, sendMessage, refreshMessages } = useMessagingStore();
    const [text, setText] = useState("");
    const messagesEndRef = useRef(null);

    const handleSend = async () => {
        if (!text.trim() || !selectedUser.user_id) return;
        await sendMessage(text);
        setText("");
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Scroll on user change
    useEffect(() => {
        scrollToBottom();
    }, [selectedUser]);

    // ✅ Listen for Push Notifications (from Service Worker)
    useEffect(() => {
        const handlePush = (event) => {
            console.log("📨 New push notification received:", event.detail);
            refreshMessages?.(); // Auto-refresh messages list
        };

        window.addEventListener("push-notification", handlePush);
        return () => window.removeEventListener("push-notification", handlePush);
    }, [refreshMessages]);

    return (
        <Row className="vh-100 g-0">
            {/* Sidebar */}
            <Col md={3} className="border-end">
                <div className="p-3 bg-light border-bottom">
                    <h5 className="mb-0">Users</h5>
                </div>
                <div className="overflow-auto" style={{ height: "calc(100vh - 57px)" }}>
                    <UserList />
                </div>
            </Col>

            {/* Chat area */}
            <Col md={9} className="d-flex flex-column">
                {selectedUser ? (
                    <>
                        <div className="p-3 bg-white border-bottom">
                            <h5 className="mb-0">
                                Chat with {selectedUser.username}
                            </h5>
                        </div>

                        <div
                            className="flex-grow-1 overflow-auto p-3 bg-light"
                            style={{ maxHeight: "calc(100vh - 130px)" }}
                            ref={messagesEndRef}
                        >
                            <MessageList />
                        </div>

                        <div className="border-top bg-white p-3 mt-auto">
                            <Form
                                className="d-flex gap-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                            >
                                <Form.Control
                                    placeholder="Type a message..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                />
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={!text.trim()}
                                    style={{ minWidth: "80px" }}
                                >
                                    Send
                                </Button>
                            </Form>
                        </div>
                    </>
                ) : (
                    <ChatPlaceholder/>
                )}
            </Col>
        </Row>
    );
}
