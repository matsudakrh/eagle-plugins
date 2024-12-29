import Rule from './smartFolder/rules'

export namespace EagleResources {
  type Item = {
    readonly id: string
    name: string
    readonly ext: string
    width: number
    height: number
    url: string
    readonly isDeleted: boolean
    annotation: string
    tags: string[]
    folders: string[]
    readonly palettes: {
      readonly $$hashKey: string
      color: [R: number, G: number, B: number]
      ratio: number
    }[]
    readonly size: number
    star: 0 | 1 | 2 | 3 | 4 | 5
    readonly importedAt: number
    readonly noThumbnail: boolean
    readonly noPreview: boolean
    readonly filePath: string
    readonly fileURL: string
    readonly thumbnailPath: string
    readonly thumbnailURL: string
    readonly metadataFilePath: string

    readonly save: () => Promise<boolean>
    readonly open: () => Promise<boolean>
    readonly moveToTrash: () => Promise<boolean>
    readonly refreshThumbnail: () => Promise<boolean>
    readonly replaceFile: (filePath: string) => Promise<boolean>
    readonly setCustomThumbnail: (thumbnailPath: string) => Promise<boolean>
  }

  type Folder = {
    readonly id: string
    name: string
    description: string
    readonly icon: undefined | string
    readonly iconColor: undefined | string
    readonly createdAt: number
    readonly children: Folder[]
  }

  type Tag = {
    readonly color: undefined | string
    readonly count: number
    // タググループIDのリスト
    readonly groups: string[]
    readonly name: string
    // pinyin = 中国語の発音を表すローマ字表記法
    readonly pinyin: string
  }

  type TagGroup = {
    readonly id: string
    color: undefined | string
    name: string
    // タグ名のリスト
    tags: string[]
    save: () => Promise<TagGroup>
    remove: () => Promise<boolean>
  }

  type LibraryInfoFolder = {
    id: string
    name: string
    description: string
    tags: string[]
    password: string
    passwordTips: string
    modificationTime: number
    children: LibraryInfoFolder[]
  }

  type LibraryInfo = {
    applicationVersion: string
    modificationTime: number
    name: string
    path: string
    folders: LibraryInfoFolder[]
    quickAccess: {
      id: string
      type: 'folder' | 'smartFolder'
    }[]
    smartFolders: {
      id: string
      name: string
      modificationTime: number
      children: TODO[]
      description: string
      conditions: {
        $$hashKey: string
        // 満たす または 満たさない
        boolean: 'TRUE' | 'FALSE'
        // すべて または 任意
        match: 'AND' | 'OR'
        rules: Readonly<Rule>[]
      }[]
    }[]
    tagsGroups: Omit<TagGroup, 'save' | 'remove'>[]
  }
}