import { configureStore } from '@reduxjs/toolkit'
import directoryStore from './directory-store.js'

const store = configureStore({
  reducer: {
    directory: directoryStore,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      /// Entryをstoreへいれる為の設定
      serializableCheck: false,
    }),
})

export default store