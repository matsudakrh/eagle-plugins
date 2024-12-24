import { configureStore } from '@reduxjs/toolkit'
import directoryStore from './directory-store.js'
import audioStore from './audio-store'
import rootStore from './root'

const store = configureStore({
  reducer: {
    root: rootStore,
    directory: directoryStore,
    audio: audioStore,
  },
})

export default store