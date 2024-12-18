onmessage = (event) => {
  // const audioContext = new AudioContext()
  const { width, height, rawData } = event.data

  const data = [[], []]
  const amp = height / 2

  const draw = (channel) => {
    const rawDatum = rawData[channel]
    const step = Math.ceil(rawDatum.length / width)

    // 波形データを描画
    for (let i = 0; i < width; i++) {
      const min = Math.min(...rawDatum.slice(i * step, (i + 1) * step))
      const max = Math.max(...rawDatum.slice(i * step, (i + 1) * step))

      // 波形の最高点と最低点を描画
      // 左右で上下を分ける
      const yMin = channel === 0 ?  ((min) * amp) + amp : amp
      const yMax = channel === 1 ? ((max) * amp) + amp : amp

      data[channel][i] = [yMin, yMax]
    }
  }
  draw(0)
  draw(1)
  postMessage(data)
}