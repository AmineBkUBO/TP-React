import { useState, useRef, useEffect } from "react"; // ⬅️ Import useRef and useEffect
import { Row, Col, Form, Button } from "react-bootstrap";
import { useMessagingStore } from "../stores/useMessagingStore";
import { UserList } from "./UserList";
import { MessageList } from "./MessageList";

export function MessagingApp() {
    const { selectedUser, sendMessage } = useMessagingStore();
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

    useEffect(() => {
        scrollToBottom();
    }, [selectedUser]);

    return (
        <Row className="vh-100 g-0">
            {/* Users Sidebar (No Change) */}
            <Col md={3} className="border-end">
                <div className="p-3 bg-light border-bottom">
                    <h5 className="mb-0">Users</h5>
                </div>
                <div className="overflow-auto" style={{ height: "calc(100vh - 57px)" }}>
                    <UserList />
                </div>
            </Col>

            {/* Chat Area */}
            <Col md={9} className="d-flex flex-column">
                {selectedUser ? (
                    <>
                        {/* Chat Header (No Change) */}
                        <div className="p-3 bg-white border-bottom">
                            <h5 className="mb-0">
                                Chat with {selectedUser.username}
                            </h5>
                        </div>

                        {/* Messages Area */}
                        <div
                            className="flex-grow-1 overflow-auto p-3 bg-light"
                            style={{ maxHeight: "calc(100vh - 130px)" }}
                            ref={messagesEndRef} // ⬅️ Apply the ref here
                        >
                            <MessageList />
                            {/* <div ref={messagesEndRef} /> <-- OPTION B: An empty div at the bottom */}
                        </div>

                        {/* Input Form (No Change) */}
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
                    <div className="d-flex flex-column justify-content-center align-items-center h-100">
                        <div className="text-center text-muted">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="48"
                                height="48"
                                fill="currentColor"
                                className="bi bi-chat-dots mb-3"
                                viewBox="0 0 16 16"
                            >
                                <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                                <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9.06 9.06 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.437 10.437 0 0 1-.524 2.318l-.003.011a10.722 10.722 0 0 1-.244.637c-.079.186.074.394.273.362a21.673 21.673 0 0 0 .693-.125zm.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6c0 3.193-3.004 6-7 6a8.06 8.06 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a10.97 10.97 0 0 0 .398-2z"/>
                            </svg>
                            <h5>Select a user to start chatting</h5>
                            <p className="small">Choose from the list on the left</p>
                        </div>
                    </div>
                )}
            </Col>
        </Row>
    );
}