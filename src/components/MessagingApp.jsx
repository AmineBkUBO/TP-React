import { useState, useRef, useEffect } from "react";
import { Row, Col, Form, Button, Badge } from "react-bootstrap";
import { useMessagingStore } from "../stores/useMessagingStore";
import { UserList } from "./UserList";
import { MessageList } from "./MessageList";
import { ChatPlaceholder } from "./ChatPlaceholder";
import { upload } from "@vercel/blob/client";
import { Image, Send } from "react-bootstrap-icons";

export function MessagingApp() {
    const { selectedUser, selectedRoom, sendMessage, refreshMessages } = useMessagingStore();
    const [text, setText] = useState("");
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);
    const messagesEndRef = useRef(null);

    const activeChat = selectedUser || selectedRoom;

    const chatTitle = selectedUser
        ? selectedUser.username
        : selectedRoom
            ? selectedRoom.name
            : "Select a user or room";

    const chatSubtitle = selectedUser
        ? "Direct Message"
        : selectedRoom
            ? "Group Chat"
            : "";

    const handleSend = async () => {
        if (!text.trim() || !activeChat) return;
        await sendMessage(text);
        setText("");
    };

    const handleImageUpload = async () => {
        if (!fileRef.current?.files?.length) return;
        const file = fileRef.current.files[0];
        setUploading(true);

        try {
            const blob = await upload(file.name, file, {
                access: "public",
                handleUploadUrl: "http://localhost:3000/api/MediaUpload",
            });

            await sendMessage(blob.url);
        } catch (err) {
            console.error("Image upload failed:", err);
            alert("Image upload failed! Check console.");
        } finally {
            setUploading(false);
            fileRef.current.value = null;
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const timer = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timer);
    }, [selectedUser, selectedRoom]);

    useEffect(() => {
        const handlePush = (event) => {
            console.log("📨 New push notification received:", event.detail);
            refreshMessages?.();
            scrollToBottom();
        };
        window.addEventListener("push-notification", handlePush);
        return () => window.removeEventListener("push-notification", handlePush);
    }, [refreshMessages]);

    return (
        <Row className="vh-100 g-0">
            {/* Sidebar */}
            <Col md={3} className="border-end bg-light">
                <div className="p-3 bg-white border-bottom shadow-sm">
                    <h5 className="mb-0 fw-semibold">Conversations</h5>
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
                        <div className="p-3 bg-white border-bottom shadow-sm">
                            <div className="d-flex align-items-center">
                                <div
                                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white me-3"
                                    style={{ width: '40px', height: '40px', fontSize: '1.1rem', fontWeight: '600' }}
                                >
                                    {chatTitle.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h6 className="mb-0 fw-semibold">{chatTitle}</h6>
                                    <small className="text-muted">
                                        {chatSubtitle}
                                        {selectedRoom && <Badge bg="secondary" className="ms-2">Room</Badge>}
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* Message List */}
                        <div className="flex-grow-1 overflow-auto p-3" style={{
                            maxHeight: "calc(100vh - 130px)",
                            backgroundColor: "#f8f9fa"
                        }}>
                            <MessageList />
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input Form */}
                        <div className="border-top bg-white p-3 shadow-sm">
                            <Form
                                className="d-flex gap-2 align-items-end"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                            >
                                <Form.Control
                                    as="textarea"
                                    rows={1}
                                    placeholder="Type your message..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    style={{
                                        resize: 'none',
                                        minHeight: '40px',
                                        maxHeight: '120px'
                                    }}
                                    className="rounded-pill"
                                />

                                <input
                                    type="file"
                                    ref={fileRef}
                                    style={{ display: "none" }}
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />

                                <Button
                                    variant="outline-secondary"
                                    onClick={() => fileRef.current?.click()}
                                    disabled={uploading}
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: '40px', height: '40px', padding: '0' }}
                                    title={uploading ? "Uploading..." : "Attach image"}
                                >
                                    <Image size={18} />
                                </Button>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={!text.trim()}
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: '40px', height: '40px', padding: '0' }}
                                    title="Send message"
                                >
                                    <Send size={18} />
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