import { configureStore } from '@reduxjs/toolkit';
import directoryReducer from './directory-reducer.js'

const store = configureStore({
  reducer: {
    directory: directoryReducer,
  }
})

export default store