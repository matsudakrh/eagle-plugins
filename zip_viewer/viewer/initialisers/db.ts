import { DBConfig } from '../db/config'
import createAudioStore from '../db/stores/audio-store'
import createVideoStore from '../db/stores/video-store'

window.eagle.onPluginCreate((plugin) => {
  // オブジェクトストアの作成・削除はDBの更新時しかできないので、バージョンを指定して更新
  const openReq = window.indexedDB.open(plugin.manifest.id, DBConfig.VERSION)
  //　DB名を指定して接続。DBがなければ新規作成される。

  openReq.onupgradeneeded = (event) => {
    //onupgradeneededは、DBのバージョン更新(DBの新規作成も含む)時のみ実行
    // オブジェクトストアの作成、削除はDBの更新時に実行されるonupgradeneededの中でしかできない。
    // DBの新規作成時以外でDBを更新するには、open()のときにDBの新しいバージョンを指定する。
    const db: IDBDatabase = (event.target as IDBOpenDBRequest).result

    if (!db.objectStoreNames.contains(DBConfig.STORE_NAMES.Audio)) {
      createAudioStore(db)
    }
    if (!db.objectStoreNames.contains(DBConfig.STORE_NAMES.Video)) {
      createVideoStore(db)
    }
  }
  openReq.onsuccess = (event)=> {
    //onupgradeneededの後に実行。更新がない場合はこれだけ実行
    const db = (event.target as IDBOpenDBRequest).result
    // 接続を解除する
    db.close()
  }
  openReq.onerror = (_)=> {
    // 接続に失敗
    console.log('db open error')
  }
})
