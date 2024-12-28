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

// Get the type of our store variable
export type AppStore = typeof store
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = AppStore['dispatch']