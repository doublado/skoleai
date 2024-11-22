<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { vAutoAnimate } from '@formkit/auto-animate';
  import { useUserStore } from '~/stores/userStore';
  import { format } from 'date-fns';
  import { NLayout, NLayoutSider, NLayoutContent, NButton, NDivider, NIcon, NInput, NAvatar } from 'naive-ui';
  import { useRouter } from 'vue-router';

  // Import icons to provide consistent and meaningful visual cues
  import { HomeOutline, ChatboxOutline, LogOutOutline, ChatbubbleEllipsesOutline, TrashOutline, SendOutline } from '@vicons/ionicons5';

  // Ensure only authenticated users can access this page
  definePageMeta({
    middleware: 'auth',
  });

  // Access the user store for user data and authentication status
  const userStore = useUserStore();
  const router = useRouter();

  // Reactive state for chat list to reflect changes dynamically
  const chats = computed(() => userStore.chats);
  const selectedChatId = ref<number | null>(null);

  // Handle user logout and redirect to the login page
  const logout = () => {
    userStore.logout();
    router.push('/login');
  };

  // Allows students to create new chats and update the store
  const createChat = async () => {
    try {
      const response = await $fetch<{
        success: boolean;
        chat?: { id: number; created_at: string; messages: never[] };
        message?: string;
      }>('/api/createChat', {
        method: 'POST',
        body: JSON.stringify({ userId: userStore.user.id }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.success && response.chat) {
        const newChat = {
          ...response.chat,
          id: response.chat.id.toString(),
        };
        userStore.setChats([...userStore.chats, newChat]);
      } else {
        console.error('Error creating chat:', response.message);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  // Selects a chat and loads its messages
  const selectChat = (chatId: number) => {
    selectedChatId.value = chatId;
    loadMessages(chatId);
  };

  // Deletes a chat and updates the UI
  const deleteChat = async (chatId: number) => {
    try {
      const response = await $fetch(`/api/deleteChat`, {
        method: 'POST',
        body: JSON.stringify({ chatId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response && response.success) {
        userStore.setChats(userStore.chats.filter(chat => Number(chat.id) !== chatId));
        if (selectedChatId.value === chatId) {
          selectedChatId.value = null;
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  // Formats chat creation dates for better readability
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy, HH:mm');
  };

  // Placeholder for chat messages to demonstrate functionality
  const messages = ref<{ sender: string; content: string; isAI: boolean }[]>([]);

  // Fetches and loads messages for a specific chat from the server
  const loadMessages = async (chatId: number) => {
    try {
      const response = await $fetch<{
        success: boolean;
        messages: Array<{
          sender_type: 'ai' | 'student';
          content: string;
        }>;
      }>('/api/getMessages', {
        method: 'POST',
        body: JSON.stringify({ chatId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.success) {
        messages.value = response.messages.map((msg) => ({
          sender: msg.sender_type === 'ai' ? 'AI' : userStore.user.name,
          content: msg.content,
          isAI: msg.sender_type === 'ai',
        }));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Sends a message and appends AI's response to the chat
  const messageContent = ref<string>('');
  const sendMessage = async () => {
    if (messageContent.value.trim() !== '') {
      const userMessage = messageContent.value;

      // Display the user's message immediately for a seamless experience
      messages.value.push({
        sender: userStore.user.name,
        content: userMessage,
        isAI: false,
      });

      messageContent.value = '';

      try {
        const response = await $fetch('/api/sendMessage', {
          method: 'POST',
          body: JSON.stringify({
            chatId: selectedChatId.value,
            userId: userStore.user.id,
            message: userMessage,
          }),
          headers: { 'Content-Type': 'application/json' },
        });

        if (response && response.success) {
          messages.value.push({
            sender: 'AI',
            content: response.message,
            isAI: true,
          });
        } else {
          console.error('Error from AI:', response.message);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  // Retrieves the currently selected chat for display
  const selectedChat = computed(() => {
    return chats.value.find(chat => Number(chat.id) === selectedChatId.value) || null;
  });

  // Provides chat search functionality for admin users
  const searchQuery = ref<string>('');
  const searchResults = ref<Array<{ id: number; user_name: string; created_at: string }>>([]);
  const isSearching = ref(false);

  const performSearch = async () => {
    if (!searchQuery.value.trim()) {
      searchResults.value = [];
      return;
    }

    isSearching.value = true;

    try {
      const response = await $fetch<{
        success: boolean;
        results: Array<{ id: number; user_name: string; created_at: string }>;
      }>('/api/searchChats', {
        method: 'POST',
        body: JSON.stringify({ query: searchQuery.value }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.success) {
        searchResults.value = response.results;
      } else {
        searchResults.value = [];
      }
    } catch (error) {
      console.error('Search error:', error);
      searchResults.value = [];
    } finally {
      isSearching.value = false;
    }
  };

  // Selects a chat from search results
  const selectChatFromSearch = (chatId: number) => {
    if (chatId) {
      selectChat(chatId);
    }
  };
</script>

<template>
  <n-layout has-sider class="h-screen">
    <!-- Sidebar for navigation and user-specific actions -->
    <n-layout-sider bordered class="bg-gray-800 text-white w-64 flex flex-col justify-between items-center box-border h-full relative p-4">
      <!-- Header Section for the dashboard title -->
      <div class="w-full mb-6 mt-4">
        <h2 class="text-2xl font-bold text-center">Dashboard</h2>
      </div>

      <!-- Content Section -->
      <div class="flex-grow w-full px-4 space-y-4 overflow-y-auto hide-scrollbar" v-auto-animate>
        <!-- Display content specific to students -->
        <template v-if="userStore.user.role === 'student'">
          <!-- Button to create a new chat -->
          <n-button
            type="primary"
            class="w-full transition duration-300 ease-in-out hover:bg-blue-700"
            @click="createChat"
          >
            <n-icon class="mr-2">
              <ChatboxOutline />
            </n-icon>
            Opret ny chat
          </n-button>

          <!-- Scrollable list of student chats -->
          <div v-for="chat in chats" :key="chat.id" class="flex items-center justify-between mt-3 bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-all duration-300">
            <div class="flex items-center cursor-pointer" @click="selectChat(Number(chat.id))">
              <n-icon class="mr-2 text-blue-400">
                <ChatbubbleEllipsesOutline />
              </n-icon>
              <span class="text-sm font-medium">{{ formatDate(chat.created_at) }}</span>
            </div>
            <!-- Button to delete a chat -->
            <n-button
              type="error"
              ghost
              size="small"
              class="hover-button hover:bg-red-600 hover:text-white transition duration-300 ease-in-out"
              @click="deleteChat(Number(chat.id))"
            >
              <n-icon>
                <TrashOutline />
              </n-icon>
            </n-button>
          </div>
        </template>

        <!-- Display content specific to admins -->
        <template v-if="userStore.user.role === 'admin'">
          <!-- Search bar for admins to search chats -->
          <n-input
            v-model:value="searchQuery"
            placeholder="Søg chats..."
            class="w-full mb-4"
            @input="performSearch"
            clearable
          />

          <!-- List of search results -->
          <div v-if="searchResults.length > 0" class="space-y-3">
            <div
              v-for="result in searchResults"
              :key="result.id"
              class="flex items-center justify-between bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-all duration-300"
            >
              <div class="flex items-center cursor-pointer" @click="selectChatFromSearch(result.id)">
                <n-icon class="mr-2 text-blue-400">
                  <ChatbubbleEllipsesOutline />
                </n-icon>
                <span class="text-sm font-medium">
                  {{ result.user_name }} - {{ formatDate(result.created_at) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Message displayed when no results are found -->
          <div v-else-if="searchQuery.trim() && !isSearching" class="text-center text-sm text-gray-400">
            Ingen resultater fundet.
          </div>

          <!-- Loading state while searching -->
          <div v-if="isSearching" class="text-center text-sm text-gray-400">
            Søger...
          </div>
        </template>
      </div>

      <!-- Bottom Section for logout -->
      <div class="w-full px-4 mt-4 absolute bottom-4">
        <n-divider class="border-gray-700 mb-4" />

        <!-- Logout button -->
        <n-button
          type="error"
          ghost
          class="w-full flex items-center justify-center hover-button hover:bg-red-600 hover:text-white transition duration-300 ease-in-out"
          @click="logout"
        >
          <n-icon class="mr-2">
            <LogOutOutline />
          </n-icon>
          Log ud
        </n-button>
      </div>
    </n-layout-sider>

    <!-- Main content area for chats and messages -->
    <n-layout-content class="p-8 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col relative h-screen">
      <div class="flex flex-col overflow-y-auto mb-6 hide-scrollbar" style="flex-grow: 1; padding-bottom: 6rem;">
        <h1 class="flex items-center text-3xl font-semibold mb-6">
          <n-icon class="mr-2">
            <HomeOutline />
          </n-icon>
          Velkommen, {{ userStore.user.name }}
        </h1>

        <!-- Display the selected chat label -->
        <h2 class="text-xl font-semibold mb-4">
          <template v-if="selectedChat !== null">
            Valgt Chat: {{ formatDate(selectedChat.created_at) }}
          </template>
          <template v-else>
            Ingen chat valgt
          </template>
        </h2>

        <!-- Chat messages -->
        <div class="flex flex-col space-y-4 overflow-y-auto hide-scrollbar" style="flex-grow: 1; padding-bottom: 6rem;">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="flex mb-4"
            :class="{ 'justify-end': !message.isAI }"
          >
            <div v-if="message.isAI" class="flex items-start">
              <!-- AI message block -->
              <n-avatar :size="'small'" :src="'/img/ai-avatar.png'" class="mr-4" />
              <div class="bg-gray-300 text-black p-3 rounded-lg max-w-xs">
                {{ message.content }}
              </div>
            </div>

            <!-- User message block -->
            <div v-else class="flex items-start flex-row-reverse">
              <n-avatar :size="'small'" :src="'/img/user-avatar.png'" class="ml-4" />
              <div class="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                {{ message.content }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input area for new messages -->
      <div v-if="selectedChat !== null" class="w-full bg-gray-100 dark:bg-gray-900 flex items-center fixed bottom-5 left-32 right-0 p-4 box-border justify-center">
        <div class="flex items-center w-full max-w-4xl space-x-4">
          <n-input
            v-model:value="messageContent"
            placeholder="Skriv en besked..."
            class="flex-grow"
            @keydown.enter="sendMessage"
          />
          <n-button type="primary" @click="sendMessage">
            <n-icon>
              <SendOutline />
            </n-icon>
            Send
          </n-button>
        </div>
      </div>
    </n-layout-content>
  </n-layout>
</template>

<style scoped>
  /* Button styling for hover effects to indicate interactivity */
  .hover-button {
    border: 1px solid transparent;
  }
  .hover-button:hover {
    border: 1px solid transparent; /* Prevents border shifting during hover */
    background-color: var(--n-color-error-hover); /* Enhances visibility on hover */
    color: white; /* Ensures text is readable on the hover background */
  }

  /* Style to hide scrollbar while maintaining scroll functionality */
  .hide-scrollbar {
    scrollbar-width: none; /* Hides scrollbar in Firefox */
    -ms-overflow-style: none; /* Hides scrollbar in Internet Explorer 10+ */
    overflow-y: auto; /* Allows vertical scrolling without displaying the scrollbar */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none; /* Hides scrollbar in Chrome, Safari, and Opera */
  }
</style>