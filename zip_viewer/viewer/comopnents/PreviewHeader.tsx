import React from 'react'
import styles from './PreviewHeader.module.scss'

const PreviewHeader: React.FC<{
  name: string,
  onBack: () => void,
  onPrev: () => void,
  onNext: () => void,
}> = ({ name, onBack, onPrev, onNext }) => {
  return <header className={styles.header}>
    <div>
      <button onClick={onBack}>
        戻る
      </button>
      {name}
    </div>
    <div>
      <button onClick={onPrev} disabled={!onPrev}>
        前のファイル
      </button>
      <button onClick={onNext} disabled={!onNext}>
        次のファイル
      </button>
    </div>
  </header>
}

export default PreviewHeader