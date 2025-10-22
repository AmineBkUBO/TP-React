import { create } from "zustand";
import {fetchUsersApi} from "../user/usersApi";

export interface User {
    user_id: number;
    username: string;
    last_login: string;
}

export interface Message {
    id: string;
    from: number;
    to: number;
    content: string;
    timestamp: string;
}

interface MessagingState {
    users: User[];
    selectedUser: User | null;
    messages: Message[];
    loadingUsers: boolean;
    loadingMessages: boolean;

    fetchUsers: () => Promise<void>;
    selectUser: (user: User) => void;
    fetchMessages: (userId: number) => Promise<void>;
    addMessage: (message: Message) => void;
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
    users: [],
    selectedUser: null,
    messages: [],
    loadingUsers: false,
    loadingMessages: false,

    fetchUsers: async () => {
        set({ loadingUsers: true });
        try {
            const currentUserId = Number(sessionStorage.getItem("user_id"));
            const data = await fetchUsersApi();
            set({ users: data.filter(u => u.user_id !== currentUserId), loadingUsers: false });
        } catch (err) {
            console.error("Failed to fetch users", err);
            set({ loadingUsers: false });
        }
    },


    selectUser: (user: User) => {
        set({ selectedUser: user, messages: [] });
        // Update URL
        window.history.pushState(null, "", `/messages/user/${user.user_id}`);
        get().fetchMessages(user.user_id);
    },

    fetchMessages: async (userId: number) => {
        set({ loadingMessages: true });
        try {
            const token = sessionStorage.getItem("token");
            const res = await fetch(`/api/messages/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data: Message[] = await res.json();
            set({ messages: data, loadingMessages: false });
        } catch (err) {
            console.error("Failed to fetch messages", err);
            set({ loadingMessages: false });
        }
    },

    addMessage: (message: Message) => {
        set((state) => ({ messages: [...state.messages, message] }));
    },
}));
