import { create } from "zustand";
import { fetchUsersApi } from "../user/usersApi";
import { fetchMessagesApi, sendMessageApi } from "../user/messagesApi";

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
    sendMessage: (content: string) => Promise<void>;
    addMessage: (message: Message) => void;
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
    users: [],
    selectedUser: null,
    messages: [],
    loadingUsers: false,
    loadingMessages: false,

    // ✅ Fetch all users except the current one
    fetchUsers: async () => {
        set({ loadingUsers: true });
        try {
            const username = sessionStorage.getItem("username");
            const data = await fetchUsersApi();
            set({
                users: data.filter((u) => u.username !== username),
                loadingUsers: false,
            });
        } catch (err) {
            console.error("Failed to fetch users", err);
            set({ loadingUsers: false });
        }
    },

    // ✅ Select a user and fetch messages
    selectUser: (user: User) => {
        set({ selectedUser: user, messages: [] });
        window.history.pushState(null, "", `/messages/user/${user.user_id}`);
        get().fetchMessages(user.user_id);
    },

    // ✅ Fetch messages for the selected user
    fetchMessages: async (userId: number) => {
        set({ loadingMessages: true });
        try {
            const data = await fetchMessagesApi(userId);
            set({ messages: data, loadingMessages: false });
        } catch (err) {
            console.error("Failed to fetch messages", err);
            set({ loadingMessages: false });
        }
    },

    // ✅ Send message and add it to UI
    sendMessage: async (content: string) => {
        const user = get().selectedUser;
        if (!user) return;

        try {
            const newMsg = await sendMessageApi(user.user_id, content);
            get().addMessage(newMsg);
        } catch (err) {
            console.error("Failed to send message", err);
        }
    },

    // ✅ Add message locally
    addMessage: (message: Message) => {
        set((state) => ({ messages: [...state.messages, message] }));
    },
}));
