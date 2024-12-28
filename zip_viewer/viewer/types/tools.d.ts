import { EageResources } from './recources'

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

export namespace EageTools {
  type Plugin = {
    manifest: EagleManifest
    icon: string
    path: string
    types: string[] // e.g.) ['development']
  }

  type Item = {
    get: (options: TODO) => Promise<EageResources.Item[]>
    getAll: () => Promise<EageResources.Item[]>
    getById: (itemId: string) => Promise<EageResources.Item>
    getByIds: (itemIds: string[]) => Promise<EageResources.Item[]>
    getSelected: () => Promise<EageResources.Item[]>
  }

  type Folder = {
    create: (options: TODO) => Promise<EageResources.Folder>
    createSubfolder: (parentId: string, options: TODO) => Promise<EageResources.Folder>
    get: (options: TODO) => Promise<EageResources.Folder[]>
    getAll: () => Promise<EageResources.Folder[]>
    getById: (folderId: string) => Promise<EageResources.Folder>
  }
}