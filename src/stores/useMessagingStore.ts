import { create } from "zustand";
import { fetchMessagesApi, sendMessageApi } from "../user/messagesApi";
import { fetchRoomsApi, createRoomApi } from "../user/roomsApi";
import {fetchUsersApi} from "../user/usersApi";

export interface User {
    user_id: number;
    username: string;
    last_login: string;
}

export interface Room {
    room_id: number;
    name: string;
    created_on: string;
    created_by: number;
}

export interface Message {
    id: string;
    from: number;
    to?: number;
    room?: number;
    content: string;
    timestamp: string;
}

interface MessagingState {
    users: User[];
    rooms: Room[];
    selectedUser: User | null;
    selectedRoom: Room | null;
    messages: Message[];
    loadingUsers: boolean;
    loadingMessages: boolean;

    // Users
    fetchUsers: () => Promise<void>;
    selectUser: (user: User) => void;

    // Rooms
    fetchRooms: () => Promise<void>;
    selectRoom: (room: Room) => void;
    createRoom: (name: string) => Promise<void>;

    // Messages
    fetchMessages: (userId?: number, roomId?: number) => Promise<void>;
    sendMessage: (content: string) => Promise<void>;
    addMessage: (message: Message | any) => void;
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
    users: [],
    rooms: [],
    selectedUser: null,
    selectedRoom: null,
    messages: [],
    loadingUsers: false,
    loadingMessages: false,

    // -----------------------------
    // Fetch users
    // -----------------------------
    fetchUsers: async () => {
        set({ loadingUsers: true });
        try {
            const username = sessionStorage.getItem("username");
            const data = await fetchUsersApi();
            set({ users: data.filter((u) => u.username !== username), loadingUsers: false });
        } catch (err) {
            console.error("Failed to fetch users", err);
            set({ loadingUsers: false });
        }
    },

    // -----------------------------
    // Fetch rooms
    // -----------------------------
    fetchRooms: async () => {
        try {
            const data = await fetchRoomsApi();
            set({ rooms: data });
        } catch (err) {
            console.error("Failed to fetch rooms", err);
        }
    },

    // -----------------------------
    // Select user (1-to-1 chat)
    // -----------------------------
    selectUser: (user: User) => {
        set({ selectedUser: user, selectedRoom: null, messages: [] });
        window.history.pushState(null, "", `/messages/user/${user.user_id}`);
        get().fetchMessages(user.user_id);
    },

    // -----------------------------
    // Select room chat
    // -----------------------------
    selectRoom: (room: Room) => {
        set({ selectedRoom: room, selectedUser: null, messages: [] });
        window.history.pushState(null, "", `/messages/room/${room.room_id}`);
        get().fetchMessages(undefined, room.room_id);
    },

    // -----------------------------
    // Create a room
    // -----------------------------
    createRoom: async (name: string) => {
        try {
            const newRoom = await createRoomApi(name);
            set((state) => ({ rooms: [...state.rooms, newRoom] }));
        } catch (err) {
            console.error("Failed to create room", err);
        }
    },

    // -----------------------------
    // Fetch messages for user or room
    // -----------------------------
    fetchMessages: async (userId?: number, roomId?: number) => {
        set({ loadingMessages: true });
        try {
            const data = await fetchMessagesApi(userId, roomId);
            set({ messages: data, loadingMessages: false });
        } catch (err) {
            console.error("Failed to fetch messages", err);
            set({ loadingMessages: false });
        }
    },

    // -----------------------------
    // Send message
    // -----------------------------
    sendMessage: async (content: string) => {
        const { selectedUser, selectedRoom } = get();
        if (!content || (!selectedUser && !selectedRoom)) return;

        try {
            let newMsg;
            if (selectedUser) {
                newMsg = await sendMessageApi(selectedUser.user_id, undefined, content);
            } else if (selectedRoom) {
                newMsg = await sendMessageApi(undefined, selectedRoom.room_id, content);
            }
            get().addMessage(newMsg);
        } catch (err) {
            console.error("Failed to send message", err);
        }
    },

    // -----------------------------
    // Add message locally
    // -----------------------------
    addMessage: (message: Message) => {
        set((state) => ({ messages: [...state.messages, message] }));
    },
}));
