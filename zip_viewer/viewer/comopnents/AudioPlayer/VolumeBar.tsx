import React from 'react'
import { changeVolume } from '../../store/audio-store'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'

const VolumeBar = () => {
  const volume = useAppSelector(root => root.audio.volume)
  const disoatch = useAppDispatch()

  return (
    <input
      type="range"
      className="inputRange"
      value={volume}
      max="1"
      step="0.01"
      onChange={e => {
        const value = Number.parseFloat(e.target.value)
        disoatch(changeVolume(value))
        const activeColor = "#6dd5ff";
        const inactiveColor = "#dddddd";
        const ratio = value * 100
        e.target.style.background = `linear-gradient(90deg, ${activeColor} ${ratio}%, ${inactiveColor} ${ratio}%)`
      }}
    />
  )
}

export default VolumeBar