import { EagleResources } from './recources'
import { Buffer } from 'buffer'

type TODO = any

type EagleManifest = {
  id: string
  arch: 'all' | 'arm' | 'x64'
  devtools: boolean
  keywords: string[]
  name: string
  logo: string
  version: string
  preview: object | undefined
  platform: string
}

export namespace EagleTools {
  type Plugin = {
    manifest: EagleManifest
    icon: string
    path: string
    types: string[] // e.g.) ['development']
  }

  type Item = {
    get: (options: TODO) => Promise<EagleResources.Item[]>
    getAll: () => Promise<EagleResources.Item[]>
    getById: (itemId: string) => Promise<EagleResources.Item>
    getByIds: (itemIds: string[]) => Promise<EagleResources.Item[]>
    getSelected: () => Promise<EagleResources.Item[]>
  }

  type Folder = {
    create: (options: TODO) => Promise<EagleResources.Folder>
    createSubfolder: (parentId: string, options: TODO) => Promise<EagleResources.Folder>
    get: (options: TODO) => Promise<EagleResources.Folder[]>
    getAll: () => Promise<EagleResources.Folder[]>
    getById: (folderId: string) => Promise<EagleResources.Folder>
  }

  type Tag = {
    get: () => Promise<EagleResources.Tag[]>
    getRecents: () => Promise<EagleResources.Tag[]>
  }

  type TagGroup = {
    get: () => Promise<EagleResources.TagGroup[]>
    create: (options: TODO) => Promise<EagleResources.TagGroup>
  }

  type Library = {
    info: () => Promise<EagleResources.LibraryInfo>
  }

  type App = {
    version: string
    build: number
    locale:
      'en'
      | 'zh_CN'
      | 'zh_TW'
      | 'ja_JP'
      | 'ko_KR'
      | 'es_ES'
      | 'de_DE'
      | 'ru_RU'
    arch:
      'x64'
      | 'arm64'
      | 'x86'
    platform: 'darwin' | 'win32'
    // 現在のアプリケーション（Eagle）の実行パス
    execPath: string
    pid: number
    isWindows: boolean
    isMac: boolean
    runningUnderARM64Translation: boolean
    theme: EagleThemeNames
    // 環境変数
    env: object

    isDarkColors: () => boolean
    getPath: (
      name:
        // ユーザーのホームフォルダ（メインディレクトリ）
        'home'
        // 各ユーザーのアプリケーションデータディレクトリ
        | 'appData'
        // アプリケーションの設定ファイルを保存するフォルダで、デフォルトは appData フォルダにアプリケーション名が追加されます。習慣的にユーザーが保存するデータファイルはこのディレクトリに書かれるべきですが、大きなファイルをここに書くことはお勧めしません。
        // なぜなら、いくつかの環境ではこのディレクトリがクラウドストレージにバックアップされるためです。
        | 'userData'
        // 一時ファイルフォルダ
        | 'temp'
        // 現在の実行ファイル
        | 'exe'
        // 現在のユーザーのデスクトップフォルダ
        | 'desktop'
        // ユーザーのドキュメントディレクトリへのパス
        | 'documents'
        // ユーザーのダウンロードディレクトリへのパス
        | 'downloads'
        // ユーザーの音楽ディレクトリへのパス
        | 'music'
        // ユーザーの画像ディレクトリへのパス
        | 'pictures'
        // ユーザーのビデオディレクトリへのパス
        | 'videos'
        // ユーザーの最近使用したファイルのディレクトリ (Windows のみ)。
        | 'recent',
    ) => Promise<string>
  }

  type Notification = {
    show: (options: {
      title?: string
      description?: string
      icon?: string // base64 or URL
      mute?: boolean // SE
      duration?: number // milliseconds
    }) => Promise<void>
  }

  type ContextMenu = {
    open: (menuItems: EagleResources.ContextMenuItem[]) => void
  }

  type Dialog = {
    showMessageBox: (options: {
      message: string
      title?: string
      detail?: string
      buttons?: string[]
      type?: 'none' | 'info' | 'error' | 'question' | 'warning'
    }) => Promise<{
      response: number /* クリックされたボタンのインデックス */
      checkboxChecked: boolean
    }>
  }

  type Clipboard = {
    clear: () => void
    has: (format: string) => boolean
    writeText: (text: string) => void
    readText: () => Promise<string>
    writeBuffer: (format: string, buffer: Buffer) => Buffer
    readBuffer: (format: string) => Buffer
    writeImage: (image: TODO /* electron: NativeImage */ ) => void
    readImage: () => TODO /* electron: NativeImage */
  }

  type Shell = {
    openPath: (path: string) =>  Promise<void>
  }

  type OS = {
    tmpdir: () => string
    version: () => string
    type: () => 'Darwin' | 'Windows_NT'
    release: () => string
    hostname: () => string
    homedir: () => string
    arch: () => 'x64'
      | 'arm64'
      | 'x86'
  }
}