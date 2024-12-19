import { configureStore } from '@reduxjs/toolkit'
import directoryStore from './directory-store.js'

const store = configureStore({
  reducer: {
    directory: directoryStore,
  },
})

export default store