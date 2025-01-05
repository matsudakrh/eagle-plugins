import React, {
  useEffect,
  useState,
  memo,
} from 'react'
import {
  Route,
  Routes,
  HashRouter,
} from 'react-router'
import yauzl from 'yauzl'
import { useAppDispatch } from './hooks/redux'
import AppParameters from './lib/app-parameters'
import charEncode from './lib/char-encode'
import { getFolderStructure } from './lib/zip-tree'
import { setStructure } from './store/directory-store'
import Preview from './pages/Preview'
import Entries from './pages/Entries'

const App: React.FC = memo(() => {
  const [entries, setEntries] = useState([])
  const dispatch = useAppDispatch()
  useEffect(() => {
    let _file: yauzl.ZipFile

    window.eagle.item.getSelected().then((result) => {
      AppParameters.setItem(result[0])

      yauzl.open(AppParameters.filePath, { autoClose: false, lazyEntries: true }, (err, zipFile) => {
        if (err) {
          console.error(err)
          return
        }
        _file = zipFile

        const entries = []
        zipFile.readEntry()
        zipFile.on('entry', (entry) => {
          entry.encodedFileName = charEncode(entry.fileNameRaw)
          entry.isDirectory = entry.encodedFileName.endsWith('/')
          entry.zipFile = zipFile
          entry.$_uuid ??= window.crypto.randomUUID()
          entries.push(entry)
          zipFile.readEntry()
        })
        zipFile.on('end', () => {
          entries.sort((a, b) => {
            const aName = a.encodedFileName
            const bName = b.encodedFileName

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

          dispatch(setStructure(getFolderStructure(entries)))
          setEntries(entries)
        })
      })
    })

    return () => {
      if (_file) {
        _file.close()
      }
    }
  }, [])

  return (<HashRouter>
    <Routes>
      <Route key="entries" index element={<Entries entries={entries} />} />
      <Route
        key="preview"
        path="/preview"
        element={<Preview entries={entries} />}
      />
    </Routes>
  </HashRouter>)
})

export default App
