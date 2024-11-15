<script setup lang="ts">
  import { ref } from 'vue';
  import { useMessage, NCard, NForm, NFormItem, NInput, NButton } from 'naive-ui';
  import { useUserStore } from '~/stores/userStore';
  import { useRouter } from 'vue-router';

  const form = ref({
    email: '',
    password: ''
  });

  const rules = {
    email: [
      { required: true, message: 'E-mail er påkrævet', trigger: ['blur', 'input'] },
      { type: 'email', message: 'Indtast en gyldig e-mailadresse', trigger: ['blur', 'input'] }
    ],
    password: { required: true, message: 'Adgangskode er påkrævet', trigger: ['blur', 'input'] }
  };

  const message = useMessage();
  const userStore = useUserStore();
  const router = useRouter();

  const loginUser = async () => {
    // Ensure form inputs are valid before making the login request
    if (form.value.email && form.value.password) {
      try {
        const response = await $fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify(form.value),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response && response.success) {
          message.success('Login succesfuldt');

          userStore.setUser({
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            role: response.user.role,
          });

          userStore.setChats(response.chats);

          router.push('/');
        } else {
          message.error(response.message);
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
    <n-card class="w-full max-w-md p-5 shadow-lg">
      <h2 class="text-2xl font-semibold mb-6 text-center">Log ind</h2>
      <n-form @submit.prevent="loginUser" ref="loginForm" :model="form" :rules="rules">
        <n-form-item label="E-mail" path="email" class="mb-4">
          <n-input v-model:value="form.email" type="email" placeholder="Indtast din e-mail" />
        </n-form-item>
        <n-form-item label="Adgangskode" path="password" class="mb-4">
          <n-input v-model:value="form.password" type="password" placeholder="Indtast din adgangskode" />
        </n-form-item>
        <n-button type="primary" size="large" class="w-full mt-4" @click="loginUser">Log ind</n-button>
      </n-form>
    </n-card>
  </div>
</template>