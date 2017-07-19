import TileLayerCollection, { TileLayerCollectionOptions } from '../board-editor-modules/layer/tile-layer-collection';
import { Vector } from '../utils/math-utils';
import TileLayer from '../board-editor-modules/layer/tile-layer';
import ImageMap from '../utils/image-map';
import Tile, { TileOptions } from '../board-editor-modules/layer/image-tile';
import EditUtils, { EditAction } from '../utils/undo-redo-utils';

/**
 * Tile Collection ACTIONS
 */

export interface TileCollectionAction {
    type: string;
    index: number;
    layer: TileLayer;
    indexStart: number;
    indexDest: number;
    width: number;
    height: number;
    collection: TileLayerCollection;
}

const ADD_LAYER = 'ADD_LAYER';
const REMOVE_LAYER = 'REMOVE_LAYER';
const SET_LAYER = 'SET_LAYER';
const INSERT_LAYER = 'INSERT_LAYER';
const MOVE_LAYER = 'MOVE_LAYER';
const SET_WIDTH = 'SET_WIDTH';
const SET_HEIGHT = 'SET_HEIGHT';
const TOGGLE_VISIBILITY = 'TOGGLE_VISIBILITY';
const SELECT_LAYER = 'SELECT_LAYER';
const OVERRIDE_TILE_LAYER_COLLECTION = 'OVERRIDE_TILE_LAYER_COLLECTION';

export let addLayer = (): TileCollectionAction => {
    return {
        type: ADD_LAYER
    } as TileCollectionAction;
};

export let removeLayer = (index: number): TileCollectionAction => {
    return {
        type: REMOVE_LAYER,
        index
    } as TileCollectionAction;
};

export let setLayer = (index: number, layer: TileLayer): TileCollectionAction => {
    return {
        type: SET_LAYER,
        index,
        layer
    } as TileCollectionAction;
};

export let insertLayer = (index: number, layer: TileLayer): TileCollectionAction => {
    return {
        type: INSERT_LAYER,
        index,
        layer
    } as TileCollectionAction;
};

export let moveLayer = (indexStart: number, indexDest: number): TileCollectionAction => {
    return {
        type: MOVE_LAYER,
        indexStart,
        indexDest
    } as TileCollectionAction;
};

export let setWidth = (width: number): TileCollectionAction => {
    return {
        type: SET_WIDTH,
        width
    } as TileCollectionAction;
};

export let setHeight = (height: number): TileCollectionAction => {
    return {
        type: SET_HEIGHT,
        height
    } as TileCollectionAction;
};

export let toggleVisibility = (index: number): TileCollectionAction => {
    return {
        type: TOGGLE_VISIBILITY,
        index
    } as TileCollectionAction;
};

export let selectLayer = (index: number): TileCollectionAction => {
    return {
        type: SELECT_LAYER,
        index
    } as TileCollectionAction;
};

export let overrideTileLayerCollection = (collection: TileLayerCollection): TileCollectionAction => {
    return {
        type: OVERRIDE_TILE_LAYER_COLLECTION,
        collection
    } as TileCollectionAction;
};

/**
 * END OF Tile Collection ACTIONS
 */

/**
 * Image Map ACTIONS
 */

const PUT_IMAGE = 'PUT_IMAGE';

export interface ImageMapAction {
    img: HTMLImageElement;
    key: string;
}

export function putImage(img: HTMLImageElement, key: string): ImageMapAction {
    return {
        type: PUT_IMAGE,
        img,
        key
    } as ImageMapAction;
}

/**
 * END OF Image Map ACTIONS
 */

/**
 * Drawing Tile ACTIONS
 */

const SET_DRAWING_TILE = 'SET_DRAWING_TILE';

export interface DrawingTileAction {
    type: string;
    tile: Tile;
}

export function setDrawingTile(tile: Tile): DrawingTileAction {
    return {
        type: SET_DRAWING_TILE,
        tile
    } as DrawingTileAction;
}

/**
 * END OF Drawing Tile ACTIONS
 */

/**
 * Enable Toggle ACTIONS
 */

const TOGGLE_GRID = 'TOGGLE_GRID';
const TOGGLE_ERASE = 'TOGGLE_ERASE';
const TOGGLE_PICKER = 'TOGGLE_PICKER';
const TOGGLE_BUCKET_FILL = 'TOGGLE_BUCKET_FILL';

export interface ToggleAction {
    type: string;
    toggleGrid: boolean;
    toggleErase: boolean;
    togglePicker: boolean;
    toggleBucketFill: boolean;
}

export function toggleGrid(toggleGrid: boolean): ToggleAction {
    return {
        type: TOGGLE_GRID,
        toggleGrid
    } as ToggleAction;
}

