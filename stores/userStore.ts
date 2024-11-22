import { defineStore } from 'pinia';

interface Chat {
  id: string; // Unique identifier for each chat
  created_at: string; // Timestamp indicating when the chat was created
  messages: any[]; // Placeholder for chat messages
}

export const useUserStore = defineStore({
  id: 'useUserStore', // Unique identifier for the store
  state: () => ({
    // Store user information and authentication state
    user: {
      id: '',
      name: '',
      email: '',
      role: '', // Role can be 'student' or 'admin'
    },
    // Store chats associated with the user
    chats: [] as Chat[],
    // Track whether the user is authenticated
    isAuthenticated: false,
  }),
  actions: {
    // Set user data and mark the user as authenticated
    setUser(userData: { id: string; name: string; email: string; role: string }) {
      this.user = userData;
      this.isAuthenticated = true;
    },
    // Replace the chats array with a new set of chats
    setChats(chats: Chat[]) {
      this.chats = chats;
    },
    // Clear user data and reset the store to its default state
    clearUser() {
      this.user = { id: '', name: '', email: '', role: '' };
      this.chats = [];
      this.isAuthenticated = false;
    },
    // Log the user out by clearing their data
    logout() {
      this.clearUser();
    },
  },
  // Persist the user state to maintain authentication and chat data across sessions
  persist: true,
});