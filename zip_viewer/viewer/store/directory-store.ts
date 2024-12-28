import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface DirectoryState {
  structure: object
  currentDirectory: null | object
  currentHoverEntryName: null | string
}

const initialState = {
  structure: {},
  currentDirectory: null,
  currentHoverEntryName: null,
}

const directorySlice = createSlice({
  name: 'directory',
  initialState,
  reducers: {
    setStructure: (state, action: PayloadAction<object>) => {
      state.structure = action.payload
    },
    setCurrentDirectory: (state, action: PayloadAction<object>) => {
      state.currentDirectory = action.payload
    },
    setCurrentHoverEntry: (state, action: PayloadAction<string>) => {
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
