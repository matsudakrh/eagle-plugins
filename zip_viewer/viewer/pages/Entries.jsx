import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { findObjectByCondition } from '../lib/zip-tree'
import _ from 'lodash'
import { setCurrentDirectory, setCurrentHoverEntry } from '../store/directory-store'
import folderIcon from '../resources/kkrn_icon_folder_2.png'
import styles from '../styles'
import yauzl from 'yauzl'
import ListThumbnail from '../comopnents/ListThumbnail'

const { Entry } = yauzl
const { gridStyle } = styles

const EntriesFooter = () => {
  const currentHoverEntryName = useSelector(state => state.directory.currentHoverEntryName)

  return <div
    style={{
      borderTop: '1px solid #333',
      padding: '4px',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis'
    }}
  >
    {currentHoverEntryName ? currentHoverEntryName : '-'}
  </div>
}


const Entries = memo(({ entries }) => {
  const structure = useSelector((state) => state.directory.structure)
  const currentDirectory = useSelector((state) => state.directory.currentDirectory)
  const dispatch = useDispatch()
  const [visibleEntries, setVisibleEntries] = useState([])

  const parentDirectory = useMemo(() => {
    if (!structure || !currentDirectory) {
      return
    }

    return findObjectByCondition(structure, (obj) => {
      const children = Object.values(obj)
      const dirs = children.filter(child => typeof child === 'object' && child !== null)

      return dirs.some((value) => {
        return value.$_uuid === currentDirectory.$_uuid
      })
    })
  }, [structure, currentDirectory])

  useEffect(() => {
    if (!currentDirectory) {
      return
    }

    const dupDir = _.cloneDeep(currentDirectory)
    const filteredDir = _.omitBy(dupDir, (value, key) => {
      return key.startsWith('$_')
    })

    const children = Object.values(filteredDir)
    const dirs = children.filter(child => typeof child === 'object' && child !== null)
    const uuids = children.filter(child => typeof child === 'string')
    const files = entries.filter(entry => uuids.includes(entry.$_uuid))
    setVisibleEntries([...dirs, ...files])
  }, [currentDirectory, entries])

  useEffect(() => {
    const keys = Object.keys(structure)
    if (!keys.length) {
      return
    }

    if (currentDirectory) {
      return
    }

    dispatch(setCurrentDirectory(structure))
  }, [structure])

  const handleOpenDirectory = useCallback((dir) => {
    dispatch(setCurrentDirectory(dir))
  }, [])

  const handleBack = useCallback(() => {
    if (!currentDirectory) {
      return
    }
    const dir = findObjectByCondition(structure, (obj) => {
      const children = Object.values(obj)
      const dirs = children.filter(child => typeof child === 'object' && child !== null)

      return dirs.some((value) => {
        return value.$_uuid === currentDirectory.$_uuid
      })
    })

    dispatch(setCurrentDirectory(dir))
  }, [currentDirectory])

  return <div style={{
    height: '100vh',
    display: 'grid',
    gridTemplateRows: 'min-content 1fr min-content',
  }}>
    <div>
      {parentDirectory ? <span onClick={handleBack}>
        前のフォルダに戻る
      </span> : null}
      <span style={{
        whiteSpace: 'pre-wrap',
        paddingLeft: '12px',
      }}>
       {currentDirectory?.$_name ? `「${currentDirectory.$_name}」` : null}
      </span>
    </div>
    <div id="images" style={gridStyle.images}>
      {
        visibleEntries.map((entry) => {
          const isEntry = entry instanceof Entry

          if (isEntry) {
            return <ListThumbnail
              key={entry.encodedFileName}
              entry={entry}
              index={entries.findIndex(e => entry === e)}
              onOpenDirectory={handleOpenDirectory}
            />
          }

          return <div
            key={entry.$_name}
            className="dir-thumb"
            onDoubleClick={() => handleOpenDirectory(entry)}
            onMouseOver={() =>
              dispatch(setCurrentHoverEntry(entry.$_fullpath)
              )}
            onPointerLeave={() => dispatch(setCurrentHoverEntry(null))}
          >
            <div>
              <img style={gridStyle.img} src={folderIcon} alt="" />
            </div>
            <p style={gridStyle.p}>{entry.$_name}</p>
          </div>
        })
      }
    </div>
    <EntriesFooter />
  </div>
})

export default Entries