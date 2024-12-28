import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AudioState {
  volume: number
}

const initialState: AudioState = {
  volume: 1,
}

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    changeVolume: (state, action: PayloadAction<number>)  => {
      state.volume = action.payload
    },
  },
})

export const { changeVolume } = audioSlice.actions

export default audioSlice.reducer
