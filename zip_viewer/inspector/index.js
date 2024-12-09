const yauzl = require('yauzl')
const { getFolderStructure, printFolderStructure } = require('./zip-tree.js')
const charEncode = require('./char-encode')

const ByteUnit = {
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3
}

const byteUnit = (value) => {
  if (!Number.isInteger(value)) {
    return '---'
  }

  if (value > ByteUnit.GB) {
    return `${(value / ByteUnit.GB).toFixed(2)}GB`
  }

  if (value > ByteUnit.MB) {
    return `${(value / ByteUnit.MB).toFixed(2)}MB`
  }

  if (value > ByteUnit.KB) {
    return `${(value / ByteUnit.KB).toFixed(2)}KB`
  }

  return `${value}B`
}

// Listen to plugin creation
eagle.onPluginCreate(async (plugin) => {
  // Get the current theme
  const theme = await eagle.app.theme
  document.body.setAttribute('theme', theme)

  const items = await eagle.item.getSelected()
  const item = items[0]
  const filePath = item.filePath

  yauzl.open(filePath, { lazyEntries: true }, (err, zipFile) => {
    if (err) {
      console.log(err)
      return
    }
    const fileCount = document.querySelector('#fileCount')
    const fileSize = document.querySelector('#fileSize')
    fileCount.textContent = zipFile.entryCount
    fileSize.textContent = byteUnit(zipFile.fileSize)

    const entries = []
    zipFile.readEntry()
    zipFile.on('entry', function(entry) {
      entry.isDirectory = entry.fileName.endsWith('/')
      entries.push(entry)
      zipFile.readEntry()
    })

    zipFile.once('end', function() {
    entries.sort((a, b) => {
        const aName = charEncode(a.fileNameRaw)
        const bName =  charEncode(b.fileNameRaw)

        if (a.isDirectory && !b.isDirectory) {
          return -1
        } else if (!a.isDirectory && b.isDirectory) {
          return 1
        }

        return aName.localeCompare(bName, 'ja', {
          sensitivity: 'variant',
          numeric: true,
        })
      })
      const structure = getFolderStructure(entries)
      console.log(structure)
      const tree = printFolderStructure(structure)
      const treeField = document.querySelector('#structure')
      treeField.textContent = tree
      zipFile.close()
    })
  })
})

// Listen to theme changes
eagle.onThemeChanged((theme) => {
  document.body.setAttribute('theme', theme)
})