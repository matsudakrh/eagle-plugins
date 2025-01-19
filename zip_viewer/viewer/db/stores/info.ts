import { DBConfig } from '../config'

const createInfoStore = (db: IDBDatabase) => {
  const obhectStore = db.createObjectStore(DBConfig.STORE_NAMES.Info, {
    keyPath: ['itemId'],
    autoIncrement: false,
  })
  obhectStore.createIndex('itemIdIndex', ['itemId'], { unique: true })
}

export type InfoObject = {
  itemId: string
  lastFilePath?: string
  count?: number
}

export const putInfoObject = (db: IDBDatabase, data: InfoObject): IDBRequest => {
  const transaction = db.transaction(DBConfig.STORE_NAMES.Info, 'readwrite')
  const store = transaction.objectStore(DBConfig.STORE_NAMES.Info)
  transaction.oncomplete = () => {
    db.close()
  }
  return store.put(data)
}

export default createInfoStore