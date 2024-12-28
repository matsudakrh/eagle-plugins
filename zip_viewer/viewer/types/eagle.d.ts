import { EageTools } from './tools'

type Theme =
  'Auto'
  | 'LIGHT'
  | 'LIGHTGRAY'
  | 'GRAY'
  | 'DARK'
  | 'BLUE'
  | 'PURPLE'

declare global {
  type TODO = any

  interface Window {
    eagle: {
      plugin: EageTools.Plugin,
      item: EageTools.Item
      folder: EageTools.Folder

      onPluginCreate: (callback: (plugin: EageTools.Plugin) => void) => void
      onPluginShow: (callback: () => void) => void
      onPluginRun: (callback: () => void) => void
      onPluginHide: (callback: () => void) => void
      onLibraryChanged: (callback: (libraryPath: string) => void) => void
      onThemeChanged: (callback: (theme: Theme) => void) => void
    }
  }
}

export {}