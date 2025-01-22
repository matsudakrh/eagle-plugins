import React, { useLayoutEffect, useState } from 'react'

const CurrentTime: React.FC<{ audio: HTMLAudioElement | null }> = ({ audio }) => {
  const [currentTime, setCurrentTime] = useState(0)

  useLayoutEffect(() => {
    if (!audio) {
      return
    }
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime)
    })
  }, [audio])

  return <div>
    {currentTime || currentTime === 0.0
      ? `${`${Math.trunc(currentTime / 60)}`.padStart(2, '0')}:${`${Math.ceil(currentTime % 60)}`.padStart(2, '0')}`
      : '--:--'} / {
    audio?.duration
      ? `${`${Math.trunc(audio?.duration / 60)}`.padStart(2, '0')}:${`${Math.ceil(audio?.duration % 60)}`.padStart(2, '0')}`
      : '--:--'
  }
  </div>
}

export default CurrentTime
