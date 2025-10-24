import { useEffect } from "react";
import { useMessagingStore } from "../stores/useMessagingStore";
import { ListGroup, Spinner, Badge } from "react-bootstrap";
import { House, PersonFill } from "react-bootstrap-icons";

export function UserList() {
    const {
        users,
        rooms,
        fetchUsers,
        fetchRooms,
        selectUser,
        selectRoom,
        selectedUser,
        selectedRoom,
        loadingUsers,
    } = useMessagingStore();

    useEffect(() => {
        fetchUsers();
        fetchRooms();
    }, [fetchUsers, fetchRooms]);

    if (loadingUsers) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="text-muted mt-3 mb-0 small">Loading conversations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-2 py-3">
            {/* Rooms Section */}
            {rooms.length > 0 && (
                <>
                    <div className="px-2 mb-2">
                        <small className="text-uppercase text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
                            Group Chats
                        </small>
                    </div>
                    <ListGroup className="mb-4">
                        {rooms.map((room) => (
                            <ListGroup.Item
                                key={`room-${room.room_id}`}
                                action
                                active={selectedRoom?.room_id === room.room_id}
                                onClick={() => selectRoom(room)}
                                className="border-0 rounded-3 mb-1 d-flex align-items-center"
                                style={{
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    backgroundColor: selectedRoom?.room_id === room.room_id ? '' : 'transparent'
                                }}
                            >
                                <div
                                    className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                                        selectedRoom?.room_id === room.room_id ? 'bg-white text-primary' : 'bg-primary text-white'
                                    }`}
                                    style={{ width: '36px', height: '36px', minWidth: '36px' }}
                                >
                                    <House size={18} />
                                </div>
                                <div className="flex-grow-1 overflow-hidden">
                                    <div className="fw-semibold text-truncate">{room.name}</div>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </>
            )}

            {/* Users Section */}
            <div className="px-2 mb-2">
                <small className="text-uppercase text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
                    Direct Messages
                </small>
            </div>
            <ListGroup>
                {users.map((user) => (
                    <ListGroup.Item
                        key={`user-${user.user_id}`}
                        action
                        active={selectedUser?.user_id === user.user_id}
                        onClick={() => selectUser(user)}
                        className="border-0 rounded-3 mb-1 d-flex align-items-center"
                        style={{
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            backgroundColor: selectedUser?.user_id === user.user_id ? '' : 'transparent'
                        }}
                    >
                        <div
                            className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                                selectedUser?.user_id === user.user_id ? 'bg-white text-primary' : 'bg-secondary text-white'
                            }`}
                            style={{
                                width: '36px',
                                height: '36px',
                                minWidth: '36px',
                                fontSize: '0.9rem',
                                fontWeight: '600'
                            }}
                        >
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                            <div className="fw-semibold text-truncate">{user.username}</div>
                            {user.last_login && (
                                <small className="text-muted d-block text-truncate" style={{ fontSize: '0.75rem' }}>
                                    {user.last_login}
                                </small>
                            )}
                        </div>
                    </ListGroup.Item>
                ))}
                {users.length === 0 && (
                    <ListGroup.Item disabled className="border-0 text-center text-muted py-4">
                        <PersonFill size={32} className="mb-2 opacity-50" />
                        <div className="small">No users available</div>
                    </ListGroup.Item>
                )}
            </ListGroup>
        </div>
    );
}