import * as React from 'react'
import { useAppSelector } from '../hooks/redux'

const EntriesFooter = () => {
  const currentHoverEntryName = useAppSelector(state => state.directory.currentHoverEntryName)

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

export default EntriesFooter