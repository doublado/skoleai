import { useThemeStore } from '@/stores/themeStore';
import { watch } from 'vue';

export default defineNuxtPlugin(() => {
  const themeStore = useThemeStore();

  const updateBodyClass = (isDark: boolean) => {
    if (typeof window === 'undefined') return;

    const bodyClass = document.body.classList;
    if (isDark) {
      bodyClass.add('dark');
      bodyClass.remove('light');
    } else {
      bodyClass.add('light');
      bodyClass.remove('dark');
    }
  };

  // Ensure the body class reflects the correct theme on initial load and theme changes
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      updateBodyClass(themeStore.isDarkMode);
    });
  }

  watch(() => themeStore.isDarkMode, (newValue) => {
    updateBodyClass(newValue);
  });
});