
const drawWave = async (audioBuffer, waveformCanvas) => {
  if (!audioBuffer) return

  const SelectStyle = getComputedStyle(document.body)
  const color = String(SelectStyle.getPropertyValue('--color')).trim()
  const canvasContext = waveformCanvas.getContext('2d')
  const parentElement = waveformCanvas.closest('*:not(canvas)')
  const width = parentElement.getBoundingClientRect().width
  const height = parentElement.getBoundingClientRect().height
  waveformCanvas.width = width
  waveformCanvas.height = height
  canvasContext.clearRect(0, 0, width, height)

  const draw = async (channel) => {
    // 左右のチャンネルから音量データを取得
    const rawData = audioBuffer.getChannelData(channel)

    // // 波形データを取得する
    const step = Math.ceil(rawData.length / width)
    const amp = height / 2

    canvasContext.beginPath()
    canvasContext.moveTo(0, amp)

    // 波形データを描画
    for (let i = 0; i < width; i++) {
      const min = Math.min(...rawData.slice(i * step, (i + 1) * step))
      const max = Math.max(...rawData.slice(i * step, (i + 1) * step))

      // 波形の最高点と最低点を描画
      // 左右で上下を分ける
      const yMin = channel === 0 ?  ((min) * amp) + amp : amp
      const yMax = channel === 1 ? ((max) * amp) + amp : amp

      canvasContext.lineTo(i, yMin)
      canvasContext.lineTo(i, yMax)
    }

    canvasContext.strokeStyle = color
    canvasContext.lineWidth = 1
    canvasContext.stroke()
  }

  draw(0)
  draw(1)
}

module.exports = drawWave