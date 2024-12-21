import React, { useLayoutEffect, useState } from 'react'

const CurrentTime = ({ audio }) => {
  const [curentTime, setCurrentTime] = useState(0)

  useLayoutEffect(() => {
    if (!audio) {
      return
    }
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime)
    })
  }, [audio])

  return <div>
    {Number.isInteger(Number.parseInt(curentTime))
      ? `${`${Math.trunc(curentTime / 60)}`.padStart(2, '0')}:${`${Math.ceil(curentTime % 60)}`.padStart(2, '0')}`
      : '--:--'} / {
    Number.isInteger(Number.parseInt(audio?.duration))
      ? `${`${Math.trunc(audio?.duration / 60)}`.padStart(2, '0')}:${`${Math.ceil(audio?.duration % 60)}`.padStart(2, '0')}`
      : '--:--'
  }
  </div>
}

export default CurrentTime