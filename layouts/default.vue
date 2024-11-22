<script lang="ts" setup>
  import { ref } from 'vue';
  import { NConfigProvider, darkTheme } from 'naive-ui';

  // Overrides default theme to ensure consistent typography across the application
  const darkThemeOverrides = ref<GlobalThemeOverrides>({
    common: {
      fontFamily: 'Josefin Sans, sans-serif', // Custom font for better readability and aesthetics
    },
  });
</script>

<template>
  <n-config-provider
    :theme="darkTheme"
    :theme-overrides="darkThemeOverrides"
  >
    <slot />
  </n-config-provider>
</template>