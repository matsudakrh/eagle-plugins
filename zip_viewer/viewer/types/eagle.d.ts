import { EagleTools } from './tools'

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
      plugin: EagleTools.Plugin,
      item: EagleTools.Item
      folder: EagleTools.Folder

      onPluginCreate: (callback: (plugin: EagleTools.Plugin) => void) => void
      onPluginShow: (callback: () => void) => void
      onPluginRun: (callback: () => void) => void
      onPluginHide: (callback: () => void) => void
      onLibraryChanged: (callback: (libraryPath: string) => void) => void
      onThemeChanged: (callback: (theme: Theme) => void) => void
    }
  }
}

export {}