import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useUserStore } from '~/stores/userStore';

export default defineNuxtRouteMiddleware(() => {
  const userStore = useUserStore();

  // Ensure only authenticated users can access protected routes
  if (!userStore.isAuthenticated) {
    return navigateTo('/login');
  }
});