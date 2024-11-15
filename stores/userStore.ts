import { defineStore } from 'pinia';

interface Chat {
  id: string;
  created_at: string;
  messages: any[];
}

export const useUserStore = defineStore({
  id: 'useUserStore',
  state: () => ({
    user: {
      id: '',
      name: '',
      email: '',
      role: '',
    },
    chats: [] as Chat[],
    isAuthenticated: false,
  }),
  actions: {
    setUser(userData: { id: string; name: string; email: string; role: string }) {
      this.user = userData;
      this.isAuthenticated = true;
    },
    setChats(chats: Chat[]) {
      this.chats = chats;
    },
    clearUser() {
      this.user = { id: '', name: '', email: '', role: '' };
      this.chats = [];
      this.isAuthenticated = false;
    },
    logout() {
      this.clearUser();
    },
  },
  // Persist user state to maintain authentication and chats across sessions
  persist: true,
});