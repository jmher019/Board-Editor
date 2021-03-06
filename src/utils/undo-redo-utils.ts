import Tile from '../board-editor-modules/layer/image-tile';
import TileLayer from '../board-editor-modules/layer/tile-layer';
import ConfigurationUtils from './configuration-utils';
import { store } from '../stores/store';
import { removeLayer, insertLayer, setLayer, moveLayer, setWidth, setHeight,
    toggleVisibility, selectLayer, setTile, Action, overrideTileLayerCollection
} from '../stores/board.store';

export const ADD_LAYER = 'ADD_LAYER';
export const REMOVE_LAYER = 'REMOVE_LAYER';
export const SET_LAYER = 'SET_LAYER';
export const INSERT_LAYER = 'INSERT_LAYER';
export const MOVE_LAYER = 'MOVE_LAYER';
export const CHANGE_SIZE = 'CHANGE_SIZE';
export const TOGGLE_VISIBILITY = 'TOGGLE_VISIBILITY';
export const SELECT_LAYER = 'SELECT_LAYER';
export const DRAW = 'DRAW';
export const DRAW_START = 'DRAW_START';

export interface EditAction {
    type: string;
    tile: Tile;
    layer: TileLayer | null;
    x: number;
    y: number;
    layerIndex: number;
    layerIndexDest: number;
    bucketFill: boolean;
    toggleBucketFill: boolean;
    toggleErase: boolean;
    togglePicker: boolean;
    toggleGrid: boolean;
    layerWidth: number;
    layerHeight: number;
}

export default class EditUtils {
    public static maxSize: number = ConfigurationUtils.undoStackMaxSize;
    public static undo: EditAction[] = [];
    public static redo: EditAction[] = [];
    private static layerActions: Action[] = [];

    public static pushAction(action: EditAction): void {
        if (this.undo.length > EditUtils.maxSize) {
            EditUtils.undo.splice(0, 1);
        }
        EditUtils.undo.push(action);
        EditUtils.clearRedoStack();
    }

    public static clearStacks(): void {
        EditUtils.clearUndoStack();
        EditUtils.clearRedoStack();
    }

    public static clearUndoStack(): void {
        EditUtils.undo = [];
    }

    public static clearRedoStack(): void {
        EditUtils.redo = [];
    }

    public static undoAction(): void {
        let action = EditUtils.undo.splice(EditUtils.undo.length - 1, 1)[0];
        let drawingBoardState = store.getState().boardStore.boards[ConfigurationUtils.DrawingBoardId];
        if (action) {
            switch (action.type) {
                case ADD_LAYER:
                    let layer = drawingBoardState.collection.getLayer(action.layerIndex);
                    store.dispatch(removeLayer(action.layerIndex));
                    action.layer = layer;
                    break;
                case REMOVE_LAYER:
                    store.dispatch(insertLayer(action.layerIndex, action.layer as TileLayer));
                    action.layer = null;
                    break;
                case SET_LAYER:
                    layer = drawingBoardState.collection.getLayer(action.layerIndex);
                    store.dispatch(setLayer(action.layerIndex, action.layer as TileLayer));
                    action.layer = layer;
                    break;
                case INSERT_LAYER:
                    layer = drawingBoardState.collection.getLayer();
                    store.dispatch(removeLayer(action.layerIndex));
                    action.layer = layer;
                    break;
                case MOVE_LAYER:
                    store.dispatch(moveLayer(action.layerIndexDest, action.layerIndex));
                    break;
                case CHANGE_SIZE:
                    let layerWidth = drawingBoardState.collection.getLayerWidth();
                    let layerHeight = drawingBoardState.collection.getLayerHeight();
                    EditUtils.layerActions.push(setWidth(action.layerWidth) as Action);
                    EditUtils.layerActions.push(setHeight(action.layerHeight) as Action);
                    store.dispatch(EditUtils.layerActions);
                    EditUtils.layerActions = [];
                    action.layerHeight = layerHeight;
                    action.layerWidth = layerWidth;
                    break;
                case TOGGLE_VISIBILITY:
                    store.dispatch(toggleVisibility(action.layerIndex));
                    break;
                case SELECT_LAYER:
                    store.dispatch(selectLayer(action.layerIndex));
                    break;
                case DRAW:
                    if (action.bucketFill) {
                        let clonedLayer = drawingBoardState.collection.getLayer(action.layerIndex).clone();
                        store.dispatch(setLayer(action.layerIndex, action.layer as TileLayer));
                        action.layer = clonedLayer;
                    } else {
                        let tile = drawingBoardState.collection.getLayer(action.layerIndex)
                            .getTile(action.x, action.y).clone();
                        if (!EditUtils.undo[EditUtils.undo.length - 1] ||
                            EditUtils.undo[EditUtils.undo.length - 1].type !== DRAW) {
                            EditUtils.layerActions.push(setTile(action.tile, action.x, action.y,
                                                                action.layerIndex, action.bucketFill) as Action);
                            store.dispatch(EditUtils.layerActions);
                            EditUtils.layerActions = [];
                        } else {
                            EditUtils.layerActions.push(setTile(action.tile, action.x, action.y,
                                                                action.layerIndex, action.bucketFill) as Action);
                        }
                        action.tile = tile;
                    }
                    break;
                case DRAW_START:
                    break;
                default:
                    break;
            }

            EditUtils.redo.push(action);
            if (action.type === DRAW && EditUtils.undo[EditUtils.undo.length - 1] &&
                (EditUtils.undo[EditUtils.undo.length - 1].type === DRAW ||
                EditUtils.undo[EditUtils.undo.length - 1].type === DRAW_START)) {
                EditUtils.undoAction();
            } else if (action.type === DRAW_START) {
                store.dispatch(overrideTileLayerCollection(drawingBoardState.collection.clone()));
            }
        }
    }

