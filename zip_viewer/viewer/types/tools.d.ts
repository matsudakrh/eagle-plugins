import { EagleResources } from './recources'

type EagleManifest = {
  id: string
  arch: string
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
}