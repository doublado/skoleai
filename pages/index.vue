<script setup lang="ts">
  import { ref } from 'vue';
  import { vAutoAnimate } from '@formkit/auto-animate';
  import { useUserStore } from '~/stores/userStore';
  import { NLayout, NLayoutSider, NLayoutContent, NButton, NDivider, NIcon } from 'naive-ui';
  import { useRouter } from 'vue-router';

  // Import icons from vicons with correct names
  import { HomeOutline, ChatboxOutline, LogOutOutline, ChatbubbleEllipsesOutline, TrashOutline } from '@vicons/ionicons5';

  // Apply authentication middleware to restrict access to authenticated users only
  definePageMeta({
    middleware: 'auth',
  });

  const userStore = useUserStore();
  const router = useRouter();
  const demoChats = ref([{ id: 1, name: new Date().toLocaleString() }]);

  // Logout function
  const logout = () => {
    userStore.logout();
    router.push('/login');
  };

  // Create new chat (students only)
  const createChat = () => {
    const newChat = {
      id: demoChats.value.length + 1,
      name: new Date().toLocaleString(),
    };
    demoChats.value.push(newChat);
    console.log('New chat created:', newChat.name);
  };

  // Select a demo chat (for testing purposes)
  const selectChat = (chatId) => {
    console.log(`Selected chat with ID: ${chatId}`);
  };

  // Delete a demo chat
  const deleteChat = (chatId) => {
    demoChats.value = demoChats.value.filter((chat) => chat.id !== chatId);
    console.log(`Deleted chat with ID: ${chatId}`);
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
      <div class="flex-grow w-full px-4 space-y-4">
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

          <!-- Scrollable Chat List with auto-animate and hidden scrollbar -->
          <div
            v-auto-animate
            class="mt-4 overflow-y-auto hide-scrollbar"
            style="max-height: calc(100vh - 300px);"
          >
            <div
              v-for="chat in demoChats"
              :key="chat.id"
              class="flex items-center justify-between mt-3 bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-all duration-300"
            >
              <div class="flex items-center cursor-pointer" @click="selectChat(chat.id)">
                <n-icon class="mr-2 text-blue-400">
                  <ChatbubbleEllipsesOutline />
                </n-icon>
                <span class="text-sm font-medium">{{ chat.name }}</span>
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
    <n-layout-content class="p-8 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white overflow-auto">
      <h1 class="flex items-center text-3xl font-semibold mb-6">
        <n-icon class="mr-2">
          <HomeOutline />
        </n-icon>
        Velkommen, {{ userStore.user.name }}
      </h1>
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
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
</style>