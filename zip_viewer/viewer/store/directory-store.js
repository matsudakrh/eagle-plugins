import { setFolderStructure } from '../lib/zip-tree'
import _ from 'lodash'

const ActionTypes = {
  SET_STRUCTURE: 'SET_STRUCTURE',
  SET_CURRENT_DIRECTORY: 'SET_CURRENT_DIRECTORY',
  CURRENT_HOVER_ENTRY: 'CURRENT_HOVER_ENTRY',
}

const initialState = {
  structure: {},
  entries: [],
  currentDirectory: null,
  currentHoverEntryName: null,
}

export const setStructure = (entries => ({
  type: ActionTypes.SET_STRUCTURE,
  payload: {
    structure: setFolderStructure(entries),
  },
}))

export const setCurrentDirectory = (directory => ({
  type: ActionTypes.SET_CURRENT_DIRECTORY,
  payload: {
    directory,
  }
}))

export const setCurrentHoverEntry = (name => ({
  type: ActionTypes.CURRENT_HOVER_ENTRY,
  payload: {
    name
  }
}))

const directoryStore = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_STRUCTURE:
      state = {
        ...state,
        entries: action.payload.entries,
        structure: action.payload.structure
      }
      return state
    case ActionTypes.SET_CURRENT_DIRECTORY:
      state = {
        ...state,
        currentDirectory: {
          ..._.cloneDeep(action.payload.directory),
        }
      }
      return state
    case ActionTypes.CURRENT_HOVER_ENTRY:
      state = {
        ...state,
        currentHoverEntryName: action.payload.name,
      }
      return state
    default:
      return state
  }
}

export default directoryStore