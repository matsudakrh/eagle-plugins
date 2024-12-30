import { Entry, ZipFile } from 'yauzl'

declare module 'yauzl' {
  interface Entry {
    isDirectory: boolean
    encodedFileName: string
    $_uuid: string
    fileNameRaw: Buffer
    zipFile: ZipFile
  }
}