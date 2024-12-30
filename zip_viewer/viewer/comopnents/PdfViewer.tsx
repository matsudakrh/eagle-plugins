import React, { useEffect, useLayoutEffect, useRef, useState, memo, useMemo } from 'react'
import { useKey } from 'react-use'
import * as pdfjsDist from 'pdfjs-dist'
import fs from 'fs'
import resizeThumbnail from '../lib/resize-thumbnail'

// ページを都度描画するとテンポが悪いので前後何枚かを描画しておきたい
// あるいは全ページを一気にレンダリングしてサムネ一覧などと兼ねる

pdfjsDist.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdf.worker@1.0.0/pdf.worker.min.js'

const PdfViewer: React.FC<{ buffer: Buffer }> = memo(({ buffer }) => {
  const canvas = useRef(null)
  const [generated, setGenerated] = useState(false)
  const [pdf, setPdf] = useState<pdfjsDist.PDFDocumentProxy>()
  const filePath = useMemo(() => {
    const tmpPath = window.eagle.os.tmpdir()
    return `${tmpPath}/${window.crypto.randomUUID()}.pdf`
  }, [])
  const [currentPage, setCurrentPage] = useState(1)

  const handlePreview = () => {
    if (!buffer) {
      return
    }

    if (generated) {
      window.eagle.shell.openPath(filePath)
      return
    }

    fs.promises.writeFile(
      filePath,
      buffer,
    ).then(() => {
      setGenerated(true)
      window.eagle.shell.openPath(filePath)
    }).catch((error) => {
      console.log('coewew', error)
    })
  }

  const handleContextMenu = () => {
    window.eagle.contextMenu.open([
      {
        id: 'preview',
        label: 'プレビューで開く',
        click: handlePreview,
      },
      {
        id: 'thumbnail',
        label: 'サムネイルに設定',
        click: async () => {
          let item = (await window.eagle.item.getSelected())[0]
          const image = canvas.current.toDataURL('image/png')

          resizeThumbnail(Buffer.from(image.replace('data:image\/png;base64,', ''), 'base64'), (buffer) => {
            const tmpPath = window.eagle.os.tmpdir()
            const filePath = `${tmpPath}/${window.crypto.randomUUID()}.png`
            fs.promises.writeFile(
              filePath,
              buffer.toString('base64'),
              { encoding: 'base64' },
            ).then(() => {
              item.setCustomThumbnail(filePath).then((result) => {
                console.log('result =>  ', result)
              }).catch((error) => {
                console.log(error)
              })
            }).catch((error) => {
              console.log(error)
            })
          })
        }
      }
    ])
  }

  useLayoutEffect(() => {
    if (!canvas.current) {
      return
    }

    // cmapは静的アセットを読み込む方法もあるので検討
    /// https://zenn.dev/dynagon/articles/c00a3b5ac39103
    const loader = pdfjsDist.getDocument({
      data: buffer,
      cMapUrl: 'https://unpkg.com/pdfjs-dist@3.1.81/cmaps/',
      cMapPacked: true,
    })
    loader.promise.then((result) => {
      setPdf(result)
    })
  }, [canvas])

  useEffect(() => {
    if (!pdf) {
      return
    }
    const render = async () => {
      const page = await pdf.getPage(currentPage)
      /// 4倍でも荒くなるPDFがあったため大きくしておく
      const scale = 8
      const viewport = page.getViewport({ scale })

      canvas.current.style.width = null
      canvas.current.style.height = null
      canvas.current.height = viewport.height
      canvas.current.width = viewport.width

      const renderContext = {
        canvasContext: canvas.current.getContext('2d'),
        viewport: viewport
      }
      return page.render(renderContext)
    }

    render()
  }, [pdf, currentPage])

  useKey('ArrowDown', () => {
    if (pdf.numPages < currentPage + 1) {
      return
    }
    setCurrentPage(currentPage + 1)
  }, {}, [pdf, currentPage])

  useKey('ArrowUp', () => {
    if (currentPage === 1) {
      return
    }
    setCurrentPage(currentPage - 1)
  }, {}, [pdf, currentPage])

  return <canvas
    ref={canvas}
    onContextMenu={handleContextMenu}
    style={{
      display: 'block',
      margin: 'auto',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      maxWidth: '100%',
      maxHeight: '100%',
    }}
  ></canvas>
})

export default PdfViewer