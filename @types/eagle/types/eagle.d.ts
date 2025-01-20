import { EagleTools } from './tools'
import { EagleResources } from './recources'

declare global {
  type TODO = any

  type EagleThemeNames =
    'Auto'
    | 'LIGHT'
    | 'LIGHTGRAY'
    | 'GRAY'
    | 'DARK'
    | 'BLUE'
    | 'PURPLE'

  interface Window {
    eagle: Readonly<{
      plugin: EagleTools.Plugin,
      item: EagleTools.Item
      folder: EagleTools.Folder
      tag: EagleTools.Tag
      tagGroup: EagleTools.TagGroup
      library: EagleTools.Library
      app: EagleTools.App
      os: EagleTools.OS
      notification: EagleTools.Notification
      contextMenu: EagleTools.ContextMenu
      dialog: EagleTools.Dialog
      shell: EagleTools.Shell

      onPluginCreate: (callback: (plugin: EagleTools.Plugin) => void) => void
      onPluginShow: (callback: () => void) => void
      onPluginRun: (callback: () => void) => void
      onPluginHide: (callback: () => void) => void
      onLibraryChanged: (callback: (libraryPath: string) => void) => void
      onThemeChanged: (callback: (theme: EagleThemeNames) => void) => void
    }>
  }
}

export {
  EagleTools,
  EagleResources,
}