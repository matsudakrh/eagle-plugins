export namespace EageResources {
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
    readonly palettes: object[]
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
    readonly icon: string
    readonly iconColor: string
    readonly createdAt: number
    readonly children: Folder[]
  }
}