export function toggleErase(toggleErase: boolean): ToggleAction {
    return {
        type: TOGGLE_ERASE,
        toggleErase
    } as ToggleAction;
}

export function togglePicker(togglePicker: boolean): ToggleAction {
    return {
        type: TOGGLE_PICKER,
        togglePicker
    } as ToggleAction;
}

export function toggleBucketFill(toggleBucketFill: boolean): ToggleAction {
    return {
        type: TOGGLE_BUCKET_FILL,
        toggleBucketFill
    } as ToggleAction;
}

/**
 * END OF Toggle Grid ACTIONS
 */

/**
 * Layer Actions
 */

const SET_TILE = 'SET_TILE';

export interface LayerAction {
    type: string;
    tile: Tile;
    x: number;
    y: number;
    layerIndex: number;
    bucketFill: boolean;
}

export function setTile(tile: Tile, x: number, y: number, layerIndex: number, bucketFill: boolean): LayerAction {
    return {
        type: SET_TILE,
        tile,
        x,
        y,
        layerIndex,
        bucketFill
    } as LayerAction;
}

/**
 * REDUCERS
 */

export interface Action extends TileCollectionAction, ImageMapAction, DrawingTileAction, ToggleAction, LayerAction {
}

export interface BoardState {
    collection: TileLayerCollection;
    imageMap: ImageMap;
    drawingTile: Tile;
    gridEnabled: boolean;
    selectedLayer: number;
    eraseEnabled: boolean;
    pickerEnabled: boolean;
    bucketFillEnabled: boolean;
}

const boardInitialState = {
    collection: new TileLayerCollection({
        layerSize: new Vector(32, 32),
        tilePixelSize: new Vector(32, 32),
        numberOfLayers: 1
    } as TileLayerCollectionOptions),
    imageMap: new ImageMap(),
    drawingTile: new Tile({
        imageSrc: '',
        pixelSize: new Vector(32, 32),
        tileCoords: new Vector(0, 0)
    } as TileOptions),
    gridEnabled: true,
    selectedLayer: 0,
    eraseEnabled: false,
    pickerEnabled: false,
    bucketFillEnabled: false
} as BoardState;

export let boardStore = (state = boardInitialState, action: Action): BoardState => {
    let editAction: EditAction = {} as EditAction;
    switch (action.type) {
        case ADD_LAYER:
            state.collection.addLayer();
            break;
        case REMOVE_LAYER:
            state.collection.removeLayer(action.index);
            break;
        case SET_LAYER:
            state.collection.setLayer(action.index, action.layer);
            break;
        case INSERT_LAYER:
            state.collection.insertLayer(action.index, action.layer);
            break;
        case MOVE_LAYER:
            state.collection.moveLayer(action.indexStart, action.indexDest);
            break;
        case SET_WIDTH:
            editAction.layerWidth = state.collection.getLayerWidth();
            editAction.type = SET_WIDTH;
            state.collection.setLayerWidth(action.width);
            EditUtils.pushAction(editAction);
            break;
        case SET_HEIGHT:
            editAction.layerHeight = state.collection.getLayerHeight();
            editAction.type = SET_HEIGHT;
            state.collection.setLayerHeight(action.height);
            EditUtils.pushAction(editAction);
            break;
        case TOGGLE_VISIBILITY:
            state.collection.toggleLayerVisibility(action.index);
            break;
        case PUT_IMAGE:
            state.imageMap.put(action.key, action.img);
            break;
        case SET_DRAWING_TILE:
            state.drawingTile.setImageSrc(action.tile.getImageSrc());
            state.drawingTile.setTileX(action.tile.getTileX());
            state.drawingTile.setTileY(action.tile.getTileY());
            state.drawingTile.setPixelWidth(action.tile.getPixelWidth());
            state.drawingTile.setPixelHeight(action.tile.getPixelHeight());
            break;
        case TOGGLE_GRID:
            state.gridEnabled = action.toggleGrid;
            break;
        case TOGGLE_ERASE:
            state.eraseEnabled = action.toggleErase;
            if (state.eraseEnabled) {
                state.drawingTile.setImageSrc('')
                    .setTileX(0)
                    .setTileY(0);
            }
            break;
        case TOGGLE_PICKER:
            state.pickerEnabled = action.togglePicker;
            break;
        case TOGGLE_BUCKET_FILL:
            state.bucketFillEnabled = action.toggleBucketFill;
            break;
        case SELECT_LAYER:
            state.selectedLayer = action.index;
            break;
        case OVERRIDE_TILE_LAYER_COLLECTION:
            state.collection = action.collection;
            break;
        case SET_TILE:
            state.collection.getLayer(action.layerIndex).setTile(action.x, action.y, action.tile, action.bucketFill);
            break;
        default:
            break;
    }

    return state;
};

/**
 * END OF REDUCERS
 */