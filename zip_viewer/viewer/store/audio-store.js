import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  volume: 1,
}

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    changeVolume: (state, action)  => {
      state.volume = action.payload
    },
  },
})

export const { changeVolume } = audioSlice.actions

export default audioSlice.reducer
