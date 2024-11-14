import { useThemeStore } from '@/stores/themeStore'
import { watch, nextTick } from 'vue'

export default defineNuxtPlugin(() => {
  const themeStore = useThemeStore()

  /**
   * Updates the body class based on the theme mode.
   * @param {boolean} isDark - Indicates whether dark mode is active.
   */
  const updateBodyClass = (isDark: boolean) => {
    if (typeof window === 'undefined') return

    const bodyClass = document.body.classList
    if (isDark) {
      bodyClass.add('dark')
      bodyClass.remove('light')
    } else {
      bodyClass.add('light')
      bodyClass.remove('dark')
    }
  }

  /**
   * Sets the initial theme after the window has loaded.
   */
  if (typeof window !== 'undefined') {
    window.addEventListener('load', async () => {
      updateBodyClass(themeStore.isDarkMode)
    })
  }

  /**
   * Watches for changes in the theme store and updates the body class accordingly.
   */
  watch(() => themeStore.isDarkMode, (newValue) => {
    updateBodyClass(newValue)
  })
})