import React from 'react'

const PreviewHeader = ({ name, onBack, onPrev, onNext }) => {
  return <header style={{
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px',
    borderBottom: '',
  }}>
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