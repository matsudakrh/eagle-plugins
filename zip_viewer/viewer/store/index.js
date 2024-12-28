import { configureStore } from '@reduxjs/toolkit'
import directoryStore from './directory-store'
import audioStore from './audio-store'

const store = configureStore({
  reducer: {
    directory: directoryStore,
    audio: audioStore,
  },
})

export default store
