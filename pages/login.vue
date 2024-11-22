<script setup lang="ts">
  import { ref } from 'vue';
  import { useMessage, NCard, NForm, NFormItem, NInput, NButton } from 'naive-ui';
  import { useUserStore } from '~/stores/userStore';
  import { useRouter } from 'vue-router';

  interface LoginResponse {
    success: boolean;
    message: string;
    user?: {
      id: number;
      name: string;
      email: string;
      role: 'student' | 'admin';
    };
    chats?: Array<{
      id: number;
      created_at: string;
    }>;
  }

  // Form data and validation rules for login
  const form = ref({
    email: '',
    password: '',
  });

  const rules = {
    email: [
      { required: true, message: 'E-mail er påkrævet', trigger: ['blur', 'input'] },
      { type: 'email' as const, message: 'Indtast en gyldig e-mailadresse', trigger: ['blur', 'input'] },
    ],
    password: { required: true, message: 'Adgangskode er påkrævet', trigger: ['blur', 'input'] },
  };

  const message = useMessage(); // Used to display notifications to the user
  const userStore = useUserStore(); // Store user data and state
  const router = useRouter(); // Navigate between pages

  const loginUser = async () => {
    // Ensure form fields are filled before attempting login
    if (form.value.email && form.value.password) {
      try {
        const response: LoginResponse = await $fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify(form.value),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.success && response.user && response.chats) {
          message.success('Login succesfuldt');

          // Store user data for session management
          userStore.setUser({
            id: response.user.id.toString(),
            name: response.user.name,
            email: response.user.email,
            role: response.user.role,
          });

          // Store chats and initialize messages
          userStore.setChats(
            response.chats.map((chat) => ({
              ...chat,
              id: chat.id.toString(), // Convert chat ID to string for consistency
              messages: [], // Default empty messages for new chats
            }))
          );

          router.push('/'); // Redirect to the home/dashboard page
        } else {
          message.error(response.message || 'Login mislykkedes.');
        }
      } catch (error) {
        console.error('Fejl ved login:', error);
        message.error('En fejl opstod under login. Prøv igen senere.');
      }
    } else {
      message.error('Udfyld venligst alle felter korrekt.');
    }
  };
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <!-- Login card container with responsive and centered layout -->
    <n-card class="w-full max-w-md p-5 shadow-lg">
      <h2 class="text-2xl font-semibold mb-6 text-center">Log ind</h2>
      <!-- Form for handling user login -->
      <n-form @submit.prevent="loginUser" ref="loginForm" :model="form" :rules="rules">
        <!-- Email input field with validation -->
        <n-form-item label="E-mail" path="email" class="mb-4">
          <n-input v-model:value="form.email" type="text" placeholder="Indtast din e-mail" />
        </n-form-item>
        <!-- Password input field with validation -->
        <n-form-item label="Adgangskode" path="password" class="mb-4">
          <n-input v-model:value="form.password" type="password" placeholder="Indtast din adgangskode" />
        </n-form-item>
        <!-- Submit button triggers login action -->
        <n-button type="primary" size="large" class="w-full mt-4" @click="loginUser">Log ind</n-button>
      </n-form>
    </n-card>
  </div>
</template>