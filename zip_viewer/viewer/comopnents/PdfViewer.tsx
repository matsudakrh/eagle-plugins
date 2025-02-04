import React, { useEffect, useLayoutEffect, useRef, useState, memo, useMemo } from 'react'
import { useKey } from 'react-use'
import * as pdfjsDist from 'pdfjs-dist'
import fs from 'fs'
import { Entry } from 'yauzl'
import resizeThumbnail from '../lib/resize-thumbnail'
import AppParameters from '../lib/app-parameters'
import styles from './PdfViewer.module.scss'
import { saveThumbnail } from '../lib/entry-thumbnails'

// ページを都度描画するとテンポが悪いので前後何枚かを描画しておきたい
// あるいは全ページを一気にレンダリングしてサムネ一覧などと兼ねる

pdfjsDist.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdf.worker@1.0.0/pdf.worker.min.js'

const PdfViewer: React.FC<{ buffer: Buffer; entry: Entry }> = memo(({ buffer, entry }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [generated, setGenerated] = useState<boolean>(false)
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
        id: 'thumbnailZIP',
        label: 'ZIPのサムネイルに設定',
        click: async () => {
          let item = await window.eagle.item.getById(AppParameters.identify)
          const image = canvasRef.current.toDataURL('image/png')

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
      },
      {
        id: 'thumbnailPDF',
        label: 'ファイルのサムネイルに設定',
        click() {
          const image = canvasRef.current.toDataURL('image/png')

          resizeThumbnail(Buffer.from(image.replace('data:image\/png;base64,', ''), 'base64'), (buffer) => {
            return saveThumbnail(entry.encodedFileName, buffer)
          })
        }
      },
    ])
  }

  useLayoutEffect(() => {
    if (!canvasRef.current) {
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
  }, [canvasRef])

  useEffect(() => {
    if (!pdf) {
      return
    }
    const render = async () => {
      const page = await pdf.getPage(currentPage)
      const scale = 4
      const viewport = page.getViewport({ scale })

      canvasRef.current.style.width = null
      canvasRef.current.style.height = null
      canvasRef.current.height = viewport.height
      canvasRef.current.width = viewport.width

      const renderContext = {
        canvasContext: canvasRef.current.getContext('2d'),
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
    ref={canvasRef}
    onContextMenu={handleContextMenu}
    className={styles.canvas}
  ></canvas>
})

export default PdfViewer