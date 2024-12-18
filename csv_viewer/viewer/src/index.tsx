import * as React from 'react'
import App from './App'
import { createRoot } from 'react-dom/client'

const urlParams = new URLSearchParams(window.location.search)
const filePath = urlParams.get('path')
const width = urlParams.get('width')
const height = urlParams.get('height')
const theme = urlParams.get('theme')
const lang = urlParams.get('lang')

const root = createRoot(document.getElementById('root'))

root.render(<App />)
