const ActionTypes = {
  OPEN_DIRECTORY: 'OPEN_DIRECTORY'
}

const initialState = {
  directoryPrefix: '',
  index: 0,
}

export const openDirectory = (payload => ({
  type: ActionTypes.OPEN_DIRECTORY,
  payload,
}))

const directoryReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.OPEN_DIRECTORY:
      state = {
        ...state,
        directoryPrefix: action.payload.directoryPrefix,
        index: action.payload.index < 0 ? 0 : action.payload.index
      }
      return state
    default:
      return state
  }
}

export default directoryReducer