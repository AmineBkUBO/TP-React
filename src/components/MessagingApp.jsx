import { useState, useRef, useEffect } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { useMessagingStore } from "../stores/useMessagingStore";
import { UserList } from "./UserList";
import { MessageList } from "./MessageList";
import { ChatPlaceholder } from "./ChatPlaceholder";

export function MessagingApp() {
    const { selectedUser, selectedRoom, sendMessage, refreshMessages } = useMessagingStore();
    const [text, setText] = useState("");
    const messagesEndRef = useRef(null);

    // ✅ UNIFIED CHAT LOGIC: True if EITHER a user OR a room is selected.
    const activeChat = selectedUser || selectedRoom;

    // Determine the chat header title dynamically
    const chatTitle = selectedUser
        ? `Chat with ${selectedUser.username}`
        : selectedRoom
            ? `Chat In ${selectedRoom.name}`
            : "Select a user or room";

    const handleSend = async () => {
        // Send message only if text is not empty and an active chat exists.
        if (!text.trim() || !activeChat) return;

        // Assuming sendMessage handles whether it's a user or room message based on the store state.
        await sendMessage(text);
        setText("");
    };

    const scrollToBottom = () => {
        // Scrolls the empty <div> at the end of the message list into view.
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // ✅ FIXED useEffect: Scroll on user OR room change
    useEffect(() => {
        // Use a slight delay to ensure messages are rendered before attempting to scroll.
        const timer = setTimeout(() => {
            scrollToBottom();
        }, 100);

        return () => clearTimeout(timer);
    }, [selectedUser, selectedRoom]); // DEPENDENCY ARRAY now includes selectedRoom

    // ✅ Listen for Push Notifications (from Service Worker)
    useEffect(() => {
        const handlePush = (event) => {
            console.log("📨 New push notification received:", event.detail);
            refreshMessages?.(); // Auto-refresh messages list
            scrollToBottom(); // Also scroll to bottom on new message
        };

        window.addEventListener("push-notification", handlePush);
        return () => window.removeEventListener("push-notification", handlePush);
    }, [refreshMessages]);

    return (
        <Row className="vh-100 g-0">
            {/* Sidebar */}
            <Col md={3} className="border-end">
                <div className="p-3 bg-light border-bottom">
                    <h5 className="mb-0">Users/Rooms</h5>
                </div>
                <div className="overflow-auto" style={{ height: "calc(100vh - 57px)" }}>
                    <UserList />
                </div>
            </Col>

            {/* Chat area */}
            <Col md={9} className="d-flex flex-column">
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-3 bg-white border-bottom">
                            <h5 className="mb-0">{chatTitle}</h5>
                        </div>

                        {/* Message List (Scrollable Area) */}
                        <div
                            className="flex-grow-1 overflow-auto p-3 bg-light"
                            style={{ maxHeight: "calc(100vh - 130px)" }}
                            // The ref is moved INSIDE this container to an empty div
                        >
                            <MessageList />
                            {/* Scroll target placed at the end of the content */}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input Form */}
                        <div className="border-top bg-white p-3 mt-auto">
                            <Form
                                className="d-flex gap-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                            >
                                <Form.Control
                                    placeholder="Type a message... | Your messages are securely encrypted in our database"
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
                    <ChatPlaceholder />
                )}
            </Col>
        </Row>
    );
}