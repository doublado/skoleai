<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useThemeStore } from '@/stores/themeStore'
  import { NSpin } from 'naive-ui'

  const themeStore = useThemeStore()
  const isDarkMode = ref(themeStore.isDarkMode)
  const isLoading = ref(true)

  // Set loading to false after mount to ensure all components are ready
  onMounted(() => {
    setTimeout(() => {
      isLoading.value = false
    }, 500) // Adjust the delay to match loading time requirements
  })
</script>

<template>
  <div v-if="isLoading" class="loading-overlay" :class="[isDarkMode ? 'dark' : 'light']">
    <n-spin size="large" />
  </div>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style scoped>
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    transition: background-color 0.5s ease, color 0.5s ease;
  }
</style>