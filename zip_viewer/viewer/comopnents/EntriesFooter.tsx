import * as React from 'react'
import { useAppSelector } from '../hooks/redux'
import styles from './EntriesFooter.module.scss'

const EntriesFooter: React.FC = () => {
  const currentHoverEntryName = useAppSelector(state => state.directory.currentHoverEntryName)

  return <div
    className={styles.footer}
  >
    {currentHoverEntryName ? currentHoverEntryName : '-'}
  </div>
}

export default EntriesFooter