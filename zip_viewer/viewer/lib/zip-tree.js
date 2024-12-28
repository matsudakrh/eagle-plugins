import charEncode from './char-encode'
import yauzl from 'yauzl'
const  { Entry } = yauzl

export const MetaKeys = {
  NAME: '$_name',
  UUID: '$_uuid',
  FULL_PATH: '$_fullpath',
}

const ignoreNames = [
  '__MACOSX',
  'Thumbs.db',
  'Desktop.ini',
]

// フォルダ構成をツリー形式で表示する関数
function getFolderStructure(entries) {
  const structure = {}

  entries.forEach(entry => {
    const pathParts = charEncode(entry.fileNameRaw).split('/').filter((part) => part)
    // ディレクトリ階層にフォルダを追加する
    let currentLevel = structure
    pathParts.forEach((part, index) => {
      if (!currentLevel[part]) {
        if (ignoreNames.includes(part) || part.startsWith('.')) {
          return
        }
        // 最後の部分がファイルの場合はファイルとして登録
        if (index === pathParts.length - 1 && !entry.isDirectory) {
          currentLevel[part] = entry.$_uuid
        } else {
          currentLevel[part] = {
            $_name: part,
            $_uuid: entry[MetaKeys.UUID],
            $_fullpath: entry.encodedFileName,
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

export {
  getFolderStructure,
  findObjectByCondition
}
