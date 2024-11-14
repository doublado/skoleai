<script lang="ts" setup>
  import { ref } from 'vue'
  import { NConfigProvider, darkTheme, lightTheme } from 'naive-ui'
  import { useThemeStore } from '@/stores/themeStore'

  // Theme store references
  const themeStore = useThemeStore()

  // Reactive state for theme
  const isDarkMode = ref(themeStore.isDarkMode)

  // Theme overrides for light mode
  const lightThemeOverrides = ref<GlobalThemeOverrides>({
    common: {
      fontFamily: 'Josefin Sans, sans-serif',
    }
  })

  // Theme overrides for dark mode
  const darkThemeOverrides = ref<GlobalThemeOverrides>({
    common: {
      fontFamily: 'Josefin Sans, sans-serif',
    }
  })
</script>

<template>
  <n-config-provider :theme="isDarkMode ? darkTheme : null" :theme-overrides="isDarkMode ? darkThemeOverrides : lightThemeOverrides">
    <slot />
  </n-config-provider>
</template>