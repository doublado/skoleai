<script setup lang="ts">
  import { ref } from 'vue';
  import { useMessage, NCard, NForm, NFormItem, NInput, NSelect, NButton } from 'naive-ui';

  // Form state to collect user registration data
  const form = ref({
    name: '',
    email: '',
    password: '',
    role: ''
  });

  // Dropdown options for selecting a role
  const roleOptions = [
    { label: 'Elev', value: 'student' },
    { label: 'Administrator', value: 'admin' }
  ];

  // Validation rules for form inputs to ensure data integrity
  const rules = {
    name: { required: true, message: 'Navn er påkrævet', trigger: ['blur', 'input'] },
    email: [
      { 
        required: true, 
        message: 'E-mail er påkrævet', 
        trigger: ['blur', 'input'] 
      },
      {
        // Custom validator to ensure a valid email format
        validator: (rule: any, value: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return new Error('Indtast en gyldig e-mailadresse');
          }
          return true;
        },
        trigger: ['blur', 'input']
      }
    ],
    password: [
      {
        // Custom validator for secure password requirements
        validator: (rule: any, value: string) => {
          if (!value) {
            return new Error('Adgangskode er påkrævet');
          }

          if (value.length < 8) {
            return new Error('Adgangskode skal være mindst 8 tegn');
          }

          if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/[0-9]/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
            return new Error('Adgangskode skal indeholde store bogstaver, små bogstaver, tal og symboler');
          }

          if (form.value.name && value.toLowerCase().includes(form.value.name.toLowerCase())) {
            return new Error('Adgangskode må ikke ligne brugernavnet for meget');
          }
          
          return true;
        },
        trigger: ['blur', 'input']
      }
    ],
    role: { required: true, message: 'Rolle er påkrævet', trigger: ['change', 'blur'] }
  };

  const message = useMessage(); // Message system for user notifications

  const registerUser = async () => {
    // Ensure all form fields are filled out before making the request
    if (form.value.name && form.value.email && form.value.password && form.value.role) {
      try {
        const response = await $fetch('/api/register', {
          method: 'POST',
          body: JSON.stringify(form.value),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response && response.success) {
          message.success('Bruger registreret med succes.');
          // Reset form after successful registration
          form.value = { name: '', email: '', password: '', role: '' };
        } else {
          message.error(response.message);
        }
      } catch (error) {
        console.error('Registreringsfejl:', error);
        message.error('En fejl opstod under registreringen. Prøv igen senere.');
      }
    } else {
      message.error('Udfyld venligst alle felter korrekt.');
    }
  };
</script>

<template>
  <!-- Centered container for the registration form -->
  <div class="flex items-center justify-center min-h-screen">
    <!-- Card layout for the registration form with shadow styling -->
    <n-card class="w-full max-w-md p-5 shadow-lg">
      <h2 class="text-2xl font-semibold mb-6 text-center">Registrer en ny bruger</h2>
      
      <!-- User registration form -->
      <n-form @submit.prevent="registerUser" ref="registerForm" :model="form" :rules="rules">
        
        <!-- Name input field with validation -->
        <n-form-item label="Navn" path="name" class="mb-4">
          <n-input v-model:value="form.name" placeholder="Indtast dit navn" />
        </n-form-item>
        
        <!-- Email input field with validation -->
        <n-form-item label="E-mail" path="email" class="mb-4">
          <n-input v-model:value="form.email" type="text" placeholder="Indtast din e-mail" />
        </n-form-item>
        
        <!-- Password input field with validation -->
        <n-form-item label="Adgangskode" path="password" class="mb-4">
          <n-input v-model:value="form.password" type="password" placeholder="Indtast din adgangskode" />
        </n-form-item>
        
        <!-- Role selection dropdown -->
        <n-form-item label="Rolle" path="role" class="mb-4">
          <n-select v-model:value="form.role" :options="roleOptions" placeholder="Vælg rolle" />
        </n-form-item>
        
        <!-- Submit button to trigger registration -->
        <n-button type="primary" size="large" class="w-full mt-4" @click="registerUser">Registrer</n-button>
      </n-form>
    </n-card>
  </div>
</template>