import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from '../store'
import  App from '../App'

let booted = false

window.eagle.onPluginCreate(() => {
  // 二重に呼ばれているので対策・原因不明
  if (booted) {
    return
  }
  const root = createRoot(document.getElementById('root'))
  root.render(
    <Provider store={store}>
      <App />
    </Provider>
  )
})