
declare global {
  interface Window {
    eagle: {
      plugin: {
        manifest: {
          id: string
        }
      },

      onThemeChanged: (callback: (theme: string) => void) => void
    }
  }
}

export {}