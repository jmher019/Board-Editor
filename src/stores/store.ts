import { BoardState, boardStore, Action } from './board.store';

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
    board: BoardState;
}

let storeApp = (state: Store = {} as Store, action: Action): Store => {
    return {
        board: boardStore(state.board, action)
    };
};

const createStoreWithMiddleware = applyMiddleware(reduxMulti)(createStore);

export let store = createStoreWithMiddleware(storeApp);

export function areLayersVisible(state: Store = {} as Store): boolean[] {
    let arr: boolean[] = [];
    
    for (let i = 0; i < state.board.collection.getNumberOfLayers(); i++) {
        arr.push(state.board.collection.getLayer(i).isVisible());
    }

    return arr;
}