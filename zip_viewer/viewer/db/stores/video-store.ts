import { DBConfig } from '../config'

const createVideoStore = (db: IDBDatabase) => {
  const objectStore = db.createObjectStore(DBConfig.STORE_NAMES.Video, {
    keyPath: ['itemId', 'filePath'],
    autoIncrement: false,
  })
  objectStore.createIndex('filePathItemIdIndex', ['itemId', 'filePath'], { unique: true })
}

type VideoObject = {
  filePath: string
  itemId: string
  // 最後の再生位置
  lastTime: number
}

export const putVideoObject = (db: IDBDatabase, data: VideoObject): IDBRequest => {
  const transaction = db.transaction(DBConfig.STORE_NAMES.Video, 'readwrite')
  const store = transaction.objectStore(DBConfig.STORE_NAMES.Video)
  return store.put(data)
}

export default createVideoStore
