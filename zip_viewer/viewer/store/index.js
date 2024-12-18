import { configureStore } from '@reduxjs/toolkit'
import directoryStore from './directory-store.js'

const index = configureStore({
  reducer: {
    directory: directoryStore,
  },
})

export default index