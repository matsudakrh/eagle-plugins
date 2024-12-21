import { useDispatch, useSelector } from 'react-redux'
import { changeVolume } from '../../store/audio-store'
import React from 'react'

const VolumeBar = () => {
  const volume = useSelector(root => root.audio.volume)
  const disoatch = useDispatch()

  return (
    <input
      type="range"
      className="inputRange"
      value={volume}
      max="1"
      step="0.01"
      onChange={e => {
        disoatch(changeVolume(e.target.value))
        const activeColor = "#6dd5ff";
        const inactiveColor = "#dddddd";
        const ratio = (e.target.value - e.target.min) / (e.target.max - e.target.min) * 100
        e.target.style.background = `linear-gradient(90deg, ${activeColor} ${ratio}%, ${inactiveColor} ${ratio}%)`
      }}
    />
  )
}

export default VolumeBar