<!-- TODO: Create the theme switcher logic and spinner -->
<script lang="ts" setup>
  import { NConfigProvider, darkTheme, lightTheme } from 'naive-ui'
</script>

<template>
  <NConfigProvider :theme="darkTheme">
    <slot />
  </NConfigProvider>
</template>

<style>

</style>