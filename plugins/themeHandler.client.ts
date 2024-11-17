import { watch } from 'vue';

export default defineNuxtPlugin(() => {
  const updateBodyClass = () => {
    if (typeof window === 'undefined') return;

    const bodyClass = document.body.classList;
    bodyClass.add('dark');
  };

  // Ensure the body class reflects the correct theme on initial load and theme changes
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      updateBodyClass();
    });
  }
});