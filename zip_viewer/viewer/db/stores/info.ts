import { DBConfig } from '../config'
import AppParameters from '../../lib/app-parameters'

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

export const putInfoObject = (db: IDBDatabase, data: InfoObject): void => {
  const transaction = db.transaction(DBConfig.STORE_NAMES.Info, 'readwrite')
  const store = transaction.objectStore(DBConfig.STORE_NAMES.Info)
  const getReq = store.get([AppParameters.identify])

  getReq.onsuccess = () => {
    if (getReq.result) {
      store.put({
        ...getReq.result,
        ...data,
      })
    } else {
      store.put(data)
    }
    store.transaction.oncomplete = () => {
      db.close()
    }
  }
  getReq.onerror = (event) => {
    console.log(event)
    db.close()
  }
}

export default createInfoStore