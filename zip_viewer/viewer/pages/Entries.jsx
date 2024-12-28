import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import _ from 'lodash'
import yauzl from 'yauzl'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { findObjectByCondition, MetaKeys } from '../lib/zip-tree'
import { setCurrentDirectory, setCurrentHoverEntry } from '../store/directory-store'
import ListThumbnail from '../comopnents/ListThumbnail'
import EntriesFooter from '../comopnents/EntriesFooter'
import styles from '../styles'
import folderIcon from '../resources/kkrn_icon_folder_2.png'

const { Entry } = yauzl
const { gridStyle } = styles

const Entries = memo(({ entries }) => {
  const dispatch = useAppDispatch()
  const structure = useAppSelector((state) => state.directory.structure)
  const currentDirectory = useAppSelector((state) => state.directory.currentDirectory)
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
        return value[MetaKeys.UUID] === currentDirectory[MetaKeys.UUID]
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
       {currentDirectory?.[MetaKeys.NAME] ? `「${currentDirectory[MetaKeys.NAME]}」` : null}
      </span>
    </div>
    <div id="images" style={gridStyle.images}>
      {
        visibleEntries.map((entry) => {
          const isEntry = entry instanceof Entry

          if (isEntry) {
            return <ListThumbnail
              key={entry[MetaKeys.UUID]}
              entry={entry}
              onOpenDirectory={handleOpenDirectory}
            />
          }

          return <div
            key={entry[MetaKeys.UUID]}
            className="dir-thumb"
            onDoubleClick={() => handleOpenDirectory(entry)}
            onMouseOver={() =>
              dispatch(setCurrentHoverEntry(entry[MetaKeys.FULL_PATH])
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