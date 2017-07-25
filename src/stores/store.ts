import { BoardStoreState, boardStore, Action } from './board.store';
import ConfigurationUtils from '../utils/configuration-utils';

const { createStore, applyMiddleware } = require('redux');

export function reduxMulti(store: MultiStore) {
  return (next: (action: {}) => {}) => (action: {}) =>
    Array.isArray(action)
      ? action.filter(Boolean).map(act => store.dispatch(act))
      : next(action);
}

interface MultiStore {
    dispatch: (action: {}) => {};
}

export interface Store {
    boardStore: BoardStoreState;
}

let storeApp = (state: Store = {} as Store, action: Action): Store => {
    return {
        boardStore: boardStore(state.boardStore, action)
    };
};

const createStoreWithMiddleware = applyMiddleware(reduxMulti)(createStore);

export let store = createStoreWithMiddleware(storeApp);

export function areLayersVisible(state: Store = {} as Store): boolean[] {
    let arr: boolean[] = [];
    let boardState = state.boardStore.boards[ConfigurationUtils.DrawingBoardId];

    for (let i = 0; i < boardState.collection.getNumberOfLayers(); i++) {
        arr.push(boardState.collection.getLayer(i).isVisible());
    }

    return arr;
}