const charEncode = require('./char-encode.js')

// フォルダ構成をツリー形式で表示する関数
function getFolderStructure(entries) {
  const structure = {};

  entries.forEach(entry => {
    const pathParts = charEncode(entry.fileNameRaw).split('/').filter((part) => part)
    // ディレクトリ階層にフォルダを追加する
    let currentLevel = structure;
    pathParts.forEach((part, index) => {
      if (!currentLevel[part]) {
        // 最後の部分がファイルの場合はファイルとして登録
        if (index === pathParts.length - 1 && !entry.isDirectory) {
          currentLevel[part] = null; // nullでファイルを表現
        } else {
          currentLevel[part] = {}; // フォルダとして追加
        }
      }
      currentLevel = currentLevel[part];
    });
  });

  return structure;
}

// フォルダ構成をツリー形式で表示
function printFolderStructure(structure) {
  let tree = ''
  const recursive = (structure, level = 0) => {
    const indent = '  '.repeat(level);  //
    Object.keys(structure).forEach(key => {
      console.log(`${indent}${key}`);
      tree += `${indent}${key}\n`
      if (structure[key] !== null && typeof structure[key] === 'object') {
        recursive(structure[key], level + 1);  // サブフォルダの処理
      }
    });
  }
  recursive(structure)

  return tree
}

module.exports = {
  getFolderStructure,
  printFolderStructure,
}
