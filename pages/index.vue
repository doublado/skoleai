<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { vAutoAnimate } from '@formkit/auto-animate';
import { useUserStore } from '~/stores/userStore';
import { format } from 'date-fns';
import { NLayout, NLayoutSider, NLayoutContent, NButton, NDivider, NIcon, NInput, NAvatar } from 'naive-ui';
import { useRouter } from 'vue-router';

// Import icons from vicons with correct names
import { HomeOutline, ChatboxOutline, LogOutOutline, ChatbubbleEllipsesOutline, TrashOutline, SendOutline } from '@vicons/ionicons5';

// Apply authentication middleware to restrict access to authenticated users only
definePageMeta({
  middleware: 'auth',
});

// Get user store instance
const userStore = useUserStore();
const router = useRouter();

// Make chat list a computed property so it remains reactive
const chats = computed(() => userStore.chats);
const selectedChatId = ref<number | null>(null);

// Logout function
const logout = () => {
  userStore.logout();
  router.push('/login');
};

// Create new chat (students only)
const createChat = async () => {
  try {
    const response = await $fetch('/api/createChat', {
      method: 'POST',
      body: JSON.stringify({ userId: userStore.user.id }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response && response.success) {
      userStore.setChats([...userStore.chats, response.chat]);
    }
  } catch (error) {
    console.error('Error creating chat:', error);
  }
};

// Select a chat
const selectChat = (chatId: number) => {
  selectedChatId.value = chatId;
};

// Delete a chat
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
      userStore.setChats(userStore.chats.filter(chat => chat.id !== chatId));
      if (selectedChatId.value === chatId) {
        selectedChatId.value = null;
      }
    }
  } catch (error) {
    console.error('Error deleting chat:', error);
  }
};

// Format chat creation date to a more readable format
const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd/MM/yyyy, HH:mm');
};

// Placeholder message list for demo purposes
const messages = ref<{ sender: string; content: string; isAI: boolean }[]>([]);

// Watch for changes to `selectedChatId` to load messages accordingly
watch(selectedChatId, (newChatId) => {
  if (newChatId !== null) {
    messages.value = [
      { sender: 'AI', content: 'Hello! How can I help you today?', isAI: true },
    ];
  } else {
    messages.value = [];
  }
});

// Get selected chat info
const selectedChat = computed(() => {
  return chats.value.find(chat => chat.id === selectedChatId.value) || null;
});

// Sending message to the chat
const messageContent = ref<string>('');
const sendMessage = () => {
  if (messageContent.value.trim() !== '') {
    messages.value.push({
      sender: userStore.user.name,
      content: messageContent.value,
      isAI: false,
    });
    messageContent.value = '';

    // Simulate an AI response for demo purposes
    setTimeout(() => {
      messages.value.push({
        sender: 'AI',
        content: 'This is an automated response to your message.',
        isAI: true,
      });
    }, 1000);
  }
};
</script>

<template>
  <n-layout has-sider class="h-screen">
    <!-- Sidebar -->
    <n-layout-sider bordered class="bg-gray-800 text-white w-64 flex flex-col justify-between items-center box-border h-full relative p-4">
      <!-- Header Section -->
      <div class="w-full mb-6 mt-4">
        <h2 class="text-2xl font-bold text-center">Dashboard</h2>
      </div>

      <!-- Content Section -->
      <div class="flex-grow w-full px-4 space-y-4 overflow-y-auto hide-scrollbar" v-auto-animate>
        <!-- Student-specific content -->
        <template v-if="userStore.user.role === 'student'">
          <!-- Create New Chat Button -->
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

          <!-- Scrollable Chat List -->
          <div v-for="chat in chats" :key="chat.id" class="flex items-center justify-between mt-3 bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-all duration-300">
            <div class="flex items-center cursor-pointer" @click="selectChat(chat.id)">
              <n-icon class="mr-2 text-blue-400">
                <ChatbubbleEllipsesOutline />
              </n-icon>
              <span class="text-sm font-medium">{{ formatDate(chat.created_at) }}</span>
            </div>
            <n-button
              type="error"
              ghost
              size="small"
              class="hover-button hover:bg-red-600 hover:text-white transition duration-300 ease-in-out"
              @click="deleteChat(chat.id)"
            >
              <n-icon>
                <TrashOutline />
              </n-icon>
            </n-button>
          </div>
        </template>
      </div>

      <!-- Bottom Section -->
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

    <!-- Main Content Area -->
    <n-layout-content class="p-8 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col relative h-screen">
      <div class="flex flex-col overflow-y-auto mb-6 hide-scrollbar" style="flex-grow: 1; padding-bottom: 6rem;">
        <h1 class="flex items-center text-3xl font-semibold mb-6">
          <n-icon class="mr-2">
            <HomeOutline />
          </n-icon>
          Velkommen, {{ userStore.user.name }}
        </h1>

        <!-- Selected Chat Label -->
        <h2 class="text-xl font-semibold mb-4">
          <template v-if="selectedChat !== null">
            Valgt Chat: {{ formatDate(selectedChat.created_at) }}
          </template>
          <template v-else>
            Ingen chat valgt
          </template>
        </h2>

        <!-- Chat Messages -->
        <div class="flex flex-col space-y-4 overflow-y-auto hide-scrollbar" style="flex-grow: 1; padding-bottom: 6rem;">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="flex mb-4"
            :class="{ 'justify-end': !message.isAI }"
          >
            <div v-if="message.isAI" class="flex items-start">
              <n-avatar :size="'small'" :src="'/ai-avatar.png'" class="mr-4" />
              <div class="bg-gray-300 text-black p-3 rounded-lg max-w-xs">
                {{ message.content }}
              </div>
            </div>

            <!-- User Message Block -->
            <div v-else class="flex items-start flex-row-reverse">
              <n-avatar :size="'small'" :src="'/user-avatar.png'" class="ml-4" />
              <div class="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                {{ message.content }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message Input -->
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
  .hover-button {
    border: 1px solid transparent;
  }
  .hover-button:hover {
    border: 1px solid transparent;
    background-color: var(--n-color-error-hover);
    color: white;
  }

  /* Hide scrollbar but keep scrolling functionality */
  .hide-scrollbar {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* Internet Explorer 10+ */
    overflow-y: auto; /* Ensure scrolling is available but without visible scrollbar */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
</style>