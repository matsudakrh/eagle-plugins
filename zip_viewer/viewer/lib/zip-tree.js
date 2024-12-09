const charEncode = require('./char-encode.js')
const { Entry } = require('yauzl')

// フォルダ構成をツリー形式で表示する関数
function setFolderStructure(entries) {
  const structure = {}

  entries.forEach(entry => {
    const pathParts = charEncode(entry.fileNameRaw).split('/').filter((part) => part)
    // ディレクトリ階層にフォルダを追加する
    let currentLevel = structure
    pathParts.forEach((part, index) => {
      if (!currentLevel[part]) {
        // 最後の部分がファイルの場合はファイルとして登録
        if (index === pathParts.length - 1 && !entry.isDirectory) {
          entry.$_uuid = window.crypto.randomUUID()
          currentLevel[part] = entry.$_uuid
        } else {
          currentLevel[part] = {
            $_name: part,
            $_uuid: window.crypto.randomUUID(),
          } // フォルダとして追加
        }
      }
      currentLevel = currentLevel[part]
    })
  })

  return structure
}

const findObjectByCondition = (obj, condition) => {
  const recursive = (obj, condition) => {
    // 条件を満たす場合はそのオブジェクトを返す
    if (condition(obj)) {
      return obj
    }

    // オブジェクトがさらにネストされている場合
    if (typeof obj === 'object' && obj !== null && !(obj instanceof Entry)) {
      for (let key in obj) {
        if (obj[key] === null || obj[key] === undefined) {
          continue
        }
        // 再帰的に探索する
        const result = recursive(obj[key], condition)
        if (result) {
          return result
        }
      }
    }
  }

  return recursive(obj, condition)
}

module.exports = {
  setFolderStructure,
  findObjectByCondition,
}
