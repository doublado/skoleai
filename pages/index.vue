<script setup lang="ts">
  // Apply authentication middleware to restrict access to authenticated users only
  definePageMeta({
    middleware: 'auth',
  });
</script>

<template>
  <div>
    <h1>Dashboard Page</h1>
  </div>
</template>