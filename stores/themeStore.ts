import { defineStore } from 'pinia'

export const useThemeStore = defineStore({
  id: 'useThemeStore',
  state: () => ({
    isDarkMode: true,
  }),
  actions: {
    setDarkMode(value: boolean) {
      this.isDarkMode = value
    },
  },
  persist: true,
})