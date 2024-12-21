
const ActionTypes = {
  CHANGE_VOLUME: 'CHANGE_VOLUME'
}

const initialState = {
  volume: 1,
}

export const changeVolume = volume => ({
  type: ActionTypes.CHANGE_VOLUME,
  payload: { volume }
})

const audioStore = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.CHANGE_VOLUME:
      return {
        ...state,
        volume: action.payload.volume,
      }
    default:
      return state
  }
}

export default audioStore