    public static redoAction(): void {
        let action = EditUtils.redo.splice(EditUtils.redo.length - 1, 1)[0];
        let drawingBoardState = store.getState().boardStore.boards[ConfigurationUtils.DrawingBoardId];
        if (action) {
            switch (action.type) {
                case ADD_LAYER:
                    store.dispatch(insertLayer(action.layerIndex, action.layer as TileLayer));
                    action.layer = null;
                    break;
                case REMOVE_LAYER:
                    let layer = drawingBoardState.collection.getLayer(action.layerIndex);
                    store.dispatch(removeLayer(action.layerIndex));
                    action.layer = layer;
                    break;
                case SET_LAYER:
                    layer = drawingBoardState.collection.getLayer(action.layerIndex);
                    store.dispatch(setLayer(action.layerIndex, action.layer as TileLayer));
                    action.layer = layer;
                    break;
                case INSERT_LAYER:
                    store.dispatch(insertLayer(action.layerIndex, action.layer as TileLayer));
                    action.layer = null;
                    break;
                case MOVE_LAYER:
                    store.dispatch(moveLayer(action.layerIndex, action.layerIndexDest));
                    break;
                case CHANGE_SIZE:
                    let layerWidth = drawingBoardState.collection.getLayerWidth();
                    let layerHeight = drawingBoardState.collection.getLayerHeight();
                    EditUtils.layerActions.push(setWidth(action.layerWidth) as Action);
                    EditUtils.layerActions.push(setHeight(action.layerHeight) as Action);
                    store.dispatch(EditUtils.layerActions);
                    EditUtils.layerActions = [];
                    action.layerHeight = layerHeight;
                    action.layerWidth = layerWidth;
                    break;
                case TOGGLE_VISIBILITY:
                    store.dispatch(toggleVisibility(action.layerIndex));
                    break;
                case SELECT_LAYER:
                    store.dispatch(selectLayer(action.layerIndexDest));
                    break;
                case DRAW:
                    if (action.bucketFill) {
                        let clonedLayer = drawingBoardState.collection.getLayer(action.layerIndex).clone();
                        store.dispatch(setLayer(action.layerIndex, action.layer as TileLayer));
                        action.layer = clonedLayer;
                    } else {
                        let tile = drawingBoardState.collection.getLayer(action.layerIndex)
                            .getTile(action.x, action.y).clone();
                        if (!EditUtils.redo[EditUtils.undo.length - 1] ||
                            EditUtils.redo[EditUtils.undo.length - 1].type !== DRAW) {
                            EditUtils.layerActions.push(setTile(action.tile, action.x, action.y,
                                                                action.layerIndex, action.bucketFill) as Action);
                            store.dispatch(EditUtils.layerActions);
                            EditUtils.layerActions = [];
                        } else {
                            EditUtils.layerActions.push(setTile(action.tile, action.x, action.y,
                                                                action.layerIndex, action.bucketFill) as Action);
                        }
                        action.tile = tile;
                    }
                    break;
                case DRAW_START:
                    break;
                default:
                    break;
            }

            EditUtils.undo.push(action);
            if ((action.type === DRAW && EditUtils.redo[EditUtils.redo.length - 1] &&
                EditUtils.redo[EditUtils.redo.length - 1].type === DRAW) ||
                action.type === DRAW_START) {
                EditUtils.redoAction();
            } else if (action.type === DRAW) {
                store.dispatch(overrideTileLayerCollection(drawingBoardState.collection.clone()));
            }
        }
    }
}