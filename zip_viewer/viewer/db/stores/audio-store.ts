import { DBConfig } from '../config'

const createAudioStore = (db: IDBDatabase) => {
  const objectStore = db.createObjectStore(DBConfig.STORE_NAMES.Audio, {
    keyPath: ['itemId', 'filePath'],
    autoIncrement: false,
  })
  objectStore.createIndex('filePathItemIdIndex', ['itemId', 'filePath'], { unique: true })
}

type AudioObject = {
  filePath: string
  itemId: string
  // 最後の再生位置
  lastTime: number
}

export const putAudioObject = (db: IDBDatabase, data: AudioObject): IDBRequest => {
  const transaction = db.transaction(DBConfig.STORE_NAMES.Audio, 'readwrite')
  const store = transaction.objectStore(DBConfig.STORE_NAMES.Audio)
  return store.put(data)
}

export default createAudioStore
