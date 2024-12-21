import { configureStore } from '@reduxjs/toolkit'
import directoryStore from './directory-store.js'
import audioStore from './audio-store'

const store = configureStore({
  reducer: {
    directory: directoryStore,
    audio: audioStore,
  },
})

export default store