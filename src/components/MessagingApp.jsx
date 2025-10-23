import { useState, useRef, useEffect } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { useMessagingStore } from "../stores/useMessagingStore";
import { UserList } from "./UserList";
import { MessageList } from "./MessageList";
import { ChatPlaceholder } from "./ChatPlaceholder";
import { upload } from "@vercel/blob/client";

export function MessagingApp() {
    const { selectedUser, selectedRoom, sendMessage, refreshMessages } = useMessagingStore();
    const [text, setText] = useState("");
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);
    const messagesEndRef = useRef(null);

    const activeChat = selectedUser || selectedRoom;

    const chatTitle = selectedUser
        ? `Chat with ${selectedUser.username}`
        : selectedRoom
            ? `Chat In ${selectedRoom.name}`
            : "Select a user or room";

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
            // Upload image to Vercel Blob
            const blob = await upload(file.name, file, {
                access: "public",
                handleUploadUrl: "http://localhost:3000/api/MediaUpload",
            });

            // Send the uploaded image URL as a message
            await sendMessage(blob.url);
        } catch (err) {
            console.error("Image upload failed:", err);
            alert("Image upload failed! Check console.");
        } finally {
            setUploading(false);
            fileRef.current.value = null; // Reset file input
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

                        {/* Message List */}
                        <div className="flex-grow-1 overflow-auto p-3 bg-light" style={{ maxHeight: "calc(100vh - 130px)" }}>
                            <MessageList />
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

                                {/* Image Upload Input */}
                                <input
                                    type="file"
                                    ref={fileRef}
                                    style={{ display: "none" }}
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                <Button
                                    variant="secondary"
                                    onClick={() => fileRef.current?.click()}
                                    disabled={uploading}
                                >
                                    {uploading ? "Uploading..." : "Media"}
                                </Button>

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
