<script lang="ts" setup>
  import { ref } from 'vue';
  import { NConfigProvider, darkTheme, lightTheme } from 'naive-ui';
  import { useThemeStore } from '@/stores/themeStore';

  const themeStore = useThemeStore();
  const isDarkMode = ref(themeStore.isDarkMode);

  const lightThemeOverrides = ref<GlobalThemeOverrides>({
    common: {
      fontFamily: 'Josefin Sans, sans-serif',
    },
  });

  const darkThemeOverrides = ref<GlobalThemeOverrides>({
    common: {
      fontFamily: 'Josefin Sans, sans-serif',
    },
  });
</script>

<template>
  <n-config-provider
    :theme="isDarkMode ? darkTheme : null"
    :theme-overrides="isDarkMode ? darkThemeOverrides : lightThemeOverrides"
  >
    <slot />
  </n-config-provider>
</template>