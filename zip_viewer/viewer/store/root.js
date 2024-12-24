const ActionTypes = {
  SET_IDENTIFY: 'SET_IDENTIFY'
}

const initState = {
  identify: ''
}

export const setIdentify = (identify) => ({
  type: ActionTypes.SET_IDENTIFY,
  payload: { identify }
})

const rootStore = (state = initState, action) => {
  switch (action.type) {
    case ActionTypes.SET_IDENTIFY:
      state = {
        ...state,
        identify: action.payload.identify,
      }
      return  state
    default:
      return state
  }
}

export default rootStore