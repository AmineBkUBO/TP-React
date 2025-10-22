import { useEffect } from "react";
import { useMessagingStore } from "../stores/useMessagingStore";
import { ListGroup, Spinner } from "react-bootstrap";

export function UserList() {
    const { users, fetchUsers, selectUser, selectedUser, loadingUsers } = useMessagingStore();

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loadingUsers) return <Spinner animation="border" />;

    return (
        <ListGroup>
            {users.map((user) => (
                <ListGroup.Item
                    key={user.user_id}
                    action
                    active={selectedUser?.user_id === user.user_id}
                    onClick={() => selectUser(user)}
                >
                    {user.username} <small className="text-muted">({user.last_login})</small>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
}
