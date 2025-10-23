import { useEffect } from "react";
import { useMessagingStore } from "../stores/useMessagingStore";
import { ListGroup, Spinner } from "react-bootstrap";

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

    if (loadingUsers) return <Spinner animation="border" />;

    return (
        <div>
            {/* Rooms Section */}
            <h5 className="mt-3 mb-2">Rooms:</h5>
            <ListGroup className="mb-4">
                {rooms.map((room) => (
                    <ListGroup.Item
                        key={`room-${room.room_id}`}
                        action
                        active={selectedRoom?.room_id === room.room_id}
                        onClick={() => selectRoom(room)}
                    >
                        🏠 {room.name}
                    </ListGroup.Item>
                ))}
                {rooms.length === 0 && (
                    <ListGroup.Item disabled>No rooms available</ListGroup.Item>
                )}
            </ListGroup>

            {/* Users Section */}
            <h5 className="mt-3 mb-2">Users:</h5>
            <ListGroup>
                {users.map((user) => (
                    <ListGroup.Item
                        key={`user-${user.user_id}`}
                        action
                        active={selectedUser?.user_id === user.user_id}
                        onClick={() => selectUser(user)}
                    >
                        👤 {user.username}{" "}
                        <small className="text-muted">
                            ({user.last_login || "No recent activity"})
                        </small>
                    </ListGroup.Item>
                ))}
                {users.length === 0 && (
                    <ListGroup.Item disabled>No users available</ListGroup.Item>
                )}
            </ListGroup>
        </div>
    );
}
