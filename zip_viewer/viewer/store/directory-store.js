import { getFolderStructure } from '../lib/zip-tree'
import _ from 'lodash'
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  structure: {},
  currentDirectory: null,
  currentHoverEntryName: null,
}

const directorySlice = createSlice({
  name: 'directory',
  initialState,
  reducers: {
    setStructure: (state, action) => {
      state.structure = action.payload
    },
    setCurrentDirectory: (state, action) => {
      state.currentDirectory = action.payload
    },
    setCurrentHoverEntry: (state, action) => {
      state.currentHoverEntryName = action.payload
    },
  }
})

export const {
  setStructure,
  setCurrentDirectory,
  setCurrentHoverEntry,
} = directorySlice.actions

export default directorySlice.reducer
