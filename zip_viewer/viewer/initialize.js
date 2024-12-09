import { default as pdfjsDist } from 'pdfjs'

pdfjsDist.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdf.worker@1.0.0/pdf.worker.min.js'

window.components = {}
window.pages = {}