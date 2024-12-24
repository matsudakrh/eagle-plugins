import { DBConfig } from '../db/config'
import createAudioStore from '../db/stores/audio-store'

// @ts-ignore
window.eagle.onPluginCreate((plugin: any) => {
  // オブジェクトストアの作成・削除はDBの更新時しかできないので、バージョンを指定して更新
  const openReq = window.indexedDB.open(plugin.manifest.id, DBConfig.VERSION)
  //　DB名を指定して接続。DBがなければ新規作成される。

  openReq.onupgradeneeded = (event) => {
    //onupgradeneededは、DBのバージョン更新(DBの新規作成も含む)時のみ実行
    // オブジェクトストアの作成、削除はDBの更新時に実行されるonupgradeneededの中でしかできない。
    // DBの新規作成時以外でDBを更新するには、open()のときにDBの新しいバージョンを指定する。
    // @ts-ignore
    const db = event.target.result

    if (!db.objectStoreNames.contains(DBConfig.STORE_NAMES.Audio)) {
      createAudioStore(db)
    }
  }
  openReq.onsuccess = (event)=> {
    //onupgradeneededの後に実行。更新がない場合はこれだけ実行
    // @ts-ignore
    const db = event.target.result
    // 接続を解除する
    db.close()
  }
  openReq.onerror = (_)=> {
    // 接続に失敗
    console.log('db open error')
  }
})
