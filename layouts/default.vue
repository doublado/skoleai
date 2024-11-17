<script lang="ts" setup>
  import { ref } from 'vue';
  import { NConfigProvider, darkTheme } from 'naive-ui';

  const darkThemeOverrides = ref<GlobalThemeOverrides>({
    common: {
      fontFamily: 'Josefin Sans, sans-serif',
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