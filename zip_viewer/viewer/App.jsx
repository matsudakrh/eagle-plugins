import React, {
  useEffect,
  useState,
  memo,
} from 'react'
import { Provider, useDispatch } from 'react-redux'
import { createRoot } from 'react-dom/client'
import {
  Route,
  Routes,
  HashRouter,
} from 'react-router-dom'
import yauzl from 'yauzl'
import AppParameters from './lib/app-parameters'
import charEncode from './lib/char-encode'
import store from './store'
import { setStructure } from './store/directory-store'
import Preview from './pages/Preview'
import Entries from './pages/Entries'
import { getFolderStructure } from './lib/zip-tree'

const App = memo(() => {
  const [entries, setEntries] = useState([])
  const dispatch = useDispatch()
  useEffect(() => {
    let _file

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

if (window.createdEaglePlugin) {
  /// trueなのにエラーが出るので対策
  window.setTimeout(() => {
    const root = createRoot(document.getElementById('root'))
    root.render(
      <Provider store={store}>
        <App />
      </Provider>
    )
  }, 200)
} else {
  eagle.onPluginCreate(() => {
    const root = createRoot(document.getElementById('root'))
    root.render(
      <Provider store={store}>
        <App />
      </Provider>
    )
  })
}