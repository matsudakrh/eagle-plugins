const charEncode = require('./char-encode.js')

// フォルダ構成をツリー形式で表示する関数
function setFolderStructure(entries) {
  const structure = {};

  entries.forEach(entry => {
    const pathParts = charEncode(entry.fileNameRaw).split('/').filter((part) => part)
    // ディレクトリ階層にフォルダを追加する
    let currentLevel = structure;
    pathParts.forEach((part, index) => {
      if (!currentLevel[part]) {
        entry.nestIndex = index
        // 最後の部分がファイルの場合はファイルとして登録
        if (index === pathParts.length - 1 && !entry.isDirectory) {
          currentLevel[part] = entry; // nullでファイルを表現
        } else {
          currentLevel[part] = {
            index
          }; // フォルダとして追加
        }
      }
      currentLevel = currentLevel[part];
    });
  });

  return structure
}

const whereObjectByCondition = (obj, condition) => {
  const list = []
  const recursive = (obj, condition) => {
    // 条件を満たす場合はそのオブジェクトを返す
    if (condition(obj)) {
      return obj;
    }

    // オブジェクトがさらにネストされている場合
    if (typeof obj === 'object' && obj !== null) {
      for (let key in obj) {
        // 再帰的に探索する
        const result = recursive(obj[key], condition);
        if (result) {
          list.push(result)
        }
      }
    }
  }

  recursive(obj, condition)

  return list
}

module.exports = {
  setFolderStructure,
  whereObjectByCondition,
